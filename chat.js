const CATALOG = [
{id:1,name:'LED plafonjera 24 W',price:29.90,category:'Svetila',ip:'IP44',lumens:2100,colorTemp:'4000 K',tags:['svetilo','plafonjera','stropna','kopalnica','led']},
{id:2,name:'LED plafonjera 36 W',price:39.90,category:'Svetila',ip:'IP44',lumens:3200,colorTemp:'4000 K',tags:['svetilo','plafonjera','stropna','led']},
{id:3,name:'LED panel 40 W',price:44.90,category:'Svetila',ip:'IP20',lumens:3600,colorTemp:'4000 K',tags:['svetilo','panel','stropna','led']},
{id:4,name:'LED žarnica E27 10 W',price:4.90,category:'Žarnice',lumens:1050,colorTemp:'3000 K',tags:['žarnica','e27','led']},
{id:5,name:'LED žarnica GU10 7 W',price:5.90,category:'Žarnice',lumens:550,colorTemp:'4000 K',tags:['žarnica','gu10','led']},
{id:6,name:'Vtičnica IP44',price:9.90,category:'Vtičnice',ip:'IP44',tags:['vtičnica','ip44','kopalnica','vlaga']},
{id:7,name:'Vtičnica bela',price:4.90,category:'Vtičnice',tags:['vtičnica']},
{id:8,name:'Stikalo belo',price:4.50,category:'Stikala',tags:['stikalo']},
{id:9,name:'Dvojno stikalo',price:6.90,category:'Stikala',tags:['stikalo','dvojno']},
{id:10,name:'LED dimmer',price:19.90,category:'Stikala',tags:['dimmer','stikalo','led']},
{id:11,name:'Avtomatska varovalka B16',price:5.90,category:'Zaščita',tags:['varovalka','b16','zaščita']},
{id:12,name:'FID/RCD stikalo 40 A / 30 mA',price:39.90,category:'Zaščita',tags:['fid','rcd','zaščita']},
{id:13,name:'Podaljšek 3 m',price:9.90,category:'Ostalo',tags:['podaljšek']},
{id:14,name:'Razdelilna doza',price:2.90,category:'Inštalacijski material',tags:['doza','inštalacija']},
{id:15,name:'LED reflektor 20 W',price:14.90,category:'Svetila',ip:'IP65',lumens:1800,colorTemp:'4000 K',tags:['svetilo','reflektor','led','zunanja']},
{id:16,name:'Stenska LED svetilka 12 W',price:42.90,category:'Svetila',ip:'IP44',lumens:1200,colorTemp:'3000 K',tags:['svetilo','stensko','led']},
{id:17,name:'Elektro kabel NYM-J 3×1,5 mm²',price:1.25,unit:'m',category:'Kabli',tags:['kabel','nym','3x1.5']}
];

const patchSchema={type:'object',additionalProperties:false,properties:{intent:{type:['string','null']},space:{type:['string','null']},area:{type:['number','null']},mounting:{type:['string','null']},budget:{type:['number','null']},count:{type:['number','null']},location:{type:['string','null']},service:{type:['string','null']},productRequested:{type:['boolean','null']},safety:{type:['boolean','null']},step:{type:['string','null']},safetyReason:{type:['string','null']}},required:['intent','space','area','mounting','budget','count','location','service','productRequested','safety','step','safetyReason']};
const schema={type:'object',additionalProperties:false,properties:{reply:{type:'string'},productIds:{type:'array',items:{type:'integer'}},statePatch:patchSchema,nextQuestion:{type:['string','null']},serviceSuggested:{type:'boolean'},safetyLevel:{type:'string',enum:['normal','caution','electrician_required']},confidence:{type:'number'},reasoningSummary:{type:'string'},needsClarification:{type:'boolean'}},required:['reply','productIds','statePatch','nextQuestion','serviceSuggested','safetyLevel','confidence','reasoningSummary','needsClarification']};

function prompt(){return `Ti si ElektroDom Expert, AI elektro svetovalec za Slovenijo. Govori slovensko, naravno in praktično. Tvoja naloga je razumeti uporabnikov problem, oceniti varnost, postaviti samo najbolj koristno naslednje vprašanje in šele nato predlagati rešitev ali izdelke.

STROKOVNA LOGIKA:
- Svetila: upoštevaj namen prostora, površino, približno svetilnost, barvno temperaturo, IP, način montaže in proračun. Lumni so pomembnejši za količino svetlobe kot samo W. Pri kopalnicah IP oznaka sama po sebi ne potrjuje dovoljenosti na konkretnem mestu; pomembni so območje, položaj in izvedba.
- Vtičnice/stikala: preveri namen, prostor, vlago, število mest in kompatibilnost. Ne izmišljaj serij, mer ali združljivosti.
- Varovalke/FID/RCD/kabli/razdelilnik/230 V: razloži namen in kaj je treba preveriti, vendar ne dajaj korakov za nevarno delo na instalaciji ali pod napetostjo. Pri izbiri zaščite poudari tokokrog, vodnike, način polaganja in strokovno presojo.
- Če zaznaš dim, iskrenje, vonj po zažganem, pregrevanje ali podoben nevaren simptom, naj bo safetyLevel electrician_required in svetuj prekinitev uporabe ter električarja. Ne dramatiziraj, ampak jasno povej naslednji varen korak.
- Če manjka podatek, vprašaj eno stvar naenkrat. Če uporabnik poda več podatkov v enem sporočilu, jih vse uporabi in ne sprašuj ponovno.
- Ne izmišljaj izdelkov, cen, zaloge, certifikatov ali tehničnih lastnosti. Konkretni izdelki so dovoljeni samo iz KATALOGA.
- Predlagaj največ 3 izdelke in productIds izključno iz kataloga. Če je uporabnikov cilj svetilo + montaža, lahko predlagaš izdelek in serviceSuggested=true.
- 'prvo', 'drugo', 'tretje' oziroma 1/2/3 pomeni izbiro trenutno prikazanega seznama; statePatch naj ne spremeni zbranih podatkov.
- reasoningSummary naj bo kratka razlaga za uporabnika, zakaj je predlog smiseln, ne notranje razmišljanje.
- confidence je ocena popolnosti razumevanja zahtev v območju 0–1.
- Če ni dovolj podatkov za konkreten izdelek, productIds naj bo prazno polje.

VRNI SAMO JSON PO PODANI SHEMI.`}

export async function onRequestPost({request,env}){
  try{
    if(!env.OPENAI_API_KEY) return Response.json({error:'OPENAI_API_KEY ni nastavljen.'},{status:503});
    const b=await request.json();
    const messages=Array.isArray(b.messages)?b.messages.slice(-18):[];
    const state=b.state||{};
    const input=[
      {role:'developer',content:prompt()},
      {role:'developer',content:`TRENUTNO STANJE: ${JSON.stringify(state)}\nKATALOG: ${JSON.stringify(CATALOG)}`},
      ...messages.map(m=>({role:m.role==='assistant'?'assistant':'user',content:String(m.content||'')}))
    ];
    const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${env.OPENAI_API_KEY}`},body:JSON.stringify({model:env.OPENAI_MODEL||'gpt-5.6-luna',input,text:{format:{type:'json_schema',name:'elektrodom_expert',strict:true,schema}},max_output_tokens:1200})});
    if(!r.ok)return Response.json({error:'AI trenutno ni dosegljiv.',detail:(await r.text()).slice(0,300)},{status:502});
    const d=await r.json();
    let parsed;
    try{parsed=JSON.parse(d.output_text||'')}catch{parsed={reply:d.output_text||'Prosim, opišite težavo še malo bolj konkretno.',productIds:[],statePatch:{},nextQuestion:null,serviceSuggested:false,safetyLevel:'caution',confidence:0.2,reasoningSummary:'Potrebujem še nekaj podatkov.',needsClarification:true}}
    parsed.productIds=(parsed.productIds||[]).filter(id=>CATALOG.some(p=>p.id===id)).slice(0,3);
    if(parsed.safetyLevel==='electrician_required'){parsed.statePatch={...parsed.statePatch,safety:true};}
    return Response.json(parsed,{headers:{'Cache-Control':'no-store'}});
  }catch(e){return Response.json({error:'Napaka strežnika.',detail:String(e).slice(0,300)},{status:500})}
}
