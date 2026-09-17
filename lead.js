function clean(v,max=500){return String(v??'').trim().slice(0,max)}
export async function onRequestPost({request,env}){
  try{
    const b=await request.json();
    const lead={
      id:`ED-${Date.now().toString(36).toUpperCase()}`,
      createdAt:new Date().toISOString(),
      name:clean(b.name,120),email:clean(b.email,180),phone:clean(b.phone,60),
      location:clean(b.location,100),service:clean(b.service,100),note:clean(b.note,2000),
      summary:Array.isArray(b.summary)?b.summary.slice(0,20).map(x=>clean(x,250)):[],
      sessionId:clean(b.sessionId,100)
    };
    if(!lead.name || (!lead.email && !lead.phone)) return Response.json({ok:false,error:'Vnesite ime in e-pošto ali telefon.'},{status:400});
    if(env.LEAD_WEBHOOK_URL){
      const hook=await fetch(env.LEAD_WEBHOOK_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(lead)});
      if(!hook.ok) return Response.json({ok:false,error:'Povpraševanja trenutno ni bilo mogoče posredovati.'},{status:502});
    }
    console.log('ELEKTRODOM_LEAD',JSON.stringify(lead));
    return Response.json({ok:true,id:lead.id,message:'Povpraševanje je bilo sprejeto.'},{headers:{'Cache-Control':'no-store'}});
  }catch(e){return Response.json({ok:false,error:'Neveljaven zahtevek.'},{status:400})}
}
