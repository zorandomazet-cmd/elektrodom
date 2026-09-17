const CATALOG = [
{id:1,name:'LED plafonjera 24 W',price:29.90,category:'Svetila',ip:'IP44',lumens:2100,colorTemp:'4000 K'},
{id:2,name:'LED plafonjera 36 W',price:39.90,category:'Svetila',ip:'IP44',lumens:3200,colorTemp:'4000 K'},
{id:3,name:'LED panel 40 W',price:44.90,category:'Svetila',ip:'IP20',lumens:3600,colorTemp:'4000 K'},
{id:4,name:'LED žarnica E27 10 W',price:4.90,category:'Žarnice',lumens:1050,colorTemp:'3000 K'},
{id:5,name:'LED žarnica GU10 7 W',price:5.90,category:'Žarnice',lumens:550,colorTemp:'4000 K'},
{id:6,name:'Vtičnica IP44',price:9.90,category:'Vtičnice',ip:'IP44'},
{id:7,name:'Vtičnica bela',price:4.90,category:'Vtičnice'},
{id:8,name:'Stikalo belo',price:4.50,category:'Stikala'},
{id:9,name:'Dvojno stikalo',price:6.90,category:'Stikala'},
{id:10,name:'LED dimmer',price:19.90,category:'Stikala'},
{id:11,name:'Avtomatska varovalka B16',price:5.90,category:'Zaščita'},
{id:12,name:'FID/RCD stikalo 40 A / 30 mA',price:39.90,category:'Zaščita'},
{id:13,name:'Podaljšek 3 m',price:9.90,category:'Ostalo'},
{id:14,name:'Razdelilna doza',price:2.90,category:'Inštalacijski material'}
];
const schema={type:'object',additionalProperties:false,properties:{reply:{type:'string'},productIds:{type:'array',items:{type:'integer'}},statePatch:{type:'object',additionalProperties:false,properties:{intent:{type:['string','null']},space:{type:['string','null']},area:{type:['number','null']},mounting:{type:['string','null']},budget:{type:['number','null']},count:{type:['number','null']},location:{type:['string','null']},service:{type:['string','null']},productRequested:{type:['boolean','null']},safety:{type:['boolean','null']},step:{type:['string','null']}},required:['intent','space','area','mounting','budget','count','location','service','productRequested','safety','step']},needsClarification:{type:'boolean'},safetyLevel:{type:'string',enum:['normal','caution','electrician_required']}} ,required:['reply','productIds','statePatch','needsClarification','safetyLevel']};
function prompt(){return `Ti si ElektroDom AI elektro svetovalec za Slovenijo. Tvoja naloga ni samo prodaja: najprej razumi problem, nato strokovno svetuj, šele nato predlagaj material ali električarja. Govori slovensko. Bodisi jasen, praktičen in naraven.

PRAVILA SVETOVANJA:
1. Pri svetilih svetuj glede namena prostora, približne osvetlitve, barve svetlobe, IP zaščite, načina montaže in proračuna. Ne trdi, da je določen IP sam po sebi dovoljen v kopalnici; konkretno območje in izvedbo mora preveriti strokovnjak.
2. Pri vtičnicah/stikalih preveri namen, prostor, vlago, število mest in kompatibilnost sistema. Ne izmišljaj serij ali dimenzij.
3. Pri varovalkah, FID/RCD, kablih, razdelilniku, meritvah, priklopih, spremembah napeljave ali delu na 230 V razloži namen in potrebne podatke, vendar ne dajaj nevarnih navodil po korakih za delo pod napetostjo ali posege v instalacijo. Pri izbiri zaščite poudari, da mora naziv/karakteristiko potrditi električar glede na tokokrog, vodnike in zaščito.
4. Če manjka podatek, postavi eno najbolj koristno vprašanje, ne petih hkrati.
5. Nikoli ne izmišljaj izdelkov, cen, zaloge, certifikatov ali tehničnih lastnosti. Katalog je edini vir resnice za konkretne izdelke.
6. Če je problem mogoče rešiti z izbiro izdelka, predlagaj največ 3 izdelke. productIds morajo biti iz kataloga.
7. Če uporabnik potrebuje montažo ali električarja, zajemi lokacijo.
8. Če uporabnik napiše prvo/drugo/tretje ali 1/2/3, to pomeni trenutno ponujeni seznam izdelkov.
9. Če uporabnik poda več informacij v enem stavku, jih vse uporabi in ne sprašuj ponovno.
10. Pri napakah/diagnostiki najprej pridobi simptome in varnostne informacije; če obstaja tveganje električnega udara, požara, pregrevanja ali dela v omarici, priporočaj električarja.
11. Nikoli ne zagotavljaj, da je izvedba skladna s predpisi brez pregleda konkretne instalacije.

VRNI SAMO JSON PO PODANI SHEMI.`}
export async function onRequestPost({request,env}){try{if(!env.OPENAI_API_KEY)return Response.json({error:'OPENAI_API_KEY ni nastavljen.'},{status:503});const b=await request.json();const messages=Array.isArray(b.messages)?b.messages.slice(-14):[];const state=b.state||{};const input=[{role:'developer',content:prompt()},{role:'developer',content:`TRENUTNO STANJE: ${JSON.stringify(state)}\nKATALOG: ${JSON.stringify(CATALOG)}`},...messages.map(m=>({role:m.role==='assistant'?'assistant':'user',content:String(m.content||'')}))];const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${env.OPENAI_API_KEY}`},body:JSON.stringify({model:env.OPENAI_MODEL||'gpt-5.6-luna',input,text:{format:{type:'json_schema',name:'elektrodom_advisor',strict:true,schema}},max_output_tokens:900})});if(!r.ok){return Response.json({error:'AI trenutno ni dosegljiv.',detail:(await r.text()).slice(0,300)},{status:502})}const d=await r.json();let out=d.output_text||'';let parsed;try{parsed=JSON.parse(out)}catch{parsed={reply:out||'Prosim, opišite težavo še malo bolj konkretno.',productIds:[],statePatch:{},needsClarification:true,safetyLevel:'caution'}}parsed.productIds=(parsed.productIds||[]).filter(id=>CATALOG.some(p=>p.id===id)).slice(0,3);return Response.json(parsed,{headers:{'Cache-Control':'no-store'}})}catch(e){return Response.json({error:'Napaka strežnika.',detail:String(e).slice(0,300)},{status:500})}}
