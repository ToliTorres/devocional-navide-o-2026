(() => {
  'use strict';
  const book = document.getElementById('book');
  const hint = document.getElementById('hint');
  const dotsEl = document.getElementById('dots');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const live = document.getElementById('live');
  const pages = Array.from(book.querySelectorAll('.page'));
  const wide = window.matchMedia('(min-width: 860px)');
  const TURN_MS = 900;

  let mode = null;     // 'single' (celular) | 'spread' (escritorio)
  let state = 0;       // vista actual
  let leaves = [];
  let views = [];      // páginas visibles en cada vista

  /* ---------- Construcción del libro ---------- */
  function build() {
    const newMode = wide.matches ? 'spread' : 'single';
    if (newMode === mode) return;
    const firstVisible = views.length ? views[state][0] : 0;
    mode = newMode;

    pages.forEach(p => p.remove());
    book.innerHTML = '';
    const inner = document.createElement('div');
    inner.className = 'book-inner';
    leaves = [];

    // En celular: una hoja por página. En escritorio: frente/vuelta en cada hoja.
    const pairs = mode === 'single'
      ? pages.slice(0, -1).map(p => [p, null])
      : [[pages[0], pages[1]], [pages[2], pages[3]]];

    pairs.forEach(([front, back]) => {
      const leaf = document.createElement('div');
      leaf.className = 'leaf';
      leaf.appendChild(face('front', front));
      leaf.appendChild(face('back', back));
      inner.appendChild(leaf);
      leaves.push(leaf);
    });
    const base = document.createElement('div');
    base.className = 'leaf base';
    base.appendChild(face('front', pages[pages.length - 1]));
    inner.appendChild(base);
    book.appendChild(inner);
    book.dataset.mode = mode;

    views = mode === 'single'
      ? pages.map((_, i) => [i])
      : [[0], [1, 2], [3, 4]];
    state = Math.max(0, views.findIndex(v => v.includes(firstVisible)));

    buildDots();
    render(true);
  }

  function face(side, page) {
    const f = document.createElement('div');
    f.className = 'face ' + side + (page ? '' : ' blank');
    if (page) f.appendChild(page);
    return f;
  }

  function buildDots() {
    dotsEl.innerHTML = '';
    views.forEach((v, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Ir a ' + v.map(n => pages[n].dataset.label).join(' y '));
      b.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(b);
    });
  }

  /* ---------- Render ---------- */
  function render(instant) {
    if (instant) book.classList.add('no-anim');
    const n = leaves.length;
    leaves.forEach((leaf, i) => {
      const turned = i < state;
      leaf.classList.toggle('turned', turned);
      if (!leaf.dataset.flipping) leaf.style.zIndex = turned ? i + 1 : n * 2 - i;
      leaf.querySelectorAll('a,button').forEach(el => {
        const onFront = el.closest('.face.front');
        const visible = turned ? !onFront : onFront;
        el.tabIndex = visible ? 0 : -1;
      });
    });
    book.querySelector('.base').style.zIndex = 0;
    book.classList.toggle('closed', state === 0);

    prevBtn.disabled = state === 0;
    nextBtn.disabled = state === views.length - 1;
    Array.from(dotsEl.children).forEach((d, i) => d.setAttribute('aria-current', i === state));

    hint.textContent = state === 0
      ? '✦ Toca la portada para abrir ✦'
      : state === views.length - 1
        ? '✦ ¡Te esperamos! ✦'
        : (mode === 'single' ? '✦ Desliza o toca para pasar la hoja ✦' : '✦ Haz clic en la página para continuar ✦');
    live.textContent = 'Página ' + (state + 1) + ' de ' + views.length + ': ' +
      views[state].map(n => pages[n].dataset.label).join(' y ');

    if (instant) requestAnimationFrame(() => requestAnimationFrame(() => book.classList.remove('no-anim')));
  }

  /* ---------- Navegación ---------- */
  function step(dir) {
    const target = state + dir;
    if (target < 0 || target >= views.length) return false;
    const leaf = leaves[dir > 0 ? state : state - 1];
    if (leaf) {
      leaf.dataset.flipping = '1';
      leaf.style.zIndex = 100;
      clearTimeout(leaf._t);
      leaf._t = setTimeout(() => { delete leaf.dataset.flipping; render(); }, TURN_MS);
    }
    state = target;
    render();
    return true;
  }
  const next = () => step(1);
  const prev = () => step(-1);

  function goTo(target) {
    const dir = Math.sign(target - state);
    if (!dir) return;
    (function tick() {
      if (state === target) return;
      step(dir);
      if (state !== target) setTimeout(tick, 220);
    })();
  }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  /* Toque / clic sobre el libro */
  let swiped = false;
  book.addEventListener('click', e => {
    if (swiped) { swiped = false; return; }
    const go = e.target.closest('[data-go]');
    if (go) { goTo(Number(go.dataset.go)); return; }
    if (e.target.closest('a,button')) return;
    if (state === 0) { next(); return; }
    const r = book.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const split = mode === 'single' ? 0.35 : 0.5;
    x < split ? prev() : next();
  });

  /* Deslizar (celular) */
  let sx = 0, sy = 0, st = 0;
  book.addEventListener('touchstart', e => {
    const t = e.changedTouches[0]; sx = t.clientX; sy = t.clientY; st = Date.now();
  }, { passive: true });
  book.addEventListener('touchend', e => {
    const t = e.changedTouches[0];
    const dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3 && Date.now() - st < 800) {
      swiped = true;
      dx < 0 ? next() : prev();
      setTimeout(() => { swiped = false; }, 400);
    }
  }, { passive: true });

  /* Teclado */
  book.addEventListener('keydown', e => {
    if (e.target !== book) return;
    if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
  });
  document.addEventListener('keydown', e => {
    if (e.target === book || e.target.closest('input,textarea')) return;
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });

  /* ---------- Nieve ---------- */
  function snow() {
    const box = document.getElementById('snow');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const colors = ['#ffffff', '#cfe9fb', '#d6f3e2', '#e9defa', '#fff3c9'];
    const count = window.innerWidth < 600 ? 12 : 22;
    let html = '';
    for (let i = 0; i < count; i++) {
      const sz = 10 + Math.random() * 16;
      html += '<svg style="left:' + (Math.random() * 100).toFixed(1) + '%;--sz:' + sz.toFixed(0) +
        'px;--c:' + colors[i % colors.length] + ';--t:' + (9 + Math.random() * 9).toFixed(1) +
        's;--d:-' + (Math.random() * 18).toFixed(1) + 's;--drift:' + (Math.random() * 60 - 30).toFixed(0) +
        'px"><use href="#i-flake"/></svg>';
    }
    box.innerHTML = html;
  }

  build();
  snow();
  (wide.addEventListener ? wide.addEventListener('change', build) : wide.addListener(build));
})();
