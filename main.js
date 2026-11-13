(() => {
  const WA = '18684895269';
  const U = (id, w = 900) => `https://images.unsplash.com/${id}?w=${w}&q=70&auto=format&fit=crop`;
  const PRODUCTS = [
    { id: 'greens', cat: 'blend', name: 'Daily Greens', sub: 'Blend, 30 servings', price: 180, img: 'photo-1610622929850-77f505c3ce5a', alt: 'Green smoothies in glasses' },
    { id: 'protein', cat: 'blend', name: 'Plant Protein', sub: 'Vanilla, 1 kg tub', price: 260, img: 'photo-1774793476321-70f77d85a3a7', alt: 'A scoop of protein powder on a wooden surface' },
    { id: 'bowl', cat: 'blend', name: 'Morning Bowl Mix', sub: 'Oats, seeds and fruit, 500 g', price: 95, img: 'photo-1627308594190-a057cd4bfac8', alt: 'Two smoothie bowls topped with banana, berries and granola' },
    { id: 'tea', cat: 'tea', name: 'Wind-Down Tea', sub: 'Herbal, 20 bags', price: 65, img: 'photo-1558160074-4d7d8bdf4256', alt: 'Glass cup of tea beside a clay teapot' },
    { id: 'plan', cat: 'plan', name: '4-Week Meal Plan', sub: 'Recipes and shopping lists', price: 350, img: 'photo-1543352632-5a4b24e4d2a6', alt: 'Three meal prep containers with rice, corn and vegetables' },
    { id: 'consult', cat: 'plan', name: 'Nutrition Consult', sub: '60 minutes, in person or video', price: 300, img: 'photo-1631539338594-9c5f759baf0b', alt: 'Woman sipping a drink while reading' },
  ];
  const RITUALS = [
    { img: 'photo-1610622930110-3c076902312a', alt: 'Green smoothie being poured into a glass', title: 'Start with something green.', text: 'One scoop of Daily Greens in water or juice, and a bowl that keeps you full until lunch.', pair: ['greens', 'bowl'] },
    { img: 'photo-1767277672167-18105701959b', alt: 'A table of healthy bowls and plates', title: 'Keep lunch simple.', text: 'A protein shake between meetings, or a meal plan that does the thinking for you.', pair: ['protein', 'plan'] },
    { img: 'photo-1567922045116-2a00fae2ed03', alt: 'A small bowl of herbal tea among green leaves', title: 'Slow the evening down.', text: 'A caffeine-free herbal cup after dinner. Book a consult when you want a plan made for you.', pair: ['tea', 'consult'] },
  ];
  const byId = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));
  const money = n => 'TT$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const cart = {};
  try { Object.assign(cart, JSON.parse(localStorage.getItem('wk-cart') || '{}')); } catch (e) {}
  const save = () => { try { localStorage.setItem('wk-cart', JSON.stringify(cart)); } catch (e) {} };

  /* Theme */
  const root = document.documentElement, tbtn = document.querySelector('.theme-toggle');
  const syncTheme = () => {
    const dark = root.dataset.theme === 'dark';
    tbtn.innerHTML = `<i class="ph ph-${dark ? 'sun' : 'moon'}"></i>`;
    tbtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    document.querySelector('meta[name=theme-color]').content = dark ? '#121510' : '#F1F2EC';
  };
  tbtn.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('wk-theme', root.dataset.theme); } catch (e) {}
    syncTheme();
  });
  syncTheme();

  /* Nav border on scroll */
  const nav = document.querySelector('.nav');
  new IntersectionObserver(([e]) => nav.classList.toggle('is-scrolled', !e.isIntersecting)).observe(document.querySelector('.sentinel'));

  /* Add / stepper control */
  const control = id => {
    const q = cart[id] || 0;
    return q ? `<div class="stepper" data-id="${id}"><button type="button" data-dec aria-label="Remove one ${byId[id].name}"><i class="ph ph-minus"></i></button><span>${q}</span><button type="button" data-inc aria-label="Add one ${byId[id].name}"><i class="ph ph-plus"></i></button></div>`
             : `<button type="button" class="add" data-add="${id}"><i class="ph ph-plus"></i> Add</button>`;
  };

  /* Products */
  const grid = document.querySelector('[data-products]');
  grid.innerHTML = PRODUCTS.map(p => `
    <article class="product" data-cat="${p.cat}">
      <div class="p-img"><img src="${U(p.img)}" alt="${p.alt}" width="900" height="720" loading="lazy"></div>
      <div class="p-body"><div><h3>${p.name}</h3><p class="p-sub">${p.sub}</p></div><span class="p-price">${money(p.price).replace('.00', '')}</span></div>
      <div class="p-actions" data-ctl="${p.id}">${control(p.id)}</div>
    </article>`).join('');

  document.querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(x => { x.classList.toggle('is-on', x === c); x.setAttribute('aria-selected', x === c); });
    const f = c.dataset.filter;
    grid.querySelectorAll('.product').forEach(p => p.hidden = !(f === 'all' || p.dataset.cat === f));
    grid.scrollTo({ left: 0, behavior: 'smooth' });
  }));

  /* Ritual tabs */
  const rImg = document.querySelector('[data-ritual-img]'), rBody = document.querySelector('[data-ritual-body]');
  let rIdx = 0;
  const renderRitual = () => {
    const r = RITUALS[rIdx];
    rBody.innerHTML = `<h3 style="font-size:24px">${r.title}</h3><p style="margin-top:10px">${r.text}</p>
      <div class="pair">${r.pair.map(id => { const p = byId[id]; return `<div class="pair-item"><img src="${U(p.img, 160)}" alt="" width="52" height="52"><div><strong>${p.name}</strong><span>${money(p.price).replace('.00', '')}</span></div><div data-ctl="${id}" style="flex:none">${control(id)}</div></div>`; }).join('')}</div>`;
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
    cart[id] = (cart[id] || 0) + (dec ? -1 : 1);
    if (cart[id] <= 0) delete cart[id];
    update(id);
  });

  /* Invoice */
  const form = document.getElementById('order-form');
  const invNo = (() => {
    let n; try { n = localStorage.getItem('wk-inv'); } catch (e) {}
    if (!n) { n = 'WK-' + String(Date.now()).slice(-6, -2); try { localStorage.setItem('wk-inv', n); } catch (e) {} }
    return n;
  })();
  document.querySelector('[data-inv-no]').textContent = invNo;
  document.querySelector('[data-inv-date]').textContent = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const totals = () => {
    const items = Object.entries(cart).map(([id, q]) => ({ ...byId[id], q }));
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
      `Hi Wellkind, I'd like to place an order.`, ``,
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
  });
  form.querySelectorAll('input').forEach(i => i.addEventListener('input', () => i.closest('.field').classList.remove('has-err')));

  document.querySelector('[data-print]').addEventListener('click', () => { renderInvoice(); window.print(); });

  Object.keys(cart).forEach(id => { if (!byId[id]) delete cart[id]; });
  PRODUCTS.forEach(p => document.querySelectorAll(`[data-ctl="${p.id}"]`).forEach(el => el.innerHTML = control(p.id)));
  update();
})();
