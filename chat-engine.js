import { PRODUCTS } from './catalog.js';

const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9€.,\s/+-]/g, ' ');
const money = s => {
  const x = String(s || '').replace(',', '.');
  const m = x.match(/(?:do|pod|max(?:imalno)?|budget)\s*(\d+(?:\.\d+)?)\s*(?:€|eur)?/i) || x.match(/(\d+(?:\.\d+)?)\s*(?:€|eur)\b/i);
  return m ? +m[1] : null;
};
const area = s => {
  const m = String(s || '').replace(',', '.').match(/(\d+(?:\.\d+)?)\s*(?:m2|m²|m\b)/i);
  return m ? +m[1] : null;
};
const loc = s => {
  const x = norm(s);
  return [
    ['celje','Celje'],['cellje','Celje'],['celju','Celje'],['maribor','Maribor'],['ljubljana','Ljubljana'],
    ['ptuj','Ptuj'],['velenje','Velenje'],['kranj','Kranj'],['koper','Koper'],['murska sobota','Murska Sobota'],['novo mesto','Novo mesto']
  ].find(([k]) => x.includes(k))?.[1] || null;
};

export function freshState() {
  return {intent:null,space:null,area:null,mounting:null,budget:null,count:null,location:null,service:null,selected:null,step:'intent',productRequested:false,needs:[],safety:false,confidence:0,questionCount:0,safetyReason:null};
}

export function extract(text, s) {
  const t = norm(text);
  if (/elektricar|mojster/.test(t)) s.service = s.service || 'Električar';
  if (/montaz|namest|zmont/.test(t)) s.service = s.service || 'Montaža/namestitev';
  if (/kupiti|kupujem|izdelek|material|l[uc]c|svetil|plafonj|panel|zarnic|vticnic|stikal|varovalk|kabel/.test(t)) s.productRequested = true;
  if (/l[uc]c|svetil|plafonj|panel|zarnic|led|razsvet/.test(t)) s.intent = 'svetilo';
  if (/vticnic|vtič/.test(t)) s.intent = 'vtičnica';
  if (/stikal/.test(t)) s.intent = 'stikalo';
  if (/varovalk|fid|rcd|zascit/.test(t)) s.intent = 'zaščita';
  if (/kabel|vodnik/.test(t)) s.intent = 'kabel';
  if (/kopalnic/.test(t)) s.space='kopalnica';
  else if (/dnevni|dnevna/.test(t)) s.space='dnevna soba';
  else if (/spalnic/.test(t)) s.space='spalnica';
  else if (/kuhinj/.test(t)) s.space='kuhinja';
  else if (/hodnik/.test(t)) s.space='hodnik';
  else if (/garaz/.test(t)) s.space='garaža';
  else if (/pisarn/.test(t)) s.space='pisarna';
  const a = area(text); if (a) s.area = a;
  const b = money(text); if (b) s.budget = b;
  const q = t.match(/\b(\d+)\s*(?:kos|kosi|kom|komad|komadi|svetilk|vticnic|stikal)\b/); if (q) s.count=+q[1];
  if (/stropn/.test(t)) s.mounting='stropno';
  if (/stens/.test(t)) s.mounting='stensko';
  if (/topl|3000/.test(t) && !s.needs.includes('topla svetloba')) s.needs.push('topla svetloba');
  if (/nevtral|4000/.test(t) && !s.needs.includes('nevtralna svetloba')) s.needs.push('nevtralna svetloba');
  if (/hlad|6000/.test(t) && !s.needs.includes('hladna svetloba')) s.needs.push('hladna svetloba');
  const l = loc(text); if (l) s.location=l;
  const safetyPatterns = [
    ['iskr|iskren','iskrenje'],['zazg|zgan|po zgan','vonj po zažganem'],['dim','dim'],['pregr|vroca|vroce','pregrevanje'],
    ['230\\s*v','230 V'],['odpir|razdelil','poseg v razdelilnik'],['priklop|vezav','priklop/vezava'],['varovalk','varovalke'],['fid|rcd','FID/RCD'],['kabel','električna instalacija']
  ];
  for (const [rx, reason] of safetyPatterns) if (new RegExp(rx).test(t)) { s.safety=true; s.safetyReason=reason; }
  return s;
}

export function recommend(s) {
  let p = PRODUCTS.filter(x => {
    if (s.intent==='svetilo' && !['Svetila','Žarnice'].includes(x.category)) return false;
    if (s.intent==='svetilo' && s.mounting && x.category!=='Svetila') return false;
    if (s.intent==='vtičnica' && x.category!=='Vtičnice') return false;
    if (s.intent==='stikalo' && x.category!=='Stikala') return false;
    if (s.intent==='zaščita' && x.category!=='Zaščita') return false;
    if (s.intent==='kabel' && x.category!=='Kabli') return false;
    if (s.budget!=null && x.price>s.budget) return false;
    if (s.space==='kopalnica' && x.category==='Svetila' && x.ip && !x.ip.includes('44')) return false;
    if (s.mounting==='stropno' && x.category==='Svetila' && !x.tags.includes('stropna')) return false;
    if (s.mounting==='stensko' && x.category==='Svetila' && !x.tags.includes('stensko')) return false;
    return true;
  });
  if (s.intent==='svetilo' && s.area) {
    const target = Math.max(1000, s.area*200);
    p.sort((a,b) => Math.abs((a.lumens||0)-target)-Math.abs((b.lumens||0)-target));
  }
  if (s.needs.includes('topla svetloba')) p.sort((a,b) => Math.abs(parseInt(a.colorTemp||'4000')-3000)-Math.abs(parseInt(b.colorTemp||'4000')-3000));
  if (s.needs.includes('nevtralna svetloba')) p.sort((a,b) => Math.abs(parseInt(a.colorTemp||'3000')-4000)-Math.abs(parseInt(b.colorTemp||'3000')-4000));
  return p.slice(0,3);
}

export function handleMessage(text,s) {
  const t=norm(text).trim();
  if (s.step==='offer') {
    const ps=recommend(s);
    const p=/^(prvo|prvi|1)$/.test(t)?ps[0]:/^(drugo|drugi|2)$/.test(t)?ps[1]:/^(tretje|tretji|3)$/.test(t)?ps[2]:null;
    if(p){s.selected=p;s.step=s.service&&s.location?'lead':'afterProduct';return{type:'selected',product:p};}
  }
  if (s.step==='lead') {
    if(/^(ja|da|seveda|potrdi|potrjujem|lahko)$/.test(t)){s.step='completed';return{type:'lead',state:s};}
    if(/^(ne|ne hvala)$/.test(t)){s.step='completed';return{type:'done',state:s};}
  }
  if (s.step==='afterProduct') {
    if(/^(ja|da)$/.test(t)){s.step='lead';return{type:'serviceAsk',state:s};}
    if(/^(ne)$/.test(t)){s.step='completed';return{type:'done',state:s};}
  }
  extract(text,s);
  if(s.safety && !s.intent){s.questionCount++;return{type:'safety',text:'To lahko pomeni električno varnostno tveganje. Prenehajte uporabljati napravo oziroma tokokrog, če je to mogoče varno, in naj stanje preveri električar. Če je prisoten dim ali požar, pokličite pristojne službe.',state:s};}
  if(s.safety && s.safetyReason && /dim|iskrenje|vonj po zažganem|pregrevanje/.test(s.safetyReason)){return{type:'safety',text:`Opazili ste ${s.safetyReason}. Za zdaj ne uporabljajte naprave oziroma tokokroga in ne odpirajte električne instalacije. Priporočam pregled električarja.`,state:s};}
  if(s.intent==='zaščita' && !s.productRequested && /fid|rcd/.test(t)){return{type:'answer',text:'FID oziroma RCD je zaščitna naprava, ki zazna diferenčni tok in v ustreznih pogojih odklopi tokokrog. Oznaka 30 mA se nanaša na nazivni diferenčni tok. Pravilnega tipa, vezave in izvedbe za konkreten objekt ni varno določiti brez podatkov o sistemu in tokokrogu; posege v razdelilnik naj opravi usposobljen električar.',state:s};}
  if(s.service && !s.productRequested && !s.location){s.questionCount++;return{type:'question',text:'V katerem kraju potrebujete električarja oziroma montažo?',state:s};}
  if(s.intent==='svetilo'&&s.productRequested){
    if(!s.space){s.questionCount++;return{type:'question',text:'V katerem prostoru bo svetilo?',state:s};}
    if(!s.area){s.questionCount++;return{type:'question',text:'Kolikšen je približno prostor v m²?',state:s};}
    if(!s.mounting){s.questionCount++;return{type:'question',text:'Želite stropno ali stensko svetilo?',state:s};}
    if(!s.budget){s.questionCount++;return{type:'question',text:'Kakšen je vaš proračun?',state:s};}
  }
  if(s.service&&!s.productRequested&&s.location){s.step='lead';return{type:'serviceLead',state:s};}
  if(s.intent){s.step='offer';return{type:'recommend',products:recommend(s),state:s};}
  return{type:'question',text:'Opišite, kaj potrebujete. Lahko napišete vse v enem stavku.',state:s};
}

export function summary(s){
  return [
    s.selected&&`${s.selected.name} — ${s.selected.price.toFixed(2)} €`,
    s.service&&`Storitev: ${s.service}`,
    s.location&&`Lokacija: ${s.location}`,
    s.space&&`Prostor: ${s.space}${s.area?` (${s.area} m²)`:''}`,
    s.mounting&&`Montaža: ${s.mounting}`,
    s.budget!=null&&`Proračun: do ${s.budget.toFixed(2)} €`,
    s.safetyReason&&`Varnost: ${s.safetyReason}`
  ].filter(Boolean);
}
