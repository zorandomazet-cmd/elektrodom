let cart=[];

const eur = n => n.toLocaleString("sl-SI",{style:"currency",currency:"EUR"});
const $ = id => document.getElementById(id);

function renderProducts(filter=""){
  const q=filter.toLowerCase();
  const items=PRODUCTS.filter(p=>(p.name+" "+p.category+" "+p.desc).toLowerCase().includes(q));
  $("productGrid").innerHTML=items.map(p=>`
    <article class="product-card">
      <div class="product-image">${p.icon}</div>
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <div class="price">${eur(p.price)}</div>
      <button onclick="addToCart(${p.id})">Dodaj v košarico</button>
    </article>`).join("") || "<p>Noben izdelek ni najden.</p>";
}

function addToCart(id){
  const p=PRODUCTS.find(x=>x.id===id); cart.push(p);
  $("cartCount").textContent=cart.length;
  toast(`${p.name} je dodan v košarico.`);
}

function openCart(){
  $("cartModal").classList.remove("hidden");
  $("cartItems").innerHTML=cart.length?cart.map((p,i)=>`<div class="cart-row"><span>${p.name}</span><strong>${eur(p.price)}</strong></div>`).join(""):"<p>Košarica je prazna.</p>";
  $("cartTotal").textContent=eur(cart.reduce((s,p)=>s+p.price,0));
}
function closeCart(){ $("cartModal").classList.add("hidden"); }
function checkoutTest(){ closeCart(); toast("TEST: tukaj bomo kasneje dodali checkout in prodajnega agenta."); }

function toast(t){const e=$("toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),2600)}

function addMessage(text,type){
  const d=document.createElement("div");d.className="msg "+type;d.innerHTML=text;
  $("chatMessages").appendChild(d);$("chatMessages").scrollTop=$("chatMessages").scrollHeight;
}

function botReply(text){
  const t=text.toLowerCase();
  if(t.includes("kopal")||t.includes("luč")||t.includes("svet")){
    return `Za izbiro svetila potrebujemo predvsem prostor, namen uporabe in pogoje namestitve. Pri kopalnici je pomembna tudi ustrezna zaščita pred vlago. <br><br><b>Vprašanje:</b> Ali iščete stropno ali stensko svetilo in približno koliko m² ima prostor?`;
  }
  if(t.includes("električar")||t.includes("monta")||t.includes("svetilk")){
    return `Lahko pripravimo testno povpraševanje za električarja. Za začetek potrebujem <b>kraj</b>, približno število svetilk oziroma opravil in ali je električna napeljava že pripravljena.`;
  }
  if(t.includes("stanov")||t.includes("prenov")||t.includes("material")){
    return `Pri prenovi lahko pomagamo sestaviti seznam materiala. <b>Koliko m² ima objekt, koliko prostorov prenavljate in ali gre za popolnoma novo napeljavo ali samo delno prenovo?</b>`;
  }
  if(t.includes("varov")||t.includes("fid")){
    return `Pri varovalkah in zaščitnih napravah je pomembno, da se izbira opravi glede na konkretno električno napeljavo in zaščito tokokrogov. Za varnost ne bom ugibal o ustrezni vrednosti. Če opišete, kaj želite zaščititi, lahko pripravim seznam podatkov za električarja.`;
  }
  return `Razumem. Da vam lahko čim bolje pomagam, povejte še <b>kaj želite narediti, kje se to nahaja in kaj trenutno že imate</b>. Če želite, lahko iz tega pripravimo tudi testno povpraševanje za električarja.`;
}

function quickAsk(t){$("chatInput").value=t;$("chatForm").requestSubmit();}
function openAssistant(){document.querySelector("#assistant").scrollIntoView({behavior:"smooth"});setTimeout(()=>$("chatInput").focus(),400)}
function startService(service){$("serviceSelect").value=service;document.querySelector("#quote").scrollIntoView({behavior:"smooth"});$("description").focus();}

$("chatForm").addEventListener("submit",e=>{
  e.preventDefault();const input=$("chatInput"),text=input.value.trim();if(!text)return;
  addMessage(text,"user");input.value="";
  setTimeout(()=>addMessage(botReply(text),"bot"),350);
});

$("productSearch").addEventListener("input",e=>renderProducts(e.target.value));
$("cartButton").addEventListener("click",openCart);

$("quoteForm").addEventListener("submit",e=>{
  e.preventDefault();
  const service=$("serviceSelect").value,city=$("city").value,phone=$("phone").value,desc=$("description").value;
  const urgency=/nujno|takoj|danes|ne dela|izpad/i.test(desc)?"VISOKA":"OBIČAJNA";
  $("quoteResult").style.display="block";
  $("quoteResult").innerHTML=`<b>TESTNO POVPRAŠEVANJE USTVARJENO</b><br>Storitev: ${service}<br>Kraj: ${city}<br>Nujnost: <b>${urgency}</b><br>Telefon: ${phone}<br><br><small>V1: podatki ostanejo samo v brskalniku. V naslednji verziji jih bomo poslali v backend/CRM.</small>`;
});

renderProducts();