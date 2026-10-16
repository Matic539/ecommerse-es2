/* Matex · Prototipo de tienda online con asesor IA (ES2 E-Commerce, INACAP)
   Todo el front es estático. El asesor llama a /api/chat (función serverless),
   que es donde vive la API key. Nunca pongas la key en este archivo. */
(function () {
  'use strict';

  // ---------- Utilidades ----------
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const clp = n => '$' + Math.round(n).toLocaleString('es-CL');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function shade(hex, pct) {
    const n = parseInt(hex.slice(1), 16);
    let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const f = pct / 100;
    r = Math.max(0, Math.min(255, Math.round(r + (f < 0 ? r : 255 - r) * f)));
    g = Math.max(0, Math.min(255, Math.round(g + (f < 0 ? g : 255 - g) * f)));
    b = Math.max(0, Math.min(255, Math.round(b + (f < 0 ? b : 255 - b) * f)));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  // Texturas generadas con CSS (reemplazables por fotos reales o imágenes de Leonardo/Ideogram)
  function tex(kind, c) {
    const d = shade(c, -22), l = shade(c, 18);
    switch (kind) {
      case 'siding': return `repeating-linear-gradient(180deg, ${d} 0 3px, ${l} 3px 5px, ${c} 5px 40px), repeating-linear-gradient(90deg, rgba(255,255,255,.07) 0 2px, transparent 2px 17px), ${c}`;
      case 'boards': return `repeating-linear-gradient(90deg, ${d} 0 3px, ${c} 3px 44px), repeating-linear-gradient(90deg, rgba(0,0,0,.05) 0 1px, transparent 1px 9px), ${c}`;
      case 'marble': {
        const v = parseInt(c.slice(1), 16) > 0x777777 ? 'rgba(80,80,90,.35)' : 'rgba(255,255,255,.45)';
        return `radial-gradient(ellipse at 25% 20%, rgba(255,255,255,.25), transparent 45%), linear-gradient(118deg, transparent 38%, ${v} 39%, transparent 40.5%), linear-gradient(64deg, transparent 60%, ${v} 60.6%, transparent 62%), linear-gradient(150deg, transparent 75%, ${v} 75.4%, transparent 76.5%), ${c}`;
      }
      case 'plank': return `repeating-linear-gradient(90deg, ${d} 0 2px, transparent 2px 70px), repeating-linear-gradient(0deg, ${d} 0 2px, ${c} 2px 30px, ${l} 30px 32px, ${c} 32px 60px), ${c}`;
      case 'ply': return `repeating-radial-gradient(ellipse at 30% 50%, ${c} 0 7px, ${d} 7px 9px), ${c}`;
      case 'stone': return `radial-gradient(circle at 20% 30%, ${l} 0 12%, transparent 13%), radial-gradient(circle at 70% 60%, ${d} 0 14%, transparent 15%), radial-gradient(circle at 45% 85%, ${l} 0 10%, transparent 11%), ${c}`;
      case 'profile': return `linear-gradient(180deg, ${l}, ${c} 45%, ${d} 55%, ${c})`;
      case 'tube': return `linear-gradient(90deg, ${d}, ${l} 35%, ${c} 70%, ${d})`;
      default: return c;
    }
  }

  // ---------- Catálogo (precios y stock referenciales, inventario sept. 2026) ----------
  const FAMS = [
    ['todos', 'Todos'],
    ['exterior', 'Revestimiento exterior'],
    ['wall', 'Wall panel'],
    ['marmol', 'Marmolísima y mármol SPC'],
    ['pisos', 'Pisos SPC'],
    ['terciado', 'Terciados'],
    ['acc', 'Accesorios y adhesivos']
  ];
  const P = [
    { id: 'metal-siding', fam: 'exterior', name: 'Metal Siding', sub: 'Panel metálico símil madera para fachadas', price: 18990, promo: 16990, unit: 'panel', dims: '3.800 x 383 mm', area: 1.455, tex: 'siding', rating: 4.8, nrev: 126, tag: 'Más vendido',
      colors: [{ n: 'Ciprés', c: '#b8875a', s: 336 }, { n: 'Alerce', c: '#9a5b3c', s: 288 }, { n: 'Gris', c: '#7f8386', s: 274 }, { n: 'Black Wood', c: '#2f2a26', s: 33 }, { n: 'Blanco', c: '#e9e7e1', s: 4 }],
      desc: 'Revestimiento metálico con terminación símil madera, pensado para el clima lluvioso del sur. No se pudre, no requiere barniz y se instala en seco con perfiles. Ideal para fachadas, tapacanes y muros interiores de acento.',
      specs: { Uso: 'Exterior e interior', Formato: '3.800 x 383 mm por panel', 'Rendimiento referencial': '1,45 m² por panel', Instalación: 'En seco, sobre estructura, con perfil de inicio, J y V', Origen: 'Importado' },
      install: 'Se instala de abajo hacia arriba partiendo con el perfil de inicio. Los perfiles J terminan bordes y vanos, y los perfiles V resuelven esquinas exteriores. Recomendamos un 10% adicional por cortes.' },
    { id: 't111', fam: 'wall', name: 'Wall Panel T1-11', sub: 'Tabla decorativa ranurada para muros interiores', price: 6990, promo: 5990, unit: 'tabla', dims: '201 x 2.440 mm', area: 0.49, tex: 'boards', rating: 4.7, nrev: 88, tag: 'Oferta',
      colors: [{ n: 'Claro', c: '#c9a27a', s: 1023 }, { n: 'Dark', c: '#5a3d2b', s: 939 }, { n: 'Light', c: '#dcc3a1', s: 1333 }],
      desc: 'Wall panel con textura de madera para renovar living, dormitorios y locales comerciales en un día. Liviano, fácil de cortar y sin terminaciones posteriores.',
      specs: { Uso: 'Interior', Formato: '201 x 2.440 mm por tabla', 'Rendimiento referencial': '0,49 m² por tabla', Instalación: 'Clip de montaje y adhesivo No Clavo', Origen: 'Importado' },
      install: 'Se fija con clips de montaje sobre listones o directamente con adhesivo sobre superficies lisas. Usamos como referencia 3 clips por tabla.' },
    { id: 'elm', fam: 'wall', name: 'Wall Panel ELM', sub: 'Tabla decorativa de veta fina', price: 5990, unit: 'tabla', dims: '168 x 2.440 mm', area: 0.41, tex: 'boards', rating: 4.6, nrev: 54,
      colors: [{ n: 'Light Claro', c: '#d8c2a0', s: 415 }, { n: 'Aged', c: '#8d7a66', s: 521 }, { n: 'Grey', c: '#9a9690', s: 6 }],
      desc: 'Wall panel de formato angosto y veta fina para muros de acento, respaldos de cama y cielos.',
      specs: { Uso: 'Interior', Formato: '168 x 2.440 mm por tabla', 'Rendimiento referencial': '0,41 m² por tabla', Instalación: 'Clip de montaje y adhesivo', Origen: 'Importado' },
      install: 'Igual que T1-11: clips de montaje o adhesivo. Referencia de 3 clips por tabla.' },
    { id: 'marmolisima', fam: 'marmol', name: 'Marmolísima 8 mm', sub: 'Plancha símil mármol para baños, cocinas y muros', price: 33990, unit: 'plancha', dims: '1.220 x 2.440 mm', area: 2.977, tex: 'marble', rating: 4.9, nrev: 97, tag: 'Favorito en baños',
      colors: [{ n: 'Blanco', c: '#f1efea', s: 118 }, { n: 'Gris', c: '#9b9da0', s: 142 }, { n: 'Piedra Café', c: '#8a6b52', s: 157 }, { n: 'Azul', c: '#2f4b6e', s: 95 }, { n: 'Negro', c: '#1f1f22', s: 0 }],
      desc: 'Plancha de gran formato con apariencia de mármol, resistente a la humedad. Reemplaza la cerámica en baños y cocinas con menos uniones y sin fragüe.',
      specs: { Uso: 'Interior, zonas húmedas', Formato: '1.220 x 2.440 mm, 8 mm', 'Rendimiento referencial': '2,98 m² por plancha', Instalación: 'Adhesivo Fix All y perfiles H o W', Origen: 'Importado' },
      install: 'Se adhiere con Fix All sobre superficie plana y seca. Las uniones se resuelven con perfil H (Grey o Gold). Referencia: 1,5 cartuchos de adhesivo por plancha.' },
    { id: 'marmol-spc', fam: 'marmol', name: 'Mármol SPC 3 mm', sub: 'Lámina rígida símil mármol, ultra delgada', price: 27990, promo: 24990, unit: 'plancha', dims: 'Consultar', area: null, tex: 'marble', rating: 4.6, nrev: 21,
      colors: [{ n: 'Cuarzo', c: '#e8e4dc', s: 100 }, { n: 'Roca', c: '#6f6a64', s: 99 }, { n: 'Concreto', c: '#a3a19c', s: 0 }],
      desc: 'Lámina SPC de 3 mm con terminación mármol, para renovar muros sin demoler.',
      specs: { Uso: 'Interior', Espesor: '3 mm', Instalación: 'Adhesivo', Origen: 'Importado' },
      install: 'Consulta el rendimiento con Max o en tienda.' },
    { id: 'piso-spc', fam: 'pisos', name: 'Piso vinílico SPC', sub: 'Piso flotante rígido, resistente al agua', price: 35178, unit: 'caja', dims: 'Caja de 2,20 m²', area: 2.2, tex: 'plank', rating: 4.7, nrev: 73,
      colors: [{ n: 'Dark', c: '#5b4636', s: 445 }, { n: 'Grey', c: '#a7a29b', s: 17 }, { n: 'Medium', c: '#8c6a4c', s: 6 }],
      desc: 'Piso SPC de núcleo rígido con sistema click. Resistente al agua, ideal para el clima de Los Lagos.',
      specs: { Uso: 'Interior', Formato: 'Caja de 2,20 m²', Instalación: 'Flotante, sistema click', Origen: 'Importado' },
      install: 'Instalación flotante sobre superficie nivelada. Considera 10% adicional por cortes.' },
    { id: 'terciado-15', fam: 'terciado', name: 'Terciado estructural 15 mm', sub: 'Placa estructural para obra gruesa', price: 20990, promo: 18990, unit: 'placa', dims: '1.220 x 2.440 mm', area: 2.977, tex: 'ply', rating: 4.5, nrev: 32,
      colors: [{ n: 'Natural', c: '#d4b07c', s: 61 }],
      desc: 'Terciado estructural nacional de 15 mm para pisos, muros y techumbres.',
      specs: { Uso: 'Estructural', Formato: '1.220 x 2.440 mm, 15 mm', Origen: 'Nacional' }, install: 'Fijación mecánica sobre estructura.' },
    // Accesorios (donde se concentra el margen de Matex)
    { id: 'ms-inicio', fam: 'acc', acc: true, name: 'Perfil de inicio Metal Siding', price: 7990, unit: 'perfil', tex: 'profile', rating: 4.7, nrev: 18, colors: [{ n: 'Único', c: '#9aa0a6', s: 72 }], desc: 'Perfil base para comenzar la instalación de Metal Siding.', specs: { Uso: 'Accesorio de instalación' } },
    { id: 'ms-j', fam: 'acc', acc: true, name: 'Perfil J Metal Siding', price: 8990, unit: 'perfil', tex: 'profile', rating: 4.7, nrev: 22, colors: [{ n: 'Ciprés', c: '#b8875a', s: 348 }, { n: 'Alerce', c: '#9a5b3c', s: 282 }, { n: 'Gris', c: '#7f8386', s: 200 }, { n: 'Black Wood', c: '#2f2a26', s: 164 }], desc: 'Terminación de bordes y vanos de puertas y ventanas.', specs: { Uso: 'Accesorio de instalación' } },
    { id: 'ms-v', fam: 'acc', acc: true, name: 'Perfil V esquinero Metal Siding', price: 8990, unit: 'perfil', tex: 'profile', rating: 4.6, nrev: 15, colors: [{ n: 'Ciprés', c: '#b8875a', s: 56 }, { n: 'Alerce', c: '#9a5b3c', s: 40 }, { n: 'Gris', c: '#7f8386', s: 24 }], desc: 'Resuelve esquinas exteriores.', specs: { Uso: 'Accesorio de instalación' } },
    { id: 'clip', fam: 'acc', acc: true, name: 'Clip de montaje 40 x 30 mm', price: 199, unit: 'clip', tex: 'profile', rating: 4.8, nrev: 40, colors: [{ n: 'Único', c: '#b9bcc0', s: 4000 }], desc: 'Clip para instalar wall panel T1-11 y ELM.', specs: { Uso: 'Accesorio de instalación' } },
    { id: 'noclavo', fam: 'acc', acc: true, name: 'Adhesivo No Clavo 280 ml', price: 4490, unit: 'cartucho', tex: 'tube', rating: 4.7, nrev: 35, colors: [{ n: 'Único', c: '#e7b23a', s: 105 }], desc: 'Adhesivo de montaje para wall panel y molduras.', specs: { Uso: 'Adhesivo de montaje' } },
    { id: 'fixall', fam: 'acc', acc: true, name: 'Adhesivo Fix All 290 ml', price: 8990, unit: 'cartucho', tex: 'tube', rating: 4.9, nrev: 44, colors: [{ n: 'Único', c: '#3f6fb5', s: 122 }], desc: 'Adhesivo sellante de alta adherencia para Marmolísima.', specs: { Uso: 'Adhesivo y sellante' } },
    { id: 'mm-h', fam: 'acc', acc: true, name: 'Perfil H Marmolísima 2.900 mm', price: 4990, unit: 'perfil', tex: 'profile', rating: 4.7, nrev: 19, colors: [{ n: 'Grey', c: '#a5a8ab', s: 874 }, { n: 'Gold', c: '#c9a64b', s: 416 }], desc: 'Perfil de unión entre planchas de Marmolísima.', specs: { Uso: 'Accesorio de instalación' } }
  ];
  const byId = id => P.find(p => p.id === id);
  // Usa el mismo color del producto principal en perfiles cuando existe
  const accColor = (id, name) => Math.max(0, byId(id).colors.findIndex(c => c.n === name));

  // Accesorios sugeridos por producto (cantidades referenciales)
  function accFor(p, units, m2) {
    if (!units) return [];
    switch (p.id) {
      case 'metal-siding': return [['ms-inicio', Math.max(1, Math.ceil(m2 / 12))], ['ms-j', Math.max(1, Math.ceil(m2 / 8))], ['ms-v', 2]];
      case 't111': case 'elm': return [['clip', units * 3], ['noclavo', Math.max(1, Math.ceil(units / 12))]];
      case 'marmolisima': return [['fixall', Math.ceil(units * 1.5)], ['mm-h', Math.max(1, units - 1)]];
      default: return [];
    }
  }

  const REVIEWS = [
    { n: 'Jorge M.', r: 'Maestro instalador · Puerto Montt', s: 5, t: 'Instalé Metal Siding Ciprés en una fachada de 60 m². El stock estaba completo y lo retiré el mismo día. Los perfiles calzan perfecto.', p: ['metal-siding', 0], c: '#7a5c3e' },
    { n: 'Carolina R.', r: 'Particular · Puerto Varas', s: 5, t: 'Nunca había comprado materiales por internet. El asesor me calculó las planchas de Marmolísima para el baño y sobró justo lo necesario.', p: ['marmolisima', 0], c: '#3f6fb5' },
    { n: 'Patricio V.', r: 'Contratista · Llanquihue', s: 4, t: 'Buen precio frente a las grandes tiendas y sin esperar reposición. Me gustaría poder pagar con orden de compra en línea.', p: ['t111', 1], c: '#4a7a5a' },
    { n: 'Daniela S.', r: 'Particular · Puerto Montt', s: 5, t: 'El muro del living con T1-11 Claro quedó increíble. El video de instalación me ayudó a explicarle al maestro.', p: ['t111', 0], c: '#b0563a' },
    { n: 'Luis A.', r: 'Maestro · Osorno', s: 5, t: 'Pedí piso SPC Dark y llegó en 48 horas. La caja trae lo que dice, cero sorpresas.', p: ['piso-spc', 0], c: '#5b4f7a' },
    { n: 'Francisca T.', r: 'Particular · Frutillar', s: 4, t: 'Me daba miedo pagar en línea, pero aparecía Webpay y me llegó la boleta al tiro. Recomendado.', p: ['metal-siding', 2], c: '#8a6a2a' }
  ];

  // ---------- Medición de adopción (solo en este navegador, para la demo de KPIs) ----------
  const KPI_KEY = 'matex_kpi_demo';
  function kpiGet() { try { return JSON.parse(localStorage.getItem(KPI_KEY)) || {}; } catch (e) { return {}; } }
  function track(evt, val) {
    try {
      const k = kpiGet();
      if (evt === 'nps') { (k.nps = k.nps || []).push(val); }
      else { k[evt] = (k[evt] || 0) + 1; }
      if (evt === 'checkout_start') k.t0 = Date.now();
      if (evt === 'purchase' && k.t0) { (k.closeSecs = k.closeSecs || []).push(Math.round((Date.now() - k.t0) / 1000)); }
      localStorage.setItem(KPI_KEY, JSON.stringify(k));
    } catch (e) { /* almacenamiento no disponible: la demo sigue funcionando */ }
  }
  track('visit');

  // ---------- Estado ----------
  const state = { cart: [], current: null, color: 0, m2: '', mode: 'm2', L: '', H: '', thumb: 0, tab: 'desc', qty: 1, accSel: {} };
  try { const c = JSON.parse(localStorage.getItem('matex_cart')); if (Array.isArray(c)) state.cart = c; } catch (e) {}
  function saveCart() { try { localStorage.setItem('matex_cart', JSON.stringify(state.cart)); } catch (e) {} }

  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2200); }
  function stockPill(s) {
    if (s <= 0) return '<span class="pill warn">● Sin stock · llega en la próxima importación</span>';
    if (s < 50) return `<span class="pill warn">● Últimas ${s} unidades</span>`;
    return `<span class="pill ok"><i class="dot"></i> ${s.toLocaleString('es-CL')} disponibles · retiro hoy</span>`;
  }
  const priceOf = p => p.promo || p.price;
  const pl = (u, n) => n === 1 ? u : (/[aeiou]$/.test(u) ? u + 's' : u + 'es');
  const stars = r => '★★★★★'.slice(0, Math.round(r)) + '☆☆☆☆☆'.slice(0, 5 - Math.round(r));

  // ---------- Navegación ----------
  $('#catNav').innerHTML = FAMS.map(([k, v]) => `<a href="#/c/${k}">${v}</a>`).join('') + '<a href="#/kpis">📊 Panel de adopción (demo)</a>';

  function route() {
    const h = location.hash || '#/';
    const m = h.match(/^#\/(p|c|kpis)\/?([\w-]*)/);
    $('#oneclick').classList.remove('show');
    closeAll();
    if (m && m[1] === 'p' && byId(m[2])) renderPDP(byId(m[2]));
    else if (m && m[1] === 'kpis') renderKPIs();
    else renderHome(m && m[1] === 'c' ? m[2] : 'todos');
    window.scrollTo({ top: 0 });
    updateChips();
  }
  window.addEventListener('hashchange', route);

  // ---------- Inicio ----------
  function card(p) {
    const s = p.colors.reduce((a, c) => a + Math.max(0, c.s), 0);
    return `<a class="card" href="#/p/${p.id}">
      <div class="img" style="background:${tex(p.tex, p.colors[0].c)}">${p.tag ? `<span class="pill ${p.promo ? 'sale' : 'ok'}">${p.tag}</span>` : (p.promo ? '<span class="pill sale">Oferta</span>' : '')}</div>
      <div class="body">
        <div class="name">${p.name}</div>
        <div class="meta">${p.dims ? p.dims : (p.sub || '')}</div>
        <div class="meta"><span class="stars">${stars(p.rating)}</span> ${p.rating} (${p.nrev})</div>
        ${p.colors.length > 1 ? `<div class="swatches-mini">${p.colors.map(c => `<i style="background:${c.c}" title="${c.n}"></i>`).join('')}</div>` : ''}
        <div class="price"><span class="now">${clp(priceOf(p))}</span>${p.promo ? `<span class="was">${clp(p.price)}</span>` : ''}<span class="meta">/ ${p.unit}</span></div>
        <div class="meta">${s > 0 ? '🟢 Stock en línea' : '🟠 Sin stock'}</div>
      </div></a>`;
  }
  function reviewHTML(r) {
    const p = byId(r.p[0]);
    return `<article class="review">
      <div class="who"><span class="avatar" style="background:${r.c}">${r.n[0]}</span><div><b>${r.n}</b><span class="note">${r.r}</span></div></div>
      <div><span class="stars">${stars(r.s)}</span> <span class="verified">✔ Compra verificada</span></div>
      <p>${r.t}</p>
      <div class="photos"><i style="background:${tex(p.tex, p.colors[r.p[1]].c)}"></i><i style="background:${tex(p.tex, shade(p.colors[r.p[1]].c, 10))};background-size:180%"></i></div>
      <span class="note">Producto: ${p.name} ${p.colors[r.p[1]].n}</span>
    </article>`;
  }
  function renderHome(fam) {
    state.current = null;
    const list = P.filter(p => fam === 'todos' ? !p.acc : p.fam === fam);
    const famName = (FAMS.find(f => f[0] === fam) || FAMS[0])[1];
    $('#app').innerHTML = `
    <section class="hero"><div class="wrap">
      <div>
        <span class="eyebrow"><i class="dot"></i> Stock en línea, actualizado al momento de tu compra</span>
        <h1>Revestimientos y terminaciones que llegan cuando tu obra los necesita.</h1>
        <p class="lead">Metal Siding, Wall Panel, Marmolísima y pisos SPC con retiro hoy en Puerto Montt o despacho a todo el sur. Calcula tu proyecto en 3 clics y compra sin esperar reposición.</p>
        <div class="ctas"><button class="btn btn-primary" type="button" data-quiz>🧮 Calcular mi proyecto</button><button class="btn btn-ghost" type="button" data-chat>💬 Hablar con un asesor</button></div>
      </div>
      <div class="hero-art" aria-hidden="true">
        <div class="wall" style="background:${tex('siding', '#b8875a')}"></div>
        <div class="floor" style="background:${tex('plank', '#5b4636')}"></div>
        <div class="tag" style="top:16px;left:16px"><b>Metal Siding Ciprés</b>336 disponibles · retiro hoy</div>
        <div class="tag" style="bottom:16px;right:16px"><b>Piso SPC Dark</b>Resistente al agua</div>
      </div>
    </div></section>
    <div class="wrap">
      <div class="trust-strip">
        <div class="trust"><span class="ic">🔒</span><div><b>Pago 100% seguro</b><span>Webpay, Mercado Pago o transferencia. Boleta o factura.</span></div></div>
        <div class="trust"><span class="ic">📦</span><div><b>Stock real y retiro hoy</b><span>Lo que ves disponible está en bodega.</span></div></div>
        <div class="trust"><span class="ic">↩️</span><div><b>Cambios en 30 días</b><span>Producto sin instalar y en su embalaje.</span></div></div>
        <div class="trust"><span class="ic">🚚</span><div><b>Envío rápido</b><span>24 h en Puerto Montt, 48 a 72 h en la región.</span></div></div>
      </div>
    </div>
    <section class="block"><div class="wrap">
      <div class="sec-head"><div><h2>¿Qué quieres renovar?</h2><p>Elige tu espacio y te recomendamos producto y cantidades.</p></div></div>
      <div class="quiz-cards">
        ${[['exterior', 'Fachada exterior', 'Metal Siding resistente a la lluvia', 'siding', '#9a5b3c'], ['muro', 'Muro interior', 'Wall panel o Marmolísima', 'boards', '#c9a27a'], ['piso', 'Piso', 'SPC resistente al agua', 'plank', '#8c6a4c'], ['bano', 'Baño o cocina', 'Marmolísima sin fragüe', 'marble', '#f1efea']]
          .map(q => `<button class="qcard" type="button" data-quiz="${q[0]}"><div class="sw" style="background:${tex(q[3], q[4])}"></div><div class="tx"><b>${q[1]}</b><span>${q[2]}</span></div></button>`).join('')}
      </div>
    </div></section>
    <section class="block" id="productos"><div class="wrap">
      <div class="sec-head"><div><h2>${fam === 'todos' ? 'Productos destacados' : famName}</h2><p>Precios con IVA incluido. Stock referencial del prototipo.</p></div></div>
      <div class="grid">${list.map(card).join('')}</div>
    </div></section>
    <section class="block"><div class="wrap"><div class="maestro">
      <div><h2>Programa Maestro Matex</h2><p>6 de cada 10 compras en Matex las hace un maestro o contratista. Por eso tienen su propia cuenta.</p>
        <button class="btn btn-primary" type="button" data-chat="Soy maestro, ¿cómo funciona el Programa Maestro Matex?">Quiero unirme</button></div>
      <ul>
        <li>🏷️ <span><b>Precio maestro</b> y cotizaciones guardadas para cada obra.</span></li>
        <li>🔗 <span><b>Código de recomendación</b>: tu cliente compra en línea y la venta queda a tu nombre.</span></li>
        <li>🏅 <span><b>Perfil de instalador verificado</b> con fotos de tus obras y reseñas de clientes.</span></li>
        <li>📲 <span><b>Aviso de llegada</b> de importaciones para planificar tus obras.</span></li>
      </ul>
    </div></div></section>
    <section class="block"><div class="wrap">
      <div class="sec-head"><div><h2>Lo que dicen nuestros clientes</h2><p>4,8 de 5 en 460 reseñas de compras verificadas. <span class="note">(Reseñas ilustrativas del prototipo)</span></p></div></div>
      <div class="reviews">${REVIEWS.slice(0, 3).map(reviewHTML).join('')}</div>
    </div></section>`;
  }

  // ---------- Página de producto ----------
  function calcUnits(p) {
    const m2 = state.mode === 'm2' ? parseFloat(String(state.m2).replace(',', '.')) : (parseFloat(String(state.L).replace(',', '.')) * parseFloat(String(state.H).replace(',', '.')));
    if (!p.area || !m2 || m2 <= 0) return { m2: 0, units: 0 };
    return { m2: Math.round(m2 * 100) / 100, units: Math.ceil((m2 * 1.10) / p.area) };
  }
  function renderPDP(p) {
    if (state.current !== p.id) { state.current = p.id; state.color = Math.max(0, p.colors.findIndex(c => c.s > 0)); state.thumb = 0; state.tab = 'desc'; state.qty = 1; state.accSel = {}; track('view_product'); }
    const col = p.colors[state.color];
    const famName = (FAMS.find(f => f[0] === p.fam) || FAMS[0])[1];
    const thumbs = [
      ['Muestra', tex(p.tex, col.c), ''],
      ['Instalado', `linear-gradient(transparent 72%, ${shade('#5b4636', 0)} 72%), ${tex(p.tex, col.c)}`, ''],
      ['Detalle', tex(p.tex, col.c), 'background-size:220% 220%'],
      ['Tono', `linear-gradient(135deg, ${shade(col.c, 25)}, ${col.c} 50%, ${shade(col.c, -25)})`, '']
    ];
    const pdpReviews = REVIEWS.filter(r => r.p[0] === p.id);
    const shownReviews = (pdpReviews.length ? pdpReviews : REVIEWS).slice(0, 3);
    $('#app').innerHTML = `<div class="wrap">
      <div class="crumbs"><a href="#/">Inicio</a> › <a href="#/c/${p.fam}">${famName}</a> › ${p.name}</div>
      <div class="pdp">
        <div class="gallery">
          <div class="main" id="gMain" style="background:${thumbs[state.thumb][1]};${thumbs[state.thumb][2]}"><span class="lbl">${p.name} ${col.n} · ${thumbs[state.thumb][0]}</span></div>
          <div class="thumbs">${thumbs.map((t, i) => `<button type="button" data-thumb="${i}" aria-pressed="${i === state.thumb}" aria-label="${t[0]}"><span style="background:${t[1]};${t[2]}"></span></button>`).join('')}</div>
          <p class="note" style="margin-top:8px">Imágenes generadas para el prototipo. En producción se reemplazan por fotos reales y de clientes.</p>
        </div>
        <div>
          ${p.tag ? `<span class="pill ${p.promo ? 'sale' : 'ok'}">${p.tag}</span>` : ''}
          <h1>${p.name} ${p.colors.length > 1 ? col.n : ''}</h1>
          <div class="rating"><span class="stars">${stars(p.rating)}</span> <b>${p.rating}</b> <a href="#rev" data-tab="rev">${p.nrev} reseñas verificadas</a></div>
          <div class="price"><span class="now">${clp(priceOf(p))}</span> ${p.promo ? `<span class="was">${clp(p.price)}</span> <span class="pill sale">-${Math.round((1 - p.promo / p.price) * 100)}%</span>` : ''}</div>
          <div class="unit">Precio por ${p.unit}${p.dims ? ' de ' + p.dims : ''}, IVA incluido</div>
          <div class="stock-line">${stockPill(col.s)}</div>
          ${col.s <= 0 ? `<button class="btn btn-ghost" type="button" id="notifyMe">🔔 Avísame cuando llegue</button>` : ''}
          ${p.colors.length > 1 ? `<div class="opt-label">Color <span>${col.n}</span></div>
          <div class="colors" role="group" aria-label="Elegir color">${p.colors.map((c, i) => `<button type="button" class="color ${c.s <= 0 ? 'out' : ''}" data-color="${i}" aria-pressed="${i === state.color}" aria-label="${c.n}${c.s <= 0 ? ' (sin stock)' : ''}" title="${c.n}"><span style="background:${tex(p.tex, c.c)}"></span></button>`).join('')}</div>` : ''}
          ${p.area ? `<div class="calc" id="calc">
            <h3>🧮 ¿Cuánto necesito?</h3><span class="note">Incluye 10% adicional por cortes y pérdidas.</span>
            <div class="row"><div class="seg" role="group" aria-label="Modo de cálculo"><button type="button" data-mode="m2" aria-pressed="${state.mode === 'm2'}">Tengo los m²</button><button type="button" data-mode="dims" aria-pressed="${state.mode === 'dims'}">Largo x alto</button></div></div>
            <div class="row" id="calcInputs">${state.mode === 'm2'
              ? `<label>Superficie <input type="number" min="0" step="0.5" id="m2" value="${esc(state.m2)}" placeholder="0"> m²</label>`
              : `<label>Largo <input type="number" min="0" step="0.1" id="L" value="${esc(state.L)}" placeholder="0"> m</label><label>Alto <input type="number" min="0" step="0.1" id="H" value="${esc(state.H)}" placeholder="0"> m</label>`}</div>
            <div id="calcOut"></div>
          </div>` : ''}
          <div class="buy-row">
            <div class="qty"><button type="button" data-q="-1" aria-label="Restar">−</button><input id="qty" type="number" min="1" value="${state.qty}" aria-label="Cantidad"><button type="button" data-q="1" aria-label="Sumar">+</button></div>
            <button class="btn btn-dark" type="button" id="addCart" ${col.s <= 0 ? 'disabled style="opacity:.5"' : ''}>Agregar al carrito</button>
          </div>
          <div class="buy-row" style="margin-top:10px"><button class="btn btn-primary btn-block" type="button" id="buyNow" ${col.s <= 0 ? 'disabled style="opacity:.5"' : ''}>⚡ Comprar en 1 clic</button></div>
          <div class="seals">
            <div class="seal"><div class="ic">🔒</div><b>Pago 100% seguro</b>Webpay y Mercado Pago</div>
            <div class="seal"><div class="ic">↩️</div><b>Cambios en 30 días</b>Sin instalar</div>
            <div class="seal"><div class="ic">🚚</div><b>Envío rápido</b>Retiro hoy</div>
          </div>
          <div class="ship"><label for="comuna"><b>Calcula tu entrega</b></label>
            <div class="row" style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap"><select id="comuna">
              <option value="">Elige tu comuna</option><option value="pm">Puerto Montt</option><option value="pv">Puerto Varas, Llanquihue o Frutillar</option><option value="os">Osorno</option><option value="ch">Chiloé</option><option value="rc">Resto de Chile</option>
            </select></div><div class="out" id="shipOut">Retiro en tienda: <b>hoy</b>, Av. Presidente Ibáñez 216.</div></div>
          <button class="btn btn-ghost btn-block" type="button" style="margin-top:12px" data-chat="Tengo dudas sobre ${esc(p.name)} ${esc(col.n)}">💬 ¿Dudas? Pregúntale a Max</button>
        </div>
      </div>
      <div class="tabs" role="tablist">${[['desc', 'Descripción'], ['spec', 'Ficha técnica'], ['inst', 'Instalación'], ['rev', `Reseñas (${p.nrev})`], ['faq', 'Preguntas frecuentes']].map(t => `<button type="button" role="tab" data-tab="${t[0]}" aria-selected="${state.tab === t[0]}">${t[1]}</button>`).join('')}</div>
      <div class="tabpanel" id="rev">${tabBody(p, shownReviews)}</div>
    </div>`;
    const oc = $('#oneclick');
    if (col.s > 0) { $('#ocName').textContent = `${p.name} ${p.colors.length > 1 ? col.n : ''}`; $('#ocPrice').textContent = clp(priceOf(p)) + ' / ' + p.unit; oc.classList.add('show'); }
    if (p.area) updateCalc(p);
  }
  function tabBody(p, revs) {
    switch (state.tab) {
      case 'spec': return `<table class="spec">${Object.entries(p.specs || {}).map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}<tr><td>Precio</td><td>${clp(priceOf(p))} por ${p.unit}</td></tr></table>`;
      case 'inst': return `<p>${p.install || 'Consulta con Max o en tienda.'}</p><p class="note">En producción esta pestaña incluye un video corto de instalación y una ficha descargable para el maestro.</p>`;
      case 'rev': return `<div class="rev-summary"><div><div class="score">${p.rating}</div><div class="stars">${stars(p.rating)}</div><div class="note">${p.nrev} reseñas de compras verificadas</div></div>
          <div class="bars">${[[5, 78], [4, 15], [3, 4], [2, 2], [1, 1]].map(b => `<div><span>${b[0]}★</span><i style="--w:${b[1]}%"></i><span>${b[1]}%</span></div>`).join('')}</div></div>
          <div class="reviews">${revs.map(reviewHTML).join('')}</div><p class="note">Reseñas ilustrativas del prototipo. En producción solo se publican reseñas de compras verificadas, con fotos subidas por el cliente.</p>`;
      case 'faq': return `<p><b>¿El stock que veo es real?</b><br>Sí. La tienda lee el stock disponible de bodega (físico + en tránsito − vendido − por despachar), el mismo criterio que usa Matex.</p>
          <p><b>¿Puedo pedir factura?</b><br>Sí, ingresas el RUT de tu empresa en el pago y recibes la factura electrónica por correo.</p>
          <p><b>¿Y si me sobra material?</b><br>Puedes cambiarlo dentro de 30 días si está sin instalar y en su embalaje.</p>
          <p><b>¿Me ayudan con la instalación?</b><br>Max te orienta y, si lo necesitas, te conecta con un maestro del Programa Maestro Matex.</p>`;
      default: return `<p>${p.desc}</p>`;
    }
  }
  function updateCalc(p) {
    const out = $('#calcOut'); if (!out) return;
    const { m2, units } = calcUnits(p);
    if (!units) { out.innerHTML = '<div class="result">Ingresa la superficie para ver cuántas unidades necesitas y los accesorios para instalarlas.</div>'; return; }
    const col = p.colors[state.color];
    const acc = accFor(p, units, m2);
    acc.forEach(([id]) => { if (state.accSel[id] === undefined) state.accSel[id] = true; });
    const accTotal = acc.reduce((a, [id, q]) => a + (state.accSel[id] ? priceOf(byId(id)) * q : 0), 0);
    const total = units * priceOf(p) + accTotal;
    out.innerHTML = `<div class="result">
        <b class="big">${units} ${pl(p.unit, units)} · ${clp(units * priceOf(p))}</b>
        Para ${m2.toLocaleString('es-CL')} m² con rendimiento de ${p.area.toLocaleString('es-CL')} m² por ${p.unit}.
        ${units > col.s ? `<div style="margin-top:6px;color:var(--warn)">⚠️ Hay ${Math.max(0, col.s)} disponibles en ${col.n}. Puedes reservar el resto de la próxima importación o combinar con otro color.</div>` : ''}
      </div>
      ${acc.length ? `<div class="acc"><b style="font-size:14px">Completa tu instalación (cantidades sugeridas)</b>${acc.map(([id, q]) => { const a = byId(id); return `<label><input type="checkbox" data-acc="${id}" ${state.accSel[id] ? 'checked' : ''}> ${q} x ${a.name}<span class="p">${clp(priceOf(a) * q)}</span></label>`; }).join('')}</div>` : ''}
      <button class="btn btn-dark btn-block" type="button" id="addProject" style="margin-top:10px">Agregar proyecto completo · ${clp(total)}</button>`;
    track('calc_used');
  }

  // ---------- Carrito ----------
  function addToCart(id, colorIdx, qty, silent) {
    const p = byId(id); if (!p || qty < 1) return;
    const key = id + ':' + colorIdx;
    const ex = state.cart.find(l => l.key === key);
    if (ex) ex.qty += qty; else state.cart.push({ key, id, colorIdx, qty });
    saveCart(); renderCart(); track('add_cart');
    if (!silent) toast(`Agregado: ${qty} x ${p.name}`);
  }
  function cartTotals() {
    const sub = state.cart.reduce((a, l) => a + priceOf(byId(l.id)) * l.qty, 0);
    return { sub, ship: sub >= 250000 || sub === 0 ? 0 : 9990 };
  }
  function renderCart() {
    $('#cartCount').textContent = state.cart.reduce((a, l) => a + l.qty, 0);
    const items = $('#cartItems');
    if (!state.cart.length) { items.innerHTML = '<p class="note">Tu carrito está vacío. Prueba el calculador de proyecto para armarlo en segundos.</p>'; $('#cartFoot').innerHTML = ''; return; }
    items.innerHTML = state.cart.map((l, i) => { const p = byId(l.id), c = p.colors[l.colorIdx] || p.colors[0]; return `<div class="line"><span class="sw" style="background:${tex(p.tex, c.c)}"></span><div><b style="font-size:14px">${p.name}</b><small>${p.colors.length > 1 ? c.n + ' · ' : ''}${l.qty} x ${clp(priceOf(p))}</small></div><div style="text-align:right"><b>${clp(priceOf(p) * l.qty)}</b><br><button class="x" type="button" style="width:auto;height:auto;padding:2px 8px;font-size:12px;margin-top:4px" data-rm="${i}">Quitar</button></div></div>`; }).join('');
    const t = cartTotals();
    $('#cartFoot').innerHTML = `<div class="sum"><span>Subtotal</span><b>${clp(t.sub)}</b></div>
      <div class="sum"><span>Despacho Puerto Montt</span><b>${t.ship ? clp(t.ship) : 'Gratis'}</b></div>
      ${t.ship ? `<div class="note">Te faltan ${clp(250000 - t.sub)} para despacho gratis.</div>` : ''}
      <div class="sum total"><span>Total</span><span>${clp(t.sub + t.ship)}</span></div>
      <button class="btn btn-primary btn-block" type="button" id="goCheckout">Ir a pagar</button>
      <div class="note" style="text-align:center">🔒 Pago 100% seguro · Boleta o factura electrónica</div>`;
  }
  function openCart() { renderCart(); $('#cart').classList.add('show'); $('#scrim').classList.add('show'); }
  function closeAll() { ['#cart', '#scrim', '#checkout', '#quiz'].forEach(s => $(s).classList.remove('show')); }

  // ---------- Checkout (simulado) ----------
  function openCheckout(oneClick) {
    track('checkout_start');
    const t = cartTotals();
    $('#cart').classList.remove('show');
    $('#scrim').classList.add('show');
    $('#coBox').innerHTML = `<h3 id="coTitle">${oneClick ? '⚡ Compra en 1 clic' : 'Finalizar compra'}</h3>
      <p class="note">${oneClick ? 'Usamos tus datos guardados. Solo confirma.' : 'Un solo paso, sin crear cuenta.'}</p>
      <div class="sum" style="margin-top:10px"><span>${state.cart.length} producto(s)</span><b>${clp(t.sub)}</b></div>
      <form id="coForm">
        <div class="field"><label for="entrega">Entrega</label><select id="entrega"><option value="retiro">Retiro en tienda hoy (gratis)</option><option value="desp">Despacho a domicilio ${t.ship ? '(' + clp(t.ship) + ')' : '(gratis)'}</option></select></div>
        ${oneClick ? `<div class="field"><span>Datos guardados</span><div class="result" style="background:var(--surface-2);border-radius:10px;padding:10px">Cliente Demo · cliente@ejemplo.cl · +56 9 1234 5678<br>Tarjeta terminada en 4242 (Webpay)</div></div>` : `
        <div class="field"><label for="nom">Nombre</label><input id="nom" autocomplete="name" required placeholder="Nombre y apellido"></div>
        <div class="field"><label for="mail">Correo</label><input id="mail" type="email" autocomplete="email" required placeholder="tu@correo.cl"></div>
        <div class="field"><label for="tel">Teléfono</label><input id="tel" type="tel" autocomplete="tel" placeholder="+56 9"></div>
        <div class="field"><span>Medio de pago</span><div class="pay">
          <label><input type="radio" name="pay" value="webpay" checked><span>Webpay<br><small>Débito o crédito</small></span></label>
          <label><input type="radio" name="pay" value="mp"><span>Mercado Pago</span></label>
          <label><input type="radio" name="pay" value="tr"><span>Transferencia</span></label></div></div>
        <div class="field"><label for="doc">Documento</label><select id="doc"><option>Boleta electrónica</option><option>Factura electrónica (ingresar RUT)</option></select></div>`}
        <button class="btn btn-primary btn-block" style="margin-top:16px" type="submit">Pagar ${clp(t.sub)}</button>
        <button class="btn btn-ghost btn-block" style="margin-top:8px" type="button" data-close>Seguir comprando</button>
        <p class="note" style="text-align:center">🔒 Conexión cifrada · Compra simulada del prototipo, no se realizan cobros.</p>
      </form>`;
    $('#checkout').classList.add('show');
    $('#coForm').addEventListener('submit', e => {
      e.preventDefault();
      track('purchase');
      const n = 'MTX-' + Math.floor(100000 + Math.random() * 899999);
      const retiro = $('#entrega').value === 'retiro';
      state.cart = []; saveCart(); renderCart();
      $('#coBox').innerHTML = `<h3>✅ ¡Compra confirmada!</h3><p>Pedido <b>${n}</b>. ${retiro ? 'Tu pedido estará listo para retiro hoy desde las 15:00 en Av. Presidente Ibáñez 216.' : 'Te avisaremos por correo y WhatsApp cuando salga el despacho.'}</p>
        <div class="calc"><h3>¿Qué tan seguro te sentiste comprando en la tienda online de Matex?</h3><span class="note">0 = nada seguro · 10 = totalmente seguro</span>
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:10px">${Array.from({ length: 11 }, (_, i) => `<button class="x" style="width:38px" type="button" data-nps="${i}">${i}</button>`).join('')}</div></div>
        <button class="btn btn-dark btn-block" style="margin-top:14px" type="button" data-close>Volver a la tienda</button>`;
    });
  }

  // ---------- Quiz de proyecto (3 clics) ----------
  const QZ = {
    exterior: { p: 'metal-siding', st: { madera: 0, marmol: 2, oscuro: 3, claro: 2 } },
    muro: { p: { madera: 't111', marmol: 'marmolisima', oscuro: 't111', claro: 'elm' }, st: { madera: 0, marmol: 0, oscuro: 1, claro: 0 } },
    piso: { p: 'piso-spc', st: { madera: 0, marmol: 1, oscuro: 0, claro: 1 } },
    bano: { p: 'marmolisima', st: { madera: 2, marmol: 0, oscuro: 3, claro: 1 } }
  };
  let qz = {};
  function openQuiz(space) {
    qz = { space: space || null, style: null, m2: '' };
    $('#scrim').classList.add('show'); $('#quiz').classList.add('show'); drawQuiz();
  }
  function drawQuiz() {
    const step = !qz.space ? 1 : !qz.style ? 2 : 3;
    const prog = `<div class="progress">${[1, 2, 3].map(i => `<i class="${i <= step ? 'on' : ''}"></i>`).join('')}</div>`;
    let body = '';
    if (step === 1) body = `<h3 id="qzTitle">¿Qué quieres renovar?</h3>${prog}<div class="options">${[['exterior', 'Fachada exterior', 'siding', '#9a5b3c'], ['muro', 'Muro interior', 'boards', '#c9a27a'], ['piso', 'Piso', 'plank', '#8c6a4c'], ['bano', 'Baño o cocina', 'marble', '#f1efea']].map(o => `<button type="button" data-qs="${o[0]}"><span class="sw" style="background:${tex(o[2], o[3])}"></span>${o[1]}</button>`).join('')}</div>`;
    else if (step === 2) body = `<h3 id="qzTitle">¿Qué estilo buscas?</h3>${prog}<div class="options">${[['madera', 'Madera cálida', 'boards', '#b8875a'], ['marmol', 'Mármol elegante', 'marble', '#f1efea'], ['oscuro', 'Moderno oscuro', 'boards', '#2f2a26'], ['claro', 'Claro y neutro', 'boards', '#dcc3a1']].map(o => `<button type="button" data-qy="${o[0]}"><span class="sw" style="background:${tex(o[2], o[3])}"></span>${o[1]}</button>`).join('')}</div>`;
    else {
      const cfg = QZ[qz.space];
      const pid = typeof cfg.p === 'string' ? cfg.p : cfg.p[qz.style];
      const p = byId(pid); const ci = cfg.st[qz.style] || 0; const c = p.colors[ci] || p.colors[0];
      const m2 = parseFloat(String(qz.m2).replace(',', '.')) || 0;
      const units = m2 ? Math.ceil(m2 * 1.1 / p.area) : 0;
      const acc = accFor(p, units, m2);
      const total = units * priceOf(p) + acc.reduce((a, [id, q]) => a + priceOf(byId(id)) * q, 0);
      body = `<h3 id="qzTitle">¿Cuántos m² son?</h3>${prog}
        <div class="field"><label for="qzm2">Superficie aproximada (m²)</label><input id="qzm2" type="number" min="0" step="0.5" value="${esc(qz.m2)}" placeholder="Ej: 25"></div>
        <div class="calc"><div style="display:flex;gap:12px;align-items:center"><span class="sw" style="width:64px;height:64px;border-radius:12px;flex:none;background:${tex(p.tex, c.c)}"></span>
          <div><b>Te recomendamos: ${p.name} ${c.n}</b><div class="note">${p.sub}</div>${stockPill(c.s)}</div></div>
          ${units ? `<div class="result"><b class="big">${units} ${pl(p.unit, units)} · ${clp(units * priceOf(p))}</b>${acc.length ? 'Más accesorios: ' + acc.map(([id, q]) => q + ' x ' + byId(id).name).join(', ') + '.' : ''}<br><b>Total proyecto: ${clp(total)}</b></div>` : '<div class="result">Ingresa los m² para calcular cantidades y total.</div>'}
        </div>
        <div class="buy-row"><a class="btn btn-ghost" href="#/p/${p.id}" data-close data-goto="${p.id}:${ci}">Ver producto</a><button class="btn btn-primary" type="button" id="qzAdd" ${units ? '' : 'disabled style="opacity:.5"'}>Agregar al carrito</button></div>`;
      setTimeout(() => {
        const inp = $('#qzm2'); if (!inp) return;
        inp.focus(); const v = inp.value; inp.value = ''; inp.value = v;
        inp.addEventListener('input', () => { qz.m2 = inp.value; clearTimeout(drawQuiz._t); drawQuiz._t = setTimeout(drawQuiz, 450); });
        const add = $('#qzAdd'); if (add) add.addEventListener('click', () => { addToCart(p.id, ci, units, true); acc.forEach(([id, q]) => addToCart(id, accColor(id, c.n), q, true)); closeAll(); openCart(); toast('Proyecto agregado al carrito'); });
        $$('[data-goto]').forEach(a => a.addEventListener('click', () => { state.current = p.id; state.color = ci; state.m2 = qz.m2; state.mode = 'm2'; state.thumb = 0; state.tab = 'desc'; state.accSel = {}; track('view_product'); }));
      });
    }
    $('#qzBox').innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><span class="note">Calculador de proyecto · paso ${step} de 3</span><button class="x" type="button" data-close aria-label="Cerrar">×</button></div>${body}`;
  }

  // ---------- Panel de KPIs (demo) ----------
  function renderKPIs() {
    state.current = null;
    const k = kpiGet();
    const v = k.visit || 0, pur = k.purchase || 0, cs = k.checkout_start || 0, ac = k.add_cart || 0;
    const conv = v ? (pur / v * 100) : 0;
    const aband = cs ? ((cs - pur) / cs * 100) : 0;
    const nps = k.nps || [];
    const npsScore = nps.length ? Math.round((nps.filter(x => x >= 9).length - nps.filter(x => x <= 6).length) / nps.length * 100) : null;
    const cl = k.closeSecs || [];
    const avgClose = cl.length ? Math.round(cl.reduce((a, b) => a + b, 0) / cl.length) : null;
    const tile = (t, val, sub) => `<div class="trust" style="display:block"><span class="note">${t}</span><div style="font-family:var(--display);font-size:34px;font-weight:800">${val}</div><span class="note">${sub}</span></div>`;
    $('#app').innerHTML = `<div class="wrap"><section class="block">
      <div class="sec-head"><div><h2>Panel de adopción (demo)</h2><p>Eventos registrados en este navegador mientras usas el prototipo. Demuestra cómo se instrumentan los KPIs del cuadro de mando.</p></div><button class="btn btn-ghost" type="button" id="kpiReset">Reiniciar</button></div>
      <div class="trust-strip">
        ${tile('Tasa de conversión', conv.toFixed(1) + '%', `${pur} compras / ${v} visitas`)}
        ${tile('Abandono de carrito', aband.toFixed(0) + '%', `${cs - pur < 0 ? 0 : cs - pur} de ${cs} checkouts sin terminar`)}
        ${tile('Tiempo de cierre', avgClose !== null ? avgClose + ' s' : '–', 'Del inicio del pago a la confirmación')}
        ${tile('NPS de confianza', npsScore !== null ? npsScore : '–', `${nps.length} respuestas post compra`)}
      </div>
      <div class="calc"><h3>Embudo</h3><table class="spec">
        ${[['Visitas', v], ['Fichas de producto vistas', k.view_product || 0], ['Usos del calculador', k.calc_used || 0], ['Agregados al carrito', ac], ['Checkouts iniciados', cs], ['Compras', pur], ['Conversaciones con Max', k.chat_msg || 0], ['Avisos de llegada (demanda no satisfecha)', k.notify || 0]].map(r => `<tr><td>${r[0]}</td><td><b>${r[1]}</b></td></tr>`).join('')}
      </table></div>
    </section></div>`;
  }

  // ---------- Asistente virtual Max ----------
  const chat = { history: [], busy: false, opened: false };
  function addMsg(role, text) {
    const d = document.createElement('div');
    d.className = 'msg ' + role;
    if (role === 'bot') d.innerHTML = esc(text).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/^\s*[-*] /gm, '• ');
    else d.textContent = text;
    $('#msgs').appendChild(d); $('#msgs').scrollTop = 1e9; return d;
  }
  function openChat(prefill) {
    $('#chat').classList.add('show'); $('#chatFab').style.display = 'none';
    if (!chat.opened) { chat.opened = true; track('chat_open'); addMsg('bot', '¡Hola! Soy Max, el asesor virtual de Matex 👋\nCuéntame qué quieres renovar (fachada, muro, piso o baño) y cuántos m² son. Te digo qué producto te conviene, cuánto necesitas y si está disponible para retiro hoy.'); }
    updateChips();
    if (prefill) sendChat(prefill); else setTimeout(() => $('#chatIn').focus(), 50);
  }
  function updateChips() {
    const p = state.current ? byId(state.current) : null;
    const chips = p
      ? [`¿Cuánto ${p.name} necesito para 20 m²?`, `¿${p.name} sirve para exterior?`, '¿Cómo es el despacho a Osorno?', '¿Es seguro pagar aquí?']
      : ['Soy maestro, ¿qué beneficios tengo?', 'Quiero revestir mi fachada', '¿Por qué Matex y no una gran tienda?', '¿Es seguro pagar aquí?'];
    $('#chips').innerHTML = chips.map(c => `<button type="button" data-chip>${esc(c)}</button>`).join('');
  }
  async function sendChat(text) {
    text = (text || '').trim(); if (!text || chat.busy) return;
    chat.busy = true; track('chat_msg');
    addMsg('user', text);
    chat.history.push({ role: 'user', content: text });
    const typing = addMsg('bot', ''); typing.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
    const p = state.current ? byId(state.current) : null;
    const ctx = p ? { pagina: 'ficha de producto', producto: p.name, color: p.colors[state.color].n, precio: priceOf(p), unidad: p.unit, stock_color: p.colors[state.color].s } : { pagina: location.hash.startsWith('#/kpis') ? 'panel kpis' : 'inicio' };
    ctx.carrito = state.cart.map(l => `${l.qty} x ${byId(l.id).name}`).join(', ') || 'vacío';
    try {
      const r = await fetch('api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: chat.history.slice(-12), context: ctx }) });
      const data = await r.json().catch(() => ({}));
      typing.remove();
      if (!r.ok || !data.reply) throw new Error(data.error || ('HTTP ' + r.status));
      chat.history.push({ role: 'assistant', content: data.reply });
      addMsg('bot', data.reply);
    } catch (err) {
      typing.remove();
      chat.history.pop();
      const local = location.protocol === 'file:' || /github\.io$/.test(location.hostname);
      addMsg('err', local
        ? 'Max necesita el servidor del prototipo para responder (Vercel o "node server.js"). Desde GitHub Pages o abriendo el archivo directo no puede usar la API de forma segura.'
        : 'Max no pudo responder ahora (' + err.message + '). Intenta de nuevo en unos segundos o escríbenos por WhatsApp.');
    } finally { chat.busy = false; }
  }

  // ---------- Eventos globales ----------
  document.addEventListener('click', e => {
    const t = e.target.closest('button, a'); if (!t) return;
    if (t.hasAttribute('data-close')) { closeAll(); }
    if (t.matches('[data-quiz]')) { openQuiz(t.getAttribute('data-quiz') || null); return; }
    if (t.matches('[data-chat]')) { openChat(t.getAttribute('data-chat') || ''); return; }
    if (t.matches('[data-chip]')) { sendChat(t.textContent); return; }
    if (t.matches('[data-qs]')) { qz.space = t.dataset.qs; drawQuiz(); return; }
    if (t.matches('[data-qy]')) { qz.style = t.dataset.qy; drawQuiz(); return; }
    if (t.matches('[data-rm]')) { state.cart.splice(+t.dataset.rm, 1); saveCart(); renderCart(); return; }
    if (t.matches('[data-nps]')) { track('nps', +t.dataset.nps); t.parentElement.innerHTML = '<p>¡Gracias! Tu respuesta nos ayuda a mejorar.</p>'; return; }
    if (t.id === 'goCheckout') { openCheckout(false); return; }
    if (t.id === 'kpiReset') { try { localStorage.removeItem(KPI_KEY); } catch (er) {} renderKPIs(); return; }
    const p = state.current ? byId(state.current) : null;
    if (!p) return;
    if (t.matches('[data-color]')) { state.color = +t.dataset.color; renderPDP(p); return; }
    if (t.matches('[data-thumb]')) { state.thumb = +t.dataset.thumb; renderPDP(p); return; }
    if (t.matches('[data-tab]')) { e.preventDefault(); state.tab = t.dataset.tab; renderPDP(p); if (t.tagName === 'A') $('.tabs').scrollIntoView({ behavior: 'smooth' }); return; }
    if (t.matches('[data-mode]')) { state.mode = t.dataset.mode; renderPDP(p); return; }
    if (t.matches('[data-q]')) { state.qty = Math.max(1, (parseInt($('#qty').value) || 1) + (+t.dataset.q)); $('#qty').value = state.qty; return; }
    if (t.id === 'addCart') { addToCart(p.id, state.color, Math.max(1, parseInt($('#qty').value) || 1)); return; }
    if (t.id === 'buyNow' || t.id === 'ocBtn') {
      const { units } = calcUnits(p);
      addToCart(p.id, state.color, units || Math.max(1, parseInt(($('#qty') || {}).value) || 1), true);
      openCheckout(true); return;
    }
    if (t.id === 'addProject') {
      const { m2, units } = calcUnits(p);
      addToCart(p.id, state.color, units, true);
      accFor(p, units, m2).forEach(([id, q]) => { if (state.accSel[id]) addToCart(id, accColor(id, p.colors[state.color].n), q, true); });
      openCart(); toast('Proyecto agregado al carrito'); return;
    }
    if (t.id === 'notifyMe') { track('notify'); t.outerHTML = '<span class="pill ok">✔ Te avisaremos por correo y WhatsApp cuando llegue</span>'; return; }
  });
  document.addEventListener('input', e => {
    const p = state.current ? byId(state.current) : null; if (!p) return;
    if (e.target.id === 'm2') { state.m2 = e.target.value; updateCalc(p); }
    if (e.target.id === 'L') { state.L = e.target.value; updateCalc(p); }
    if (e.target.id === 'H') { state.H = e.target.value; updateCalc(p); }
  });
  document.addEventListener('change', e => {
    if (e.target.matches('[data-acc]')) { state.accSel[e.target.dataset.acc] = e.target.checked; updateCalc(byId(state.current)); }
    if (e.target.id === 'comuna') {
      const m = { pm: 'Despacho en <b>24 horas</b>. Gratis sobre $250.000, si no $9.990. O retiro hoy en tienda.', pv: 'Despacho en <b>24 a 48 horas</b>, desde $14.990.', os: 'Despacho en <b>48 a 72 horas</b>, desde $19.990.', ch: 'Despacho en <b>2 a 4 días hábiles</b>, cotización según volumen.', rc: 'Envío por transporte de carga en <b>3 a 6 días hábiles</b>. Max te cotiza al instante.' };
      $('#shipOut').innerHTML = m[e.target.value] || 'Retiro en tienda: <b>hoy</b>, Av. Presidente Ibáñez 216.';
    }
  });
  $('#openCart').addEventListener('click', openCart);
  $('#openQuiz').addEventListener('click', () => openQuiz());
  $('#scrim').addEventListener('click', closeAll);
  ['#checkout', '#quiz'].forEach(s => $(s).addEventListener('click', e => { if (e.target === e.currentTarget) closeAll(); }));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeAll(); $('#chat').classList.remove('show'); $('#chatFab').style.display = ''; } });
  $('#chatFab').addEventListener('click', () => openChat());
  $('#chatClose').addEventListener('click', () => { $('#chat').classList.remove('show'); $('#chatFab').style.display = ''; });
  $('#chatForm').addEventListener('submit', e => { e.preventDefault(); const v = $('#chatIn').value; $('#chatIn').value = ''; sendChat(v); });
  $('#searchForm').addEventListener('submit', e => { e.preventDefault(); const v = $('#q').value.trim(); if (v) { $('#q').value = ''; openChat(v); } });

  renderCart();
  route();
})();
