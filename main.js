(() => {
  const WA = '18684895269';
  const U = (id, w = 900) => `https://images.unsplash.com/${id}?w=${w}&q=70&auto=format&fit=crop`;
  let ALL = KH.products(), PRODUCTS = ALL.filter(p => !p.hidden);
  const RITUALS = [
    { img: 'photo-1610622930110-3c076902312a', alt: 'Green smoothie being poured into a glass', title: 'Start with something green.', text: 'One scoop of Daily Greens in water or juice, and a bowl that keeps you full until lunch.', pair: ['greens', 'bowl'] },
    { img: 'photo-1767277672167-18105701959b', alt: 'A table of healthy bowls and plates', title: 'Keep lunch simple.', text: 'A protein shake between meetings, or a meal plan that does the thinking for you.', pair: ['protein', 'plan'] },
    { img: 'photo-1567922045116-2a00fae2ed03', alt: 'A small bowl of herbal tea among green leaves', title: 'Slow the evening down.', text: 'A caffeine-free herbal cup after dinner. Book a consult when you want a plan made for you.', pair: ['tea', 'consult'] },
  ];
  let byId = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));
  const money = KH.money;
  const U2 = (p, w) => KH.img(p, w);
  const cart = {};
  try { Object.assign(cart, JSON.parse(localStorage.getItem('kh-cart') || '{}')); } catch (e) {}
  const save = () => { try { localStorage.setItem('kh-cart', JSON.stringify(cart)); } catch (e) {} };

  /* Theme */
  const root = document.documentElement, tbtn = document.querySelector('.theme-toggle');
  const syncTheme = () => {
    const dark = root.dataset.theme === 'dark';
    tbtn.innerHTML = `<i class="ph ph-${dark ? 'sun' : 'moon'}"></i>`;
    tbtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    document.querySelector('meta[name=theme-color]').content = dark ? '#14160F' : '#F6F3EA';
  };
  tbtn.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('kh-theme', root.dataset.theme); } catch (e) {}
    syncTheme();
  });
  syncTheme();

  /* Nav border on scroll */
  const nav = document.querySelector('.nav');
  new IntersectionObserver(([e]) => nav.classList.toggle('is-scrolled', !e.isIntersecting)).observe(document.querySelector('.sentinel'));

  /* Add / stepper control */
  const control = id => {
    const p = byId[id]; if (!p) return '';
    const q = cart[id] || 0;
    if (p.stock <= 0 && !q) return `<button type="button" class="add is-out" disabled>Sold out</button>`;
    return q ? `<div class="stepper" data-id="${id}"><button type="button" data-dec aria-label="Remove one ${KH.esc(p.name)}"><i class="ph ph-minus"></i></button><span>${q}</span><button type="button" data-inc aria-label="Add one ${KH.esc(p.name)}" ${q >= p.stock ? 'disabled' : ''}><i class="ph ph-plus"></i></button></div>`
             : `<button type="button" class="add" data-add="${id}"><i class="ph ph-plus"></i> Add</button>`;
  };

  /* Products */
  const grid = document.querySelector('[data-products]');
  let filter = 'all';
  const renderProducts = () => {
    grid.innerHTML = PRODUCTS.map(p => `
    <article class="product${p.stock <= 0 ? ' is-out' : ''}" data-aud="${KH.esc(p.aud || '')}" ${filter === 'all' || (p.aud || '').split(' ').includes(filter) ? '' : 'hidden'}>
      <div class="p-img"><img src="${U2(p)}" alt="${KH.esc(p.alt || p.name)}" width="900" height="720" loading="lazy"></div>
      <div class="p-body"><div><h3>${KH.esc(p.name)}</h3><p class="p-sub">${KH.esc(p.sub || '')}${p.stock > 0 && p.stock <= 5 ? ` <span class="p-low">Only ${p.stock} left</span>` : ''}</p></div><span class="p-price">${money(p.price).replace('.00', '')}</span></div>
      <div class="p-actions" data-ctl="${p.id}">${control(p.id)}</div>
    </article>`).join('');
  };
  renderProducts();

  document.querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(x => { x.classList.toggle('is-on', x === c); x.setAttribute('aria-selected', x === c); });
    const f = filter = c.dataset.filter;
    grid.querySelectorAll('.product').forEach(p => { const show = f === 'all' || p.dataset.aud.split(' ').includes(f); p.hidden = !show; if (show) { p.style.animation = 'none'; p.offsetWidth; p.style.animation = ''; } });
    grid.scrollTo({ left: 0, behavior: 'smooth' });
  }));

  /* Ritual tabs */
  const rImg = document.querySelector('[data-ritual-img]'), rBody = document.querySelector('[data-ritual-body]');
  let rIdx = 0;
  const renderRitual = () => {
    const r = RITUALS[rIdx];
    rBody.innerHTML = `<h3 style="font-size:24px">${r.title}</h3><p style="margin-top:10px">${r.text}</p>
      <div class="pair">${r.pair.filter(id => byId[id]).map(id => { const p = byId[id]; return `<div class="pair-item"><img src="${U2(p, 160)}" alt="" width="52" height="52"><div><strong>${p.name}</strong><span>${money(p.price).replace('.00', '')}</span></div><div data-ctl="${id}" style="flex:none">${control(id)}</div></div>`; }).join('')}</div>`;
  };
  const setRitual = i => {
    if (i === rIdx) return;
    rIdx = i;
    document.querySelectorAll('.seg-btn').forEach((b, j) => { b.classList.toggle('is-on', j === i); b.setAttribute('aria-selected', j === i); });
    rImg.classList.add('is-fading');
    const next = new Image(); next.src = U(RITUALS[i].img, 1100);
    const swap = () => { rImg.src = next.src; rImg.alt = RITUALS[i].alt; rImg.classList.remove('is-fading'); };
    next.decode ? next.decode().then(swap, swap) : (next.onload = swap);
    renderRitual();
  };
  document.querySelectorAll('.seg-btn').forEach((b, i) => b.addEventListener('click', () => setRitual(i)));
  renderRitual();

  /* Cart events (delegated) */
  document.addEventListener('click', e => {
    const add = e.target.closest('[data-add]'), inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]');
    if (!add && !inc && !dec) return;
    const id = add ? add.dataset.add : e.target.closest('[data-id]').dataset.id;
    if (!byId[id]) return;
    cart[id] = Math.min((cart[id] || 0) + (dec ? -1 : 1), byId[id].stock);
    if (cart[id] <= 0) delete cart[id];
    update(id);
  });

  /* Invoice */
  const form = document.getElementById('order-form');
  let invNo = KH.nextInvoice();
  document.querySelector('[data-inv-no]').textContent = invNo;
  document.querySelector('[data-inv-date]').textContent = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const totals = () => {
    const items = Object.entries(cart).filter(([id]) => byId[id]).map(([id, q]) => ({ ...byId[id], q }));
    const sub = items.reduce((s, i) => s + i.price * i.q, 0);
    const pickup = form.ship.value === 'pickup';
    const ship = items.length && !pickup ? 40 : 0;
    return { items, sub, ship, total: sub + ship, pickup, count: items.reduce((s, i) => s + i.q, 0) };
  };

  const renderInvoice = () => {
    const t = totals();
    const lines = document.querySelector('[data-inv-lines]');
    lines.innerHTML = t.items.length ? t.items.map(i => `
      <div class="inv-line"><span>${i.name}<small>${i.sub}</small></span><span class="inv-qty">${i.q} x ${money(i.price)}</span><strong>${money(i.price * i.q)}</strong></div>`).join('')
      : `<p class="inv-empty"><i class="ph ph-bag-simple"></i><span>Nothing here yet. <a href="#shop">Add something from the range.</a></span></p>`;
    document.querySelector('[data-inv-sub]').textContent = money(t.sub);
    document.querySelector('[data-inv-ship-label]').textContent = t.pickup ? 'Pickup' : 'Delivery';
    document.querySelector('[data-inv-ship]').textContent = t.pickup ? 'Free' : money(t.ship);
    document.querySelector('[data-inv-total]').textContent = money(t.total);
    const name = form.name.value.trim() || 'Your name';
    document.querySelector('[data-inv-bill]').innerHTML = `${esc(name)}${form.phone.value.trim() ? '<br>' + esc(form.phone.value.trim()) : ''}<br>${esc(form.area.value)}`;
    document.querySelector('[data-inv-pay]').textContent = form.pay.value === 'Bank transfer'
      ? 'Payment by bank transfer. Account details are sent with your confirmation.'
      : `Payment in cash on ${t.pickup ? 'pickup' : 'delivery'}.`;
    return t;
  };
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const countEl = document.querySelector('[data-count]');
  const bar = document.querySelector('.orderbar');
  const update = changed => {
    save();
    if (changed) document.querySelectorAll(`[data-ctl="${changed}"]`).forEach(el => el.innerHTML = control(changed));
    const t = renderInvoice();
    countEl.textContent = t.count;
    countEl.classList.add('bump'); setTimeout(() => countEl.classList.remove('bump'), 260);
    bar.hidden = !t.count;
    bar.querySelector('[data-bar-count]').textContent = `${t.count} item${t.count === 1 ? '' : 's'}`;
    bar.querySelector('[data-bar-total]').textContent = money(t.total);
    if (t.count) document.querySelector('[data-err="cart"]').classList.remove('show');
  };
  form.addEventListener('input', renderInvoice);
  form.addEventListener('change', () => { renderInvoice(); update(); });

  /* Hide order bar over the hero CTAs, the order section and the footer */
  const hidden = new Set();
  const io = new IntersectionObserver(es => {
    es.forEach(e => e.isIntersecting ? hidden.add(e.target) : hidden.delete(e.target));
    bar.classList.toggle('is-hidden', hidden.size > 0);
  });
  ['.hero-ctas', '#order', '.footer'].forEach(s => io.observe(document.querySelector(s)));

  /* Submit: validate then open WhatsApp with the invoice */
  form.addEventListener('submit', e => {
    e.preventDefault();
    const t = renderInvoice();
    let ok = true;
    [['name', v => v.length > 1], ['phone', v => v.replace(/\D/g, '').length >= 7]].forEach(([n, test]) => {
      const f = form[n].closest('.field'), good = test(form[n].value.trim());
      f.classList.toggle('has-err', !good); if (!good) ok = false;
    });
    const cartErr = document.querySelector('[data-err="cart"]');
    cartErr.classList.toggle('show', !t.items.length);
    if (!t.items.length) ok = false;
    if (!ok) { (form.querySelector('.has-err input') || cartErr).scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    const msg = [
      `Hi Kairos Health, I'd like to place an order.`, ``,
      `Invoice ${invNo}`,
      ...t.items.map(i => `- ${i.q} x ${i.name} (${money(i.price * i.q)})`),
      `Subtotal: ${money(t.sub)}`,
      `${t.pickup ? 'Pickup: Free' : 'Delivery: ' + money(t.ship)}`,
      `Total: ${money(t.total)}`, ``,
      `Name: ${form.name.value.trim()}`,
      `Number: ${form.phone.value.trim()}`,
      `Area: ${form.area.value}`,
      `Payment: ${form.pay.value}`,
      form.notes.value.trim() ? `Notes: ${form.notes.value.trim()}` : ''
    ].filter((l, i, a) => l !== '' || a[i - 1] !== '').join('\n');
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    /* Demo: the order also lands in Kym's admin, and stock goes down */
    const orders = KH.orders();
    orders.unshift({ no: invNo, name: form.name.value.trim(), area: form.area.value, ship: t.pickup ? 'pickup' : 'delivery', pay: form.pay.value, items: t.items.map(i => [i.id, i.q]), total: t.total, status: 'new', at: new Date().toISOString() });
    KH.saveOrders(orders);
    const all = KH.products(); t.items.forEach(i => { const p = all.find(x => x.id === i.id); if (p) p.stock = Math.max(0, p.stock - i.q); }); KH.saveProducts(all);
    KH.bumpInvoice(); invNo = KH.nextInvoice(); document.querySelector('[data-inv-no]').textContent = invNo;
    Object.keys(cart).forEach(k => delete cart[k]); reload(); update();
  });
  form.querySelectorAll('input').forEach(i => i.addEventListener('input', () => i.closest('.field').classList.remove('has-err')));

  document.querySelector('[data-print]').addEventListener('click', () => { renderInvoice(); window.print(); });

  /* Reload products when the admin (another tab) changes them */
  const reload = () => {
    ALL = KH.products(); PRODUCTS = ALL.filter(p => !p.hidden); byId = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));
    Object.keys(cart).forEach(id => { if (!byId[id]) delete cart[id]; else cart[id] = Math.min(cart[id], byId[id].stock); if (cart[id] <= 0) delete cart[id]; });
    renderProducts(); renderRitual();
  };
  addEventListener('storage', e => { if (e.key === 'kh-products' || e.key === null) { reload(); update(); } if (e.key === 'kh-inv-seq') { invNo = KH.nextInvoice(); document.querySelector('[data-inv-no]').textContent = invNo; } });
  reload();
  update();
})();
