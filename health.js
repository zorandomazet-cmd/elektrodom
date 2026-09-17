export function onRequestGet({env}){
  return Response.json({ok:true,service:'ElektroDom',version:'V10',ai:!!env.OPENAI_API_KEY,leadWebhook:!!env.LEAD_WEBHOOK_URL,time:new Date().toISOString()},{headers:{'Cache-Control':'no-store'}});
}
