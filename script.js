
/* Frontend interactive script for improved catalog */
/* Data placeholders */
const PRODUCTS = [
  {id:'prod1', title:'Velas Intencionadas', priceCOP:150000, img:'imagenes/Producto1.png'},
  {id:'prod2', title:'Pulseras Energéticas', priceCOP:120000, img:'imagenes/Producto2.png'},
  {id:'prod3', title:'Esencias', priceCOP:80000, img:'imagenes/Producto3.png'},
  {id:'prod4', title:'Jabones Espirituales', priceCOP:30000, img:'imagenes/Producto4.png'},
  {id:'prod5', title:'Talismanes', priceCOP:120000, img:'imagenes/Producto5.png'},
  {id:'prod6', title:'Paquete Ritual', priceCOP:350000, img:'imagenes/Producto6.png'},
  {id:'prod7', title:'Set Prosperidad', priceCOP:200000, img:'imagenes/Producto7.png'},
  {id:'prod8', title:'Aceites', priceCOP:70000, img:'imagenes/Producto8.png'},
  {id:'prod9', title:'Cristales', priceCOP:180000, img:'imagenes/Producto9.png'}
];
const SERVICES = [
  {id:'serv1', title:'Tarot Predictivo', priceCOP:140000, img:'imagenes/Servicio1.png'},
  {id:'serv2', title:'Lectura Energética', priceCOP:80000, img:'imagenes/Servicio2.png'},
  {id:'serv3', title:'Ritual Blanco', priceCOP:350000, img:'imagenes/Servicio3.png'},
  {id:'serv4', title:'Hechizo de Luz', priceCOP:450000, img:'imagenes/Servicio4.png'},
  {id:'serv5', title:'Coaching Espiritual', priceCOP:150000, img:'imagenes/Servicio5.png'},
  {id:'serv6', title:'Oráculos de Ángeles', priceCOP:80000, img:'imagenes/Servicio6.png'}
];

/* Utilities - cart in localStorage */
const CART_KEY='mily_cart_v1';
function getCart(){return JSON.parse(localStorage.getItem(CART_KEY) || '[]');}
function saveCart(c){localStorage.setItem(CART_KEY, JSON.stringify(c)); renderCart();}
function addToCart(product){ const c=getCart(); const found=c.find(i=>i.id===product.id); if(found){found.qty++;}else{c.push({...product, qty:1});} saveCart(c); showToast('Añadido al carrito');}

/* Render grids */
function createCard(item, type='product'){
  const div=document.createElement('div'); div.className='card'; div.tabIndex=0;
  div.innerHTML=`<img src="${item.img}" alt="${item.title}"><h3>${item.title}</h3><p style="font-weight:700;color:var(--lila)">COP ${item.priceCOP.toLocaleString()}</p>`;
  div.addEventListener('click', ()=> openProductModal(item, type));
  return div;
}
function renderProducts(){ const cont=document.getElementById('productsGrid'); cont.innerHTML=''; PRODUCTS.forEach(p=>cont.appendChild(createCard(p,'product'))); }
function renderServices(){ const cont=document.getElementById('servicesGrid'); cont.innerHTML=''; SERVICES.forEach(s=>cont.appendChild(createCard(s,'service'))); }

/* Modal behavior */
const overlay=document.getElementById('overlay');
const productModal=document.getElementById('productModal');
function openProductModal(item, type){
  overlay.style.display='block'; productModal.style.display='block';
  productModal.innerHTML=`
    <div style="display:flex;gap:1rem;align-items:flex-start;flex-wrap:wrap">
      <img src="${item.img}" style="width:48%;max-width:360px;border-radius:8px;object-fit:cover"/>
      <div style="flex:1">
        <h2 style="margin-top:0">${item.title}</h2>
        <p style="color:#333">Descripción breve del ${type==='service'?'servicio':'producto'}. Aquí puedes agregar más detalles y beneficios.</p>
        <p style="font-weight:800;color:var(--lila)">COP ${item.priceCOP.toLocaleString()}</p>
        <div style="display:flex;gap:0.6rem;margin-top:1rem;flex-wrap:wrap">
          <button class="btn" id="buyNow">Comprar ahora</button>
          <button class="btn" id="addToCart">Agregar al carrito</button>
          ${type==='service' ? '<button class="btn" id="bookNow">Agendar cita</button>' : ''}
          <button class="btn" id="closeModal">Cerrar</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('addToCart').addEventListener('click', ()=>{ addToCart(item); closeModal(); });
  document.getElementById('buyNow').addEventListener('click', ()=>{ startCheckout([item]); });
  if(type==='service'){ document.getElementById('bookNow').addEventListener('click', ()=> openBookingModal(item)); }
  document.getElementById('closeModal').addEventListener('click', closeModal);
}
function closeModal(){ overlay.style.display='none'; productModal.style.display='none'; productModal.innerHTML=''; }
overlay.addEventListener('click', closeModal);

/* Simple toast */
function showToast(msg){ const t = document.createElement('div'); t.textContent=msg; t.style.cssText='position:fixed;left:50%;transform:translateX(-50%);bottom:28px;background:var(--lila);color:#fff;padding:8px 14px;border-radius:8px;z-index:99999;'; document.body.appendChild(t); setTimeout(()=>t.remove(),2000);}

/* Cart drawer render */
function renderCart(){
  const container=document.getElementById('cartItems');
  const cart=getCart();
  container.innerHTML='';
  let total=0;
  cart.forEach(it=>{
    const row=document.createElement('div'); row.className='cart-item';
    row.innerHTML=`<img src="${it.img}" alt="${it.title}"><div><strong>${it.title}</strong><div>COP ${it.priceCOP.toLocaleString()} x ${it.qty}</div></div>`;
    container.appendChild(row);
    total += it.priceCOP * it.qty;
  });
  document.getElementById('cartTotal').innerText = 'Total: COP ' + total.toLocaleString();
}

/* Checkout (calls serverless endpoint). Fallback: alert */
async function startCheckout(items){
  try{
    const body = { items: items.map(it=>({id:it.id, title:it.title, priceCOP:it.priceCOP, qty:it.qty||1})) };
    const resp = await fetch('/.netlify/functions/createCheckout', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
    if(!resp.ok) throw new Error('No se pudo crear checkout');
    const js = await resp.json();
    if(js.url){ window.location = js.url; return; }
    alert('Checkout no disponible. En versión demo, se abrirá WhatsApp.');
    window.open('https://wa.me/573202301202?text=' + encodeURIComponent('Quiero comprar: ' + items.map(i=>i.title).join(', ')), '_blank');
  }catch(e){
    console.error(e);
    window.open('https://wa.me/573202301202?text=' + encodeURIComponent('Quiero comprar: ' + items.map(i=>i.title).join(', ')), '_blank');
  }
}

/* Booking modal */
function openBookingModal(service){
  overlay.style.display='block'; productModal.style.display='block';
  productModal.innerHTML = `
    <div style="max-width:560px;width:100%">
      <h2>Agendar - ${service.title}</h2>
      <label>Nombre</label><input id="b_name"/><label>Correo</label><input id="b_email"/><label>Teléfono</label><input id="b_phone"/>
      <label>Fecha</label><input id="b_date" type="date"/><label>Hora</label><input id="b_time" type="time"/>
      <div style="margin-top:8px;display:flex;gap:8px"><button class="btn" id="confirmBooking">Registrar</button><button class="btn" id="cancelBooking">Cerrar</button></div>
    </div>
  `;
  document.getElementById('cancelBooking').addEventListener('click', closeModal);
  document.getElementById('confirmBooking').addEventListener('click', async ()=>{
    const payload = {
      name: document.getElementById('b_name').value,
      email: document.getElementById('b_email').value,
      phone: document.getElementById('b_phone').value,
      date: document.getElementById('b_date').value,
      time: document.getElementById('b_time').value,
      serviceId: service.id,
      serviceTitle: service.title
    };
    // call serverless book function
    try{
      const res = await fetch('/.netlify/functions/book', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
      const js = await res.json();
      if(js && js.success){ showToast('Cita registrada. Te contactaremos.'); closeModal(); }
      else { alert('La reserva no se pudo procesar en el servidor. Se abrirá WhatsApp para confirmar.'); window.open('https://wa.me/573202301202?text=' + encodeURIComponent('Reserva: ' + JSON.stringify(payload)), '_blank'); closeModal(); }
    }catch(err){ console.error(err); window.open('https://wa.me/573202301202?text=' + encodeURIComponent('Reserva: ' + JSON.stringify(payload)), '_blank'); closeModal(); }
  });
}

/* Handle public simple form */
document.getElementById('citaForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const nombre=document.getElementById('nombre').value;
  const correo=document.getElementById('correo').value;
  const telefono=document.getElementById('telefono').value;
  const fecha=document.getElementById('fecha').value;
  const hora=document.getElementById('hora').value;
  const payload = { name:nombre, email:correo, phone:telefono, date:fecha, time:hora, serviceId:'general', serviceTitle:'Consulta general' };
  // try serverless book, else Whatsapp
  fetch('/.netlify/functions/book', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
    .then(r=>r.json()).then(js=>{ if(js && js.success){ showToast('Cita enviada. Revisa tu correo.'); } else { window.open('https://wa.me/573202301202?text='+encodeURIComponent('Reserva: '+JSON.stringify(payload)),'_blank'); } })
    .catch(()=> window.open('https://wa.me/573202301202?text='+encodeURIComponent('Reserva: '+JSON.stringify(payload)),'_blank'));
});

/* Nav smooth fade-in on click */
document.querySelectorAll('.nav-link').forEach(link=>{
  link.addEventListener('click', e=>{
    e.preventDefault();
    const id = link.getAttribute('href').replace('#','');
    const target = document.getElementById(id);
    target.scrollIntoView({behavior:'smooth'});
    target.style.opacity=0; setTimeout(()=> target.style.opacity=1, 300);
  });
});

/* Init render */
document.addEventListener('DOMContentLoaded', ()=>{ renderProducts(); renderServices(); renderCart(); });
