/* Shared product + order store for the demo.
   The real launch swaps this file for Supabase calls; the shop and admin keep the same shape. */
(() => {
  const DEFAULTS = [
    { id: 'greens', aud: 'pro every', name: 'Daily Greens', sub: 'Blend, 30 servings', price: 180, stock: 24, hidden: false, img: 'photo-1610622929850-77f505c3ce5a', alt: 'Green smoothies in glasses' },
    { id: 'protein', aud: 'fit pro', name: 'Plant Protein', sub: 'Vanilla, 1 kg tub', price: 260, stock: 4, hidden: false, img: 'photo-1774793476321-70f77d85a3a7', alt: 'A scoop of protein powder on a wooden surface' },
    { id: 'bowl', aud: 'pro every', name: 'Morning Bowl Mix', sub: 'Oats, seeds and fruit, 500 g', price: 95, stock: 18, hidden: false, img: 'photo-1627308594190-a057cd4bfac8', alt: 'Two smoothie bowls topped with banana, berries and granola' },
    { id: 'tea', aud: 'every pro', name: 'Wind-Down Tea', sub: 'Herbal, 20 bags', price: 65, stock: 30, hidden: false, img: 'photo-1558160074-4d7d8bdf4256', alt: 'Glass cup of tea beside a clay teapot' },
    { id: 'plan', aud: 'pro fit', name: '4-Week Meal Plan', sub: 'Recipes and shopping lists', price: 350, stock: 99, hidden: false, img: 'photo-1543352632-5a4b24e4d2a6', alt: 'Three meal prep containers with rice, corn and vegetables' },
    { id: 'consult', aud: 'fit every pro', name: 'Nutrition Consult', sub: '60 minutes, in person or video', price: 300, stock: 6, hidden: false, img: 'photo-1631539338594-9c5f759baf0b', alt: 'Woman sipping a drink while reading' },
  ];
  const day = n => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString(); };
  const SAMPLE_ORDERS = [
    { no: 'KH-1041', name: 'Renee Mohammed', area: 'San Fernando', ship: 'delivery', pay: 'Bank transfer', items: [['greens', 1], ['tea', 2]], total: 350, status: 'new', at: day(0) },
    { no: 'KH-1040', name: 'Andre Baptiste', area: 'Diego Martin', ship: 'pickup', pay: 'Cash on delivery', items: [['protein', 2]], total: 520, status: 'paid', at: day(1) },
    { no: 'KH-1039', name: 'Shivani Ramdass', area: 'Chaguanas', ship: 'delivery', pay: 'Bank transfer', items: [['plan', 1], ['bowl', 1]], total: 485, status: 'new', at: day(1) },
    { no: 'KH-1038', name: 'Marcus Joseph', area: 'Arima', ship: 'delivery', pay: 'Bank transfer', items: [['consult', 1]], total: 340, status: 'delivered', at: day(3) },
    { no: 'KH-1037', name: 'Keisha Charles', area: 'Port of Spain', ship: 'delivery', pay: 'Cash on delivery', items: [['greens', 2], ['bowl', 1]], total: 495, status: 'delivered', at: day(4) },
  ];
  const get = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };

  window.KH = {
    DEFAULTS,
    products: () => get('kh-products', DEFAULTS),
    saveProducts: list => set('kh-products', list),
    orders: () => get('kh-orders', SAMPLE_ORDERS),
    saveOrders: list => set('kh-orders', list),
    nextInvoice: () => { const n = get('kh-inv-seq', 1042); return 'KH-' + n; },
    bumpInvoice: () => set('kh-inv-seq', get('kh-inv-seq', 1042) + 1),
    reset: () => { ['kh-products', 'kh-orders', 'kh-inv-seq', 'kh-cart'].forEach(k => { try { localStorage.removeItem(k); } catch (e) {} }); },
    img: (p, w = 900) => (p.img || '').startsWith('data:') ? p.img : `https://images.unsplash.com/${p.img}?w=${w}&q=70&auto=format&fit=crop`,
    money: n => 'TT$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    esc: s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])),
  };
})();
