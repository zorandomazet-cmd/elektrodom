export const PRODUCTS = [
  {id:1,name:'LED plafonjera 24 W',price:29.90,category:'Svetila',icon:'◉',tags:['svetilo','plafonjera','stropna','kopalnica','led'],ip:'IP44',lumens:2100,colorTemp:'4000 K',desc:'Kompaktna stropna LED svetilka za manjše prostore.'},
  {id:2,name:'LED plafonjera 36 W',price:39.90,category:'Svetila',icon:'◉',tags:['svetilo','plafonjera','stropna','led'],ip:'IP44',lumens:3200,colorTemp:'4000 K',desc:'Močnejša stropna LED svetilka za srednje in večje prostore.'},
  {id:3,name:'LED panel 40 W',price:44.90,category:'Svetila',icon:'▣',tags:['svetilo','panel','stropna','led'],ip:'IP20',lumens:3600,colorTemp:'4000 K',desc:'Enakomerna svetloba za delovne in bivalne prostore.'},
  {id:4,name:'LED žarnica E27 10 W',price:4.90,category:'Žarnice',icon:'◌',tags:['žarnica','e27','led'],lumens:1050,colorTemp:'3000 K',desc:'Topla LED žarnica za standardno grlo E27.'},
  {id:5,name:'LED žarnica GU10 7 W',price:5.90,category:'Žarnice',icon:'◌',tags:['žarnica','gu10','led'],lumens:550,colorTemp:'4000 K',desc:'LED reflektorska žarnica za grlo GU10.'},
  {id:6,name:'Vtičnica IP44',price:9.90,category:'Vtičnice',icon:'▣',tags:['vtičnica','ip44','kopalnica','vlaga'],ip:'IP44',desc:'Zaščitena vtičnica za primerno okolje; končno ustreznost določi izvedba.'},
  {id:7,name:'Vtičnica bela',price:4.90,category:'Vtičnice',icon:'▣',tags:['vtičnica'],desc:'Klasična bela vtičnica za notranjo uporabo.'},
  {id:8,name:'Stikalo belo',price:4.50,category:'Stikala',icon:'□',tags:['stikalo'],desc:'Standardno stensko stikalo.'},
  {id:9,name:'Dvojno stikalo',price:6.90,category:'Stikala',icon:'□',tags:['stikalo','dvojno'],desc:'Dvojno stikalo za ločeno krmiljenje dveh tokokrogov.'},
  {id:10,name:'LED dimmer',price:19.90,category:'Stikala',icon:'◒',tags:['dimmer','stikalo','led'],desc:'Dimmer za združljive LED svetilke; preveri kompatibilnost.'},
  {id:11,name:'Avtomatska varovalka B16',price:5.90,category:'Zaščita',icon:'⚡',tags:['varovalka','b16','zaščita'],desc:'Zaščitni element. Naziv in karakteristiko mora potrditi strokovnjak glede na tokokrog.'},
  {id:12,name:'FID/RCD stikalo 40 A / 30 mA',price:39.90,category:'Zaščita',icon:'⛨',tags:['fid','rcd','zaščita'],desc:'Zaščitna naprava; izbiro tipa in izvedbo naj potrdi električar.'},
  {id:13,name:'Podaljšek 3 m',price:9.90,category:'Ostalo',icon:'⌁',tags:['podaljšek'],desc:'3 m podaljšek za splošno uporabo.'},
  {id:14,name:'Razdelilna doza',price:2.90,category:'Inštalacijski material',icon:'▱',tags:['doza','inštalacija'],desc:'Razdelilna doza za ustrezno izvedbo inštalacije.'}
];

const norm = s => String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9€.,\s]/g,' ');
const money = s => { const x=String(s||'').replace(',','.'); const m=x.match(/(?:do|pod|max|maxim|maxs|budget)\s*(\d+(?:\.\d+)?)\s*(?:€|eur)?/i) || x.match(/(\d+(?:\.\d+)?)\s*(?:€|eur)\b/i); return m ? Number(m[1]) : null; };
const area = s => { const m=String(s||'').replace(',','.').match(/(\d+(?:\.\d+)?)\s*(?:m2|m²|kvadrat|kvadratov|m)/i); return m ? Number(m[1]) : null; };
const quantity = s => { const m=norm(s).match(/\b(\d+)\s*(?:kos|kosi|kom|komad|komadi|x)?\b/); return m ? Number(m[1]) : null; };
const location = s => { const x=norm(s); const map=[['celju','Celje'],['celje','Celje'],['cellje','Celje'],['maribor','Maribor'],['ljubljana','Ljubljana'],['ptuj','Ptuj'],['velenje','Velenje'],['kranj','Kranj'],['koper','Koper'],['novo mesto','Novo mesto'],['murska sobota','Murska Sobota']]; return map.find(([k])=>x.includes(k))?.[1]||null; };

export function freshState(){return {intent:null,space:null,area:null,mounting:null,budget:null,count:null,location:null,service:null,step:'intent',selected:null,needs:null,productRequested:false};}
export function extract(text,state){
  const t=norm(text);
  const serviceOnly=/(?:elektricar|mojster|montaz|namest|zmont)/.test(t) && !/(?:kupiti|kupujem|izdelek|material|cena|proracun)/.test(t) && /(?:elektricar|montaz|namest|zmont)/.test(t);
  if(/montaz|namest|zmont|elektricar|mojster/.test(t)) state.service = state.service || 'Električar';
  if(/(?:rabim|potrebujem|kupiti|kupujem|izdelek|material).*(?:l[uc]c|svetil|plafonj|panel|zarnic|led)/.test(t)) state.productRequested=true;
  if(serviceOnly && /(?:montaz|namest|zmont).*(?:svetil|l[uc]c)/.test(t)) state.productRequested=false;
  if(/l[uc]c|svetil|plafonj|panel|zarnic|led/.test(t)) state.intent='svetilo';
  if(/vti[cč]nic|vticnic/.test(t)) state.intent='vtičnica';
  if(/stikal/.test(t)) state.intent='stikalo';
  if(/varovalk|fid|rcd/.test(t)) state.intent='zaščita';
  if(/kopalnic/.test(t)) state.space='kopalnica';
  else if(/dnevni|dnevna/.test(t)) state.space='dnevna soba';
  else if(/spalnic/.test(t)) state.space='spalnica';
  else if(/kuhinj/.test(t)) state.space='kuhinja';
  else if(/hodnik/.test(t)) state.space='hodnik';
  else if(/pisarn/.test(t)) state.space='pisarna';
  const a=area(text); if(a) state.area=a;
  const b=money(text); if(b && /(?:€|eur|do|pod|max|maxim|maxs|budget)/i.test(text)) state.budget=b;
  const q=String(text).match(/\b(\d+)\s*(?:kos(?:ov)?|kom(?:adov)?|svetilk|svetil|vti[cč]nic|stikal)\b/i); if(q) state.count=Number(q[1]);
  if(/stropn/.test(t)) state.mounting='stropno';
  else if(/stens/.test(t)) state.mounting='stensko';
  if(/topl|3000/.test(t)) state.needs='topla svetloba';
  if(/nevtral|4000/.test(t)) state.needs='nevtralna svetloba';
  if(/hlad|6000/.test(t)) state.needs='hladna svetloba';
  const loc=location(text); if(loc) state.location=loc;
  return state;
}
export function recommend(state){
  let pool=PRODUCTS.filter(p=>{
    if(state.intent==='svetilo' && p.category!=='Svetila') return false;
    if(state.intent==='vtičnica' && p.category!=='Vtičnice') return false;
    if(state.intent==='stikalo' && p.category!=='Stikala') return false;
    if(state.intent==='zaščita' && p.category!=='Zaščita') return false;
    if(state.budget!=null && p.price>state.budget) return false;
    if(state.space==='kopalnica' && p.category==='Svetila' && p.ip && !p.ip.includes('44')) return false;
    if(state.mounting==='stropno' && p.category==='Svetila' && !p.tags.includes('stropna')) return false;
    return true;
  });
  if(state.intent==='svetilo' && state.area){
    const target=Math.max(1000, state.area*200);
    pool.sort((a,b)=>Math.abs((a.lumens||0)-target)-Math.abs((b.lumens||0)-target));
  }
  return pool.slice(0,3);
}

export function nextQuestion(state){
  if(state.service && !state.productRequested && !state.location) return 'V katerem kraju potrebujete električarja?';
  if(state.service && !state.productRequested && !state.location) return 'V katerem kraju potrebujete električarja?';
  if(!state.intent) return 'Kaj potrebujete? Lahko napišete npr. »luč za kopalnico«, »vtičnico« ali »električarja«.';
  if(state.intent==='svetilo' && state.productRequested){
    if(!state.space) return 'V katerem prostoru bo svetilo?';
    if(!state.area) return 'Kolikšen je približno prostor (m²)?';
    if(!state.mounting) return 'Želite stropno ali stensko svetilo?';
    if(!state.budget) return 'Kakšen je vaš proračun? (npr. do 50 €)';
  }
  if(state.intent==='vtičnica' && !state.space) return 'V katerem prostoru jo potrebujete in ali je izpostavljena vlagi?';
  if(state.intent==='stikalo' && !state.space) return 'V katerem prostoru in za koliko luči/tokokrogov potrebujete stikalo?';
  if(state.intent==='zaščita') return 'Za varovalke/FID potrebujem podatke o obstoječem tokokrogu; pri izbiri in menjavi naj sodeluje električar.';
  return null;
}

export function handleMessage(text,state){
  const t=norm(text).trim();
  if(state.step==='offer'){
    const ps=recommend(state); let chosen=null;
    if(/^(prvo|prvi|1)$/.test(t)) chosen=ps[0]; else if(/^(drugo|drugi|2)$/.test(t)) chosen=ps[1]; else if(/^(tretje|tretji|3)$/.test(t)) chosen=ps[2];
    if(chosen){state.selected=chosen; state.step=state.service&&state.location?'lead':'afterProduct'; return {type:'selected',product:chosen};}
  }
  if(state.step==='lead'){
    if(/^(ja|da|seveda|lahko|potrdi|potrjujem)$/.test(t)){state.step='completed';return {type:'lead',state};}
    if(/^(ne|ne hvala)$/.test(t)){state.step='completed';return {type:'done',state};}
  }
  if(state.step==='afterProduct'){
    if(/^(ja|da)$/.test(t)){state.step='completed';return {type:'serviceAsk',state};}
    if(/^(ne)$/.test(t)){state.step='completed';return {type:'done',state};}
  }
  extract(text,state);
  if(state.service && state.intent==='svetilo'){
    // Keep combined intent: product + service, never overwrite it with service-only intent.
  }
  const q=nextQuestion(state);
  if(q) {state.step='collect'; return {type:'question',text:q,state};}
  if(state.service && !state.productRequested && state.location){state.step='lead';return {type:'serviceLead',state};}
  if(state.intent){state.step='offer';const products=recommend(state);return {type:'recommend',products,state};}
  return {type:'question',text:nextQuestion(state),state};
}

export function summary(state){
  const lines=[];
  if(state.selected) lines.push(`${state.selected.name} — ${state.selected.price.toFixed(2)} €`);
  if(state.service) lines.push(`Storitev: ${state.service}`);
  if(state.location) lines.push(`Lokacija: ${state.location}`);
  if(state.space) lines.push(`Prostor: ${state.space}${state.area?` (${state.area} m²)`:''}`);
  if(state.mounting) lines.push(`Montaža: ${state.mounting}`);
  return lines;
}
