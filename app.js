import {PRODUCTS,freshState,handleMessage,recommend,summary,extract} from './chat-engine.js';
const $=id=>document.getElementById(id); const eur=n=>n.toLocaleString('sl-SI',{style:'currency',currency:'EUR'});
let state=freshState(), cart=[], selectedCategory='Vse', history=[];
const REAL_AI=true;
function renderProducts(){const q=$('productSearch').value.toLowerCase(); const ps=PRODUCTS.filter(p=>(selectedCategory==='Vse'||p.category===selectedCategory)&&(!q||(`${p.name} ${p.category} ${p.tags.join(' ')}`).toLowerCase().includes(q)));$('productGrid').innerHTML=ps.map(p=>`<article class="product"><div class="product-icon">${p.icon}</div><div class="tag">${p.category}</div><h3>${p.name}</h3><p>${p.desc}</p>${p.ip?`<span class="spec">${p.ip}</span>`:''}${p.lumens?`<span class="spec">${p.lumens} lm</span>`:''}<div class="product-bottom"><strong>${eur(p.price)}</strong><button onclick="window.addToCart(${p.id})">Dodaj</button></div></article>`).join('')||'<div class="empty">Ni zadetkov.</div>';}
function renderCats(){const cats=['Vse',...new Set(PRODUCTS.map(p=>p.category))];$('categories').innerHTML=cats.map(c=>`<button class="cat ${c===selectedCategory?'active':''}" onclick="window.setCategory('${c}')">${c}</button>`).join('');}
function renderCart(){ $('cartCount').textContent=cart.length; $('cartItems').innerHTML=cart.length?cart.map((p,i)=>`<div class="cart-row"><span>${p.name}</span><b>${eur(p.price)}</b><button onclick="window.removeCart(${i})">×</button></div>`).join(''):'<p>Košarica je prazna.</p>'; const total=cart.reduce((s,p)=>s+p.price,0);$('cartTotal').textContent=eur(total);}
function addToCart(id){const p=PRODUCTS.find(x=>x.id===id);if(!p)return;cart.push(p);renderCart();toast(`${p.name} je dodan v košarico.`);}
function toast(t){$('toast').textContent=t;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2200)}
function bubble(text,who='bot'){const d=document.createElement('div');d.className=`msg ${who}`;d.innerHTML=text.replace(/\n/g,'<br>');$('chatMessages').appendChild(d);$('chatMessages').scrollTop=99999;}
function botText(){const s=state; let x=''; if(s.space)x+=`<b>${s.space}</b>`;if(s.area)x+=` • ${s.area} m²`;if(s.mounting)x+=` • <b>${s.mounting}</b>`;if(s.budget)x+=` • do <b>${eur(s.budget)}</b>`;if(s.location)x+=`<br>Lokacija: <b>${s.location}</b>`;if(s.service)x+=`<br>Storitev: <b>${s.service}</b>`;return x;}
function showRecs(ps){$('recommendations').innerHTML=`<div class="rec-title">Predlogi glede na vaše podatke</div>`+ps.map((p,i)=>`<div class="rec"><div class="rec-num">${i+1}</div><div><b>${p.name}</b><small>${p.desc}${p.ip?` · ${p.ip}`:''}${p.lumens?` · ${p.lumens} lm`:''}</small></div><strong>${eur(p.price)}</strong><button onclick="window.chooseProduct(${p.id})">Izberi</button></div>`).join('');}
function chooseProduct(id){const p=PRODUCTS.find(x=>x.id===id);if(!p)return;state.selected=p;cart.push(p);renderCart();$('recommendations').innerHTML=''; if(state.service&&state.location){state.step='lead';bubble(`Odlično — <b>${p.name}</b> za <b>${eur(p.price)}</b> sem dodal v košarico.<br><br>Zabeležil sem tudi <b>${state.service.toLowerCase()}</b> v kraju <b>${state.location}</b>.<br><br>Želite, da pripravimo testno povpraševanje?`);}else{state.step='afterProduct';bubble(`Odlično — <b>${p.name}</b> za <b>${eur(p.price)}</b> sem dodal v košarico.<br><br>Želite tudi montažo oziroma pomoč električarja?`);}updateState();}
async function send(text){
  if(!text.trim())return;
  bubble(text,'user'); history.push({role:'user',content:text});
  if(REAL_AI){
    try{
      const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:history,state})});
      if(r.ok){
        const ai=await r.json();
        Object.assign(state,ai.statePatch||{});
        if(ai.productIds?.length){const ps=ai.productIds.map(id=>PRODUCTS.find(p=>p.id===id)).filter(Boolean);showRecs(ps);state.step='offer';}
        bubble(ai.reply||''); history.push({role:'assistant',content:ai.reply||''}); updateState(); return;
      }
    }catch(e){/* fallback to deterministic engine */}
  }
  const result=handleMessage(text,state);
  if(result.type==='question')bubble(result.text);
  else if(result.type==='recommend'){bubble(`Razumem: ${botText()}.<br><br>Na podlagi tega bi priporočil naslednje možnosti. Izberete lahko <b>prvo</b>, <b>drugo</b> ali pritisnete <b>Izberi</b>.`);showRecs(result.products);}
  else if(result.type==='selected'){chooseProduct(result.product.id);}
  else if(result.type==='serviceLead'){bubble(`<b>Odlično.</b> Zabeležil sem potrebo po električarju v kraju <b>${state.location}</b>.<br><br>Želite pripraviti povpraševanje?`);state.step='lead';}
  else if(result.type==='lead'){bubble(`<b>Testno povpraševanje je pripravljeno.</b><br><br>${summary(state).join('<br>')}<br><br><span class="muted">Naslednji korak v produkciji: oddaja kontaktnih podatkov in pošiljanje v CRM.</span>`);$('leadForm').scrollIntoView({behavior:'smooth',block:'center'});}
  else if(result.type==='serviceAsk')bubble('Razumem. Za pripravo povpraševanja potrebujemo še kraj in kontakt.');
  else if(result.type==='done')bubble('V redu. Ko boste želeli, lahko nadaljujemo z izbiro materiala ali storitve.');
  updateState();
}
function updateState(){$('state').innerHTML=`<b>${state.step}</b> · ${state.intent||'brez kategorije'}${state.location?' · '+state.location:''}${state.service?' · '+state.service:''}`;}
function reset(){state=freshState();history=[];$('chatMessages').innerHTML='';$('recommendations').innerHTML='';bubble('Pozdravljeni! Sem ElektroDom pomočnik. Opišite, kaj potrebujete — lahko tudi v enem stavku. Poskusil bom razumeti prostor, količino, proračun in ali potrebujete električarja.');updateState();}
function openChat(){document.getElementById('assistant').scrollIntoView({behavior:'smooth'});$('chatInput').focus();}
function startService(name){state=freshState();state.service=name;state.step='collect';openChat();bubble(`Izbrali ste storitev <b>${name}</b>. Opišite, kaj je treba narediti, in dodajte kraj. Če potrebujete tudi material, ga lahko vključimo v isti pogovor.`);updateState();}
function openCart(){$('cartModal').classList.remove('hidden');renderCart()}function closeCart(){$('cartModal').classList.add('hidden')}
function removeCart(i){cart.splice(i,1);renderCart()}
function checkout(){closeCart();$('leadForm').scrollIntoView({behavior:'smooth'});$('description').value=cart.map(p=>p.name).join(', ');}
function submitLead(e){e.preventDefault();$('leadResult').hidden=false;$('leadResult').innerHTML='<b>Testni lead ustvarjen.</b><br>V produkciji bi se ta zapis poslal v CRM/e-pošto in uporabniku pokazal potrditveno stran.';}
window.addToCart=addToCart;window.chooseProduct=chooseProduct;window.setCategory=c=>{selectedCategory=c;renderCats();renderProducts()};window.openAssistant=openChat;window.startService=startService;window.resetChat=reset;window.openCart=openCart;window.closeCart=closeCart;window.removeCart=removeCart;window.checkout=checkout;
$('productSearch').addEventListener('input',renderProducts);$('chatForm').addEventListener('submit',e=>{e.preventDefault();const x=$('chatInput').value;$('chatInput').value='';send(x)});$('leadForm').addEventListener('submit',submitLead);$('cartButton').addEventListener('click',openCart);
renderCats();renderProducts();renderCart();reset();
