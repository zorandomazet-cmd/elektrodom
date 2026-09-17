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

const schema={type:'json_schema',name:'elektrodom_response',strict:true,schema:{type:'object',properties:{reply:{type:'string'},productIds:{type:'array',items:{type:'integer'}},statePatch:{type:'object',additionalProperties:false,properties:{intent:{type:['string','null']},space:{type:['string','null']},area:{type:['number','null']},mounting:{type:['string','null']},budget:{type:['number','null']},location:{type:['string','null']},service:{type:['string','null']},count:{type:['number','null']}}},needsClarification:{type:'boolean'},safetyWarning:{type:'boolean'}},required:['reply','productIds','statePatch','needsClarification','safetyWarning'],additionalProperties:false}};

function systemPrompt(){return `Ti si ElektroDom AI svetovalec za elektro material in električarske storitve v Sloveniji. Govori slovensko, naravno in kratko, vendar strokovno. Uporabniku pomagaj izbrati IZDELEK iz priloženega kataloga in po potrebi električarja. Ne izmišljaj izdelkov, cen, zaloge, certifikatov ali lastnosti. Če je podatek pomemben za varnost in ga ne poznamo, vprašaj. Pri 230 V, razdelilnikih, avtomatskih varovalkah, FID/RCD, kablih in posegih v napeljavo ne dajaj navodil za nevarno izvedbo; pojasni namen in priporočaj preverjanje/usposobljenega električarja. Pri kopalnicah upoštevaj, da IP zaščita sama po sebi ne določi dovoljenosti vgradnje; pomembna je konkretna izvedba in položaj. Če uporabnik želi nakup svetila, upoštevaj prostor, m², način montaže, proračun in želje glede svetlobe. Ne ponavljaj vprašanj, na katera je že odgovoril. Če lahko priporočiš, vrni največ 3 productIds iz kataloga. Če uporabnik napiše 'prvo/drugo/tretje', ga interpretiraj glede na trenutno ponujene izdelke. Če zahteva storitev, zajemi lokacijo. Katalog je vir resnice za izdelke.`}

export async function onRequestPost({request,env}){
  try{
    if(!env.OPENAI_API_KEY) return Response.json({error:'OPENAI_API_KEY ni nastavljen.'},{status:503});
    const body=await request.json();
    const messages=Array.isArray(body.messages)?body.messages.slice(-12):[];
    const state=body.state||{};
    const input=[{role:'developer',content:systemPrompt()},{role:'developer',content:`Trenutno stanje uporabnika: ${JSON.stringify(state)}\nKatalog: ${JSON.stringify(CATALOG)}`},...messages.map(m=>({role:m.role==='assistant'?'assistant':'user',content:String(m.content||'')}))];
    const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${env.OPENAI_API_KEY}`},body:JSON.stringify({model:env.OPENAI_MODEL||'gpt-5.6-luna',input,text:{format:schema},max_output_tokens:700})});
    if(!r.ok){const err=await r.text();return Response.json({error:'OpenAI API napaka',detail:err.slice(0,500)},{status:502});}
    const data=await r.json();
    const raw=data.output_text||''; let parsed; try{parsed=JSON.parse(raw)}catch{parsed={reply:raw,productIds:[],statePatch:{},needsClarification:false,safetyWarning:false};}
    parsed.productIds=(parsed.productIds||[]).filter(id=>CATALOG.some(p=>p.id===id)).slice(0,3);
    return Response.json(parsed,{headers:{'Cache-Control':'no-store'}});
  }catch(e){return Response.json({error:'Napaka strežnika',detail:String(e).slice(0,300)},{status:500});}
}
