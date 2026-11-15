(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const LOW = 5;
  let products = KH.products(), orders = KH.orders();
  let tab = 'products', ofilter = 'all', query = '', lowOnly = false, editing = null, photo = null;

  /* Theme */
  const root = document.documentElement, tbtn = $('.theme-toggle');
  const syncTheme = () => { const d = root.dataset.theme === 'dark'; tbtn.innerHTML = `<i class="ph ph-${d ? 'sun' : 'moon'}"></i>`; tbtn.setAttribute('aria-label', d ? 'Switch to light mode' : 'Switch to dark mode'); };
  tbtn.addEventListener('click', () => { root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark'; try { localStorage.setItem('kh-theme', root.dataset.theme); } catch (e) {} syncTheme(); });
  syncTheme();

  /* Sign in (demo) */
  const signin = $('[data-signin]'), app = $('[data-app]');
  const enter = () => { signin.hidden = true; app.hidden = false; try { sessionStorage.setItem('kh-admin', '1'); } catch (e) {} render(); };
  $('[data-enter]').addEventListener('click', enter);
  $('[data-signout]').addEventListener('click', () => { try { sessionStorage.removeItem('kh-admin'); } catch (e) {} app.hidden = true; signin.hidden = false; scrollTo(0, 0); });
  let signed = false; try { signed = sessionStorage.getItem('kh-admin') === '1'; } catch (e) {}

  const h = new Date().getHours();
  $('[data-greet]').textContent = `${h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'}, Kym.`;

  /* Toast */
  let tt;
  const toast = (msg, link) => {
    const t = $('[data-toast]');
    t.innerHTML = `<span>${KH.esc(msg)}</span>` + (link ? ` <a href="../#shop" target="_blank" rel="noopener">View on shop</a>` : '');
    t.hidden = false; t.style.animation = 'none'; t.offsetWidth; t.style.animation = '';
    clearTimeout(tt); tt = setTimeout(() => t.hidden = true, 3200);
  };

  /* Persist */
  const saveP = () => { if (!KH.saveProducts(products)) toast('Could not save. The photo may be too large.'); };
  const saveO = () => KH.saveOrders(orders);

  /* Tabs */
  const setTab = t => {
    tab = t;
    $$('[data-tab]').forEach(b => b.classList.toggle('is-on', b.dataset.tab === t));
    $$('[data-panel]').forEach(p => p.hidden = p.dataset.panel !== t);
  };
  $$('[data-tab]').forEach(b => b.addEventListener('click', () => { lowOnly = false; setTab(b.dataset.tab); render(); }));
  $$('[data-goto]').forEach(b => b.addEventListener('click', () => {
    setTab(b.dataset.goto);
    if (b.dataset.filter) { ofilter = b.dataset.filter; $$('[data-of]').forEach(x => x.classList.toggle('is-on', x.dataset.of === ofilter)); }
    lowOnly = b.hasAttribute('data-low');
    render();
    $(`[data-panel="${b.dataset.goto}"]`).scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));

  /* Stats */
  const renderStats = () => {
    const nNew = orders.filter(o => o.status === 'new').length;
    $('[data-stat-new]').textContent = nNew;
    $('[data-stat-deliver]').textContent = orders.filter(o => o.status === 'paid').length;
    $('[data-stat-low]').textContent = products.filter(p => p.stock <= LOW).length;
    $('[data-new-count]').textContent = nNew || '';
    $('[data-new-dot]').hidden = !nNew;
  };

  /* Products */
  const audLabel = { pro: 'Professionals', fit: 'Fitness', every: 'Everyday' };
  const renderProducts = () => {
    const q = query.toLowerCase();
    const list = products.filter(p => (!q || (p.name + ' ' + (p.sub || '')).toLowerCase().includes(q)) && (!lowOnly || p.stock <= LOW));
    $('[data-plist]').innerHTML = list.length ? list.map(p => {
      const badges = [
        p.stock <= 0 ? '<span class="badge out"><i class="ph ph-x-circle"></i>Sold out</span>' : p.stock <= LOW ? '<span class="badge low"><i class="ph ph-warning"></i>Low stock</span>' : '',
        p.hidden ? '<span class="badge off"><i class="ph ph-eye-slash"></i>Hidden</span>' : '',
        ...(p.aud || '').split(' ').filter(Boolean).map(a => `<span class="badge aud">${audLabel[a] || a}</span>`)
      ].join('');
      return `<article class="prow${p.hidden ? ' is-hidden' : ''}" data-id="${p.id}">
        <img class="prow-img" src="${KH.img(p, 200)}" alt="" width="72" height="72" loading="lazy">
        <div class="prow-main"><span class="prow-name">${KH.esc(p.name)}</span><span class="prow-sub">${KH.esc(p.sub || '')}</span><span class="prow-mprice">${KH.money(p.price).replace('.00', '')}</span><div class="prow-tags">${badges}</div></div>
        <span class="prow-price">${KH.money(p.price).replace('.00', '')}</span>
        <div class="stock" aria-label="Stock for ${KH.esc(p.name)}">
          <button type="button" data-step="-1" aria-label="One less" ${p.stock <= 0 ? 'disabled' : ''}><i class="ph ph-minus"></i></button>
          <output>${p.stock}<small>in stock</small></output>
          <button type="button" data-step="1" aria-label="One more"><i class="ph ph-plus"></i></button>
        </div>
        <div class="prow-actions">
          <button type="button" class="vis${p.hidden ? ' off' : ''}" data-vis aria-label="${p.hidden ? 'Show on website' : 'Hide from website'}" title="${p.hidden ? 'Hidden from website' : 'Showing on website'}"><i class="ph ph-${p.hidden ? 'eye-slash' : 'eye'}"></i></button>
          <button type="button" class="vis" data-edit aria-label="Edit ${KH.esc(p.name)}"><i class="ph ph-pencil-simple"></i></button>
        </div>
      </article>`;
    }).join('') : `<p class="empty">${lowOnly ? 'Everything is well stocked.' : 'No products match that search.'}</p>`;
  };
  $('[data-search]').addEventListener('input', e => { query = e.target.value; lowOnly = false; renderProducts(); });
  $('[data-plist]').addEventListener('click', e => {
    const row = e.target.closest('.prow'); if (!row) return;
    const p = products.find(x => x.id === row.dataset.id);
    const step = e.target.closest('[data-step]');
    if (step) { p.stock = Math.max(0, p.stock + Number(step.dataset.step)); saveP(); render(); return; }
    if (e.target.closest('[data-vis]') && !e.target.closest('[data-edit]')) { p.hidden = !p.hidden; saveP(); render(); toast(p.hidden ? `${p.name} is hidden from your shop.` : `${p.name} is back on your shop.`, !p.hidden); return; }
    if (e.target.closest('[data-edit]')) openSheet(p);
  });

  /* Orders */
  const renderOrders = () => {
    const list = orders.filter(o => ofilter === 'all' || o.status === ofilter);
    const label = { new: 'New', paid: 'Paid, to deliver', delivered: 'Delivered' };
    const byId = Object.fromEntries(products.map(p => [p.id, p]));
    $('[data-olist]').innerHTML = list.length ? list.map(o => {
      const d = new Date(o.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      return `<article class="order-card" data-no="${o.no}">
        <button type="button" class="order-sum" aria-expanded="false">
          <span class="o-no">${o.no}</span>
          <span class="o-who"><strong>${KH.esc(o.name)}</strong><span>${KH.esc(o.area)}, ${d}</span></span>
          <span class="o-total">${KH.money(o.total)}</span>
          <span class="status ${o.status}">${label[o.status]}</span>
        </button>
        <div class="order-detail">
          <div class="o-items">${o.items.map(([id, q]) => `<div><span>${q} x ${KH.esc(byId[id] ? byId[id].name : 'Removed product')}</span><span>${byId[id] ? KH.money(byId[id].price * q) : ''}</span></div>`).join('')}</div>
          <p class="o-meta">${o.ship === 'pickup' ? 'Pickup' : 'Delivery'} &middot; ${KH.esc(o.pay)}</p>
          <div class="o-actions">
            ${o.status === 'new' ? `<button type="button" class="btn btn-primary btn-sm" data-set="paid"><i class="ph ph-check"></i> Mark paid</button>` : ''}
            ${o.status !== 'delivered' ? `<button type="button" class="btn btn-ghost btn-sm" data-set="delivered"><i class="ph ph-truck"></i> Mark delivered</button>` : `<button type="button" class="btn btn-ghost btn-sm" data-set="paid"><i class="ph ph-arrow-counter-clockwise"></i> Undo delivered</button>`}
          </div>
        </div>
      </article>`;
    }).join('') : `<p class="empty">No ${ofilter === 'all' ? '' : label[ofilter].toLowerCase() + ' '}orders right now.</p>`;
  };
  $$('[data-of]').forEach(b => b.addEventListener('click', () => { ofilter = b.dataset.of; $$('[data-of]').forEach(x => x.classList.toggle('is-on', x === b)); renderOrders(); }));
  $('[data-olist]').addEventListener('click', e => {
    const card = e.target.closest('.order-card'); if (!card) return;
    const set = e.target.closest('[data-set]');
    if (set) {
      const o = orders.find(x => x.no === card.dataset.no); o.status = set.dataset.set; saveO(); render();
      const again = $(`.order-card[data-no="${o.no}"]`); if (again) { again.classList.add('is-open'); }
      toast(`${o.no} marked ${o.status === 'paid' ? 'paid' : 'delivered'}.`);
      return;
    }
    if (e.target.closest('.order-sum')) { card.classList.toggle('is-open'); card.querySelector('.order-sum').setAttribute('aria-expanded', card.classList.contains('is-open')); }
  });

  const render = () => { renderStats(); renderProducts(); renderOrders(); };

  /* Product sheet */
  const sheet = $('[data-sheet]'), pf = $('[data-pform]');
  const pv = () => {
    $('[data-pv-name]').textContent = pf.name.value.trim() || 'Product name';
    $('[data-pv-sub]').textContent = pf.sub.value.trim() || 'Short description';
    $('[data-pv-price]').textContent = KH.money(Number(pf.price.value) || 0).replace('.00', '');
  };
  const showPhoto = src => {
    const img = $('[data-photo-img]');
    img.hidden = !src; if (src) img.src = src;
    $('[data-photo-empty]').hidden = !!src; $('[data-photo-change]').hidden = !src;
  };
  const openSheet = p => {
    editing = p || null; photo = p ? p.img : null;
    pf.reset();
    $$('.field', pf).forEach(f => f.classList.remove('has-err'));
    $('[data-sheet-title]').textContent = p ? 'Edit product' : 'New product';
    $('[data-delete]').hidden = !p;
    if (p) {
      pf.name.value = p.name; pf.sub.value = p.sub || ''; pf.price.value = p.price; pf.stock.value = p.stock;
      $$('input[name=aud]', pf).forEach(c => c.checked = (p.aud || '').split(' ').includes(c.value));
      pf.visible.checked = !p.hidden;
    }
    showPhoto(p ? KH.img(p, 600) : null);
    pv();
    sheet.showModal();
    if (!p) setTimeout(() => pf.name.focus({ preventScroll: true }), 50);
  };
  $$('[data-new]').forEach(b => b.addEventListener('click', () => openSheet(null)));
  pf.addEventListener('input', pv);
  $$('[data-q]', pf).forEach(b => b.addEventListener('click', () => { pf.stock.value = Math.max(0, (Number(pf.stock.value) || 0) + Number(b.dataset.q)); }));
  sheet.addEventListener('click', e => { if (e.target === sheet) sheet.close(); });

  /* Photo: shrink on the phone before saving, so pages stay fast */
  $('[data-file]').addEventListener('change', async e => {
    const f = e.target.files[0]; if (!f) return;
    const box = $('[data-photo]'); box.classList.add('is-busy');
    try {
      const bm = await createImageBitmap(f);
      const s = Math.min(1, 900 / Math.max(bm.width, bm.height));
      const c = document.createElement('canvas'); c.width = Math.round(bm.width * s); c.height = Math.round(bm.height * s);
      c.getContext('2d').drawImage(bm, 0, 0, c.width, c.height);
      photo = c.toDataURL('image/jpeg', 0.78);
      showPhoto(photo);
    } catch (err) { toast('That photo could not be opened. Try another one.'); }
    box.classList.remove('is-busy');
  });

  pf.addEventListener('submit', e => {
    e.preventDefault();
    const name = pf.name.value.trim(), price = Number(pf.price.value);
    pf.name.closest('.field').classList.toggle('has-err', !name);
    pf.price.closest('.field').classList.toggle('has-err', !(price > 0));
    if (!name || !(price > 0)) return;
    const data = {
      name, sub: pf.sub.value.trim(), price: Math.round(price * 100) / 100,
      stock: Math.max(0, Math.round(Number(pf.stock.value) || 0)),
      aud: $$('input[name=aud]:checked', pf).map(c => c.value).join(' ') || 'every',
      hidden: !pf.visible.checked, alt: name,
    };
    let id;
    if (editing) { Object.assign(editing, data); if (photo && photo !== KH.img(editing, 600)) editing.img = photo; id = editing.id; }
    else {
      id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36).slice(-4);
      products.unshift({ id, ...data, img: photo || 'photo-1610622929850-77f505c3ce5a' });
    }
    saveP(); sheet.close(); setTab('products'); query = ''; $('[data-search]').value = ''; lowOnly = false; render();
    const row = $(`.prow[data-id="${id}"]`); if (row) { row.classList.add('is-flash'); row.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => row.classList.remove('is-flash'), 1800); }
    toast(editing ? 'Saved. Your shop is updated.' : `${name} is now on your shop.`, !data.hidden);
  });

  $('[data-delete]').addEventListener('click', () => {
    if (!editing || !confirm(`Delete ${editing.name}? This removes it from your shop.`)) return;
    products = products.filter(p => p !== editing); saveP(); sheet.close(); render(); toast('Product deleted.');
  });

  $('[data-reset]').addEventListener('click', () => {
    if (!confirm('Put the demo products and orders back to how they started?')) return;
    KH.reset(); products = KH.products(); orders = KH.orders(); render(); toast('Demo data reset.');
  });

  /* Keep in sync if the shop places an order in another tab */
  addEventListener('storage', e => { if (['kh-products', 'kh-orders', null].includes(e.key)) { products = KH.products(); orders = KH.orders(); render(); } });

  if (signed || location.hash === '#demo') enter(); else render();
})();
