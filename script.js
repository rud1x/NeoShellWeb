/* NeoShell landing — interaction layer.
   Vanilla JS only: reveal, nav state, tabs, horizontal manifesto,
   counters, cursor and magnetic buttons. All motion is opt-out. */

(() => {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const desktop = window.matchMedia('(min-width: 961px)');
  const raf = window.requestAnimationFrame.bind(window);

  /* ── scroll progress + nav condense ─────────────────────────── */
  const bar = document.getElementById('progressBar');
  const nav = document.getElementById('nav');
  let scrollQueued = false;

  /* step watermarks drift slower than the cards (parallax) */
  const steps = [...document.querySelectorAll('.step')];

  const updateWm = () => {
    if (!steps.length || reduce) return;
    const mid = window.innerHeight / 2;
    steps.forEach((el) => {
      const r = el.getBoundingClientRect();
      const d = (r.top + r.height / 2 - mid) / window.innerHeight;
      el.style.setProperty('--wm', (-d * 26).toFixed(1) + 'px');
    });
  };

  const onScrollFrame = () => {
    scrollQueued = false;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const progress = h > 0 ? (window.scrollY / h) * 100 : 0;
    if (bar) bar.style.width = progress + '%';
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 12);
    updatePrinciples();
    updateWm();
  };

  const queueScroll = () => {
    if (scrollQueued) return;
    scrollQueued = true;
    raf(onScrollFrame);
  };

  window.addEventListener('scroll', queueScroll, { passive: true });
  window.addEventListener('resize', queueScroll, { passive: true });

  /* ── mobile menu ────────────────────────────────────────────── */
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  const setMenu = (open) => {
    if (!menuBtn || !mobileMenu) return;
    menuBtn.classList.toggle('is-open', open);
    mobileMenu.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  };

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      setMenu(!mobileMenu.classList.contains('is-open'));
    });
    mobileMenu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => setMenu(false));
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setMenu(false);
    });
    desktop.addEventListener('change', () => setMenu(false));
  }

  /* ── active nav link ────────────────────────────────────────── */
  const navLinks = [...document.querySelectorAll('.nav-link')];
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    const navIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        navLinks.forEach((a) => {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id);
        });
      });
    }, { rootMargin: '-42% 0px -52% 0px', threshold: 0 });
    sections.forEach((s) => navIO.observe(s));
  }

  /* ── reveal on scroll ───────────────────────────────────────── */
  const revealEls = [...document.querySelectorAll('[data-reveal], [data-stagger]')];
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ── cursor + magnetic buttons ──────────────────────────────── */
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');

  if (fine && dot && ring && !reduce) {
    let mx = -100, my = -100, rx = -100, ry = -100;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    }, { passive: true });

    const loop = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      raf(loop);
    };
    raf(loop);

    document.querySelectorAll('a, button, [data-spotlight], .pscreen, .app-row')
      .forEach((el) => {
        el.addEventListener('mouseenter', () => ring.classList.add('is-hot'));
        el.addEventListener('mouseleave', () => ring.classList.remove('is-hot'));
      });

    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.18}px, ${y * 0.24}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ── spotlight cards ────────────────────────────────────────── */
  document.querySelectorAll('[data-spotlight]').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ── hero parallax ──────────────────────────────────────────── */
  const scene = document.getElementById('stageInner');
  const hero = document.querySelector('.hero');

  if (fine && scene && hero && !reduce) {
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      scene.style.transform = `rotateY(${px * 7}deg) rotateX(${-py * 5}deg)`;
    });
    hero.addEventListener('mouseleave', () => { scene.style.transform = ''; });
  }

  /* ── marquee: duplicate for a seamless loop ─────────────────── */
  const marquee = document.getElementById('marqueeTrack');
  if (marquee) marquee.innerHTML += marquee.innerHTML;

  /* ── counters ───────────────────────────────────────────────── */
  const counters = [...document.querySelectorAll('[data-count]')];

  const runCount = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || '';
    if (reduce || target === 0) {
      el.textContent = target + suffix;
      return;
    }
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) raf(tick);
    };
    raf(tick);
  };

  if ('IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        runCount(en.target);
        cio.unobserve(en.target);
      });
    }, { threshold: 0.5 });
    counters.forEach((c) => cio.observe(c));
  } else {
    counters.forEach(runCount);
  }

  /* ── showcase tabs ──────────────────────────────────────────── */
  const tabList = document.getElementById('screenTabs');
  const tabs = tabList ? [...tabList.querySelectorAll('.tab')] : [];
  const screens = [...document.querySelectorAll('#showcasePhone .pscreen')];
  const showcase = document.getElementById('showcase');
  let autoTimer = null;
  let resumeTimer = null;
  let activeIndex = 0;
  let layoutEditing = false;

  const fitCanvas = (canvas) => {
    const host = canvas.parentElement;
    const width = host ? host.clientWidth : 0;
    const exe = canvas.hasAttribute('data-exe');
    const base = exe ? 360 : 390;
    if (width <= 0) return;
    canvas.style.setProperty(exe ? '--exe-scale' : '--au-scale', (width / base).toFixed(4));
  };

  const fitAppScreens = () => {
    document.querySelectorAll('[data-au], [data-exe]').forEach(fitCanvas);
  };

  if ('ResizeObserver' in window) {
    const appObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const canvas = entry.target.querySelector('[data-au], [data-exe]');
        if (canvas && entry.contentRect.width > 0) fitCanvas(canvas);
      });
    });
    document.querySelectorAll('[data-au], [data-exe]').forEach((canvas) => {
      if (canvas.parentElement) appObserver.observe(canvas.parentElement);
    });
  }

  const showScreen = (id, index) => {
    tabs.forEach((t, i) => {
      const on = t.dataset.screen === id;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on) activeIndex = i;
    });
    screens.forEach((s) => {
      const on = s.dataset.screen === id;
      s.classList.toggle('is-active', on);
      if (on) {
        s.hidden = false;
        s.classList.remove('is-active');
        void s.offsetWidth;
        s.classList.add('is-active');
      } else {
        s.hidden = true;
      }
    });
    if (typeof index === 'number') activeIndex = index;
    raf(fitAppScreens);
  };

  fitAppScreens();
  let auResize;
  window.addEventListener('resize', () => {
    clearTimeout(auResize);
    auResize = setTimeout(fitAppScreens, 120);
  }, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAppScreens);

  const nextScreen = () => {
    if (!tabs.length) return;
    const next = (activeIndex + 1) % tabs.length;
    showScreen(tabs[next].dataset.screen, next);
  };

  const startAuto = () => {
    if (!tabs.length || layoutEditing) return;
    stopAuto();
    autoTimer = window.setInterval(nextScreen, 6000);
  };
  const stopAuto = () => {
    if (autoTimer) window.clearInterval(autoTimer);
    autoTimer = null;
  };
  const inView = () => {
    if (!showcase) return false;
    const rect = showcase.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight;
  };
  const pauseAuto = () => {
    stopAuto();
    clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(() => {
      if (inView()) startAuto();
    }, 12000);
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      pauseAuto();
      showScreen(tab.dataset.screen, i);
    });
    tab.addEventListener('keydown', (e) => {
      const keys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'];
      if (!keys.includes(e.key)) return;
      e.preventDefault();
      pauseAuto();
      let next = i;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % tabs.length;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = tabs.length - 1;
      tabs[next].focus();
      showScreen(tabs[next].dataset.screen, next);
    });
  });

  if (showcase && 'IntersectionObserver' in window) {
    const sio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) startAuto();
        else stopAuto();
      });
    }, { threshold: 0.2 });
    sio.observe(showcase);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAuto();
    else if (inView()) startAuto();
  });

  /* ── dashboard layout demo ──────────────────────────────────── */
  const layoutToggle = document.getElementById('layoutToggle');
  const layoutToggleText = document.getElementById('layoutToggleText');
  const powerPage = document.querySelector('#screen-power .au-reorder');
  const powerCanvas = document.querySelector('#screen-power .au-canvas');
  const layoutKey = 'neoshell:layout';
  let drag = null;

  const saveLayout = () => {
    if (!powerPage) return;
    const order = [...powerPage.querySelectorAll('.au-panel[data-panel]')].map((el) => el.dataset.panel);
    try { localStorage.setItem(layoutKey, JSON.stringify(order)); } catch (error) { /* private mode */ }
  };

  const restoreLayout = () => {
    if (!powerPage) return;
    try {
      const order = JSON.parse(localStorage.getItem(layoutKey) || '[]');
      if (!Array.isArray(order)) return;
      order.forEach((id) => {
        const el = powerPage.querySelector(`.au-panel[data-panel="${id}"]`);
        if (el) powerPage.appendChild(el);
      });
    } catch (error) { /* ignore broken storage */ }
  };

  const moveBy = (panel, direction) => {
    const sibling = direction < 0 ? panel.previousElementSibling : panel.nextElementSibling;
    if (!sibling || !sibling.classList.contains('au-panel')) return;
    if (direction < 0) powerPage.insertBefore(panel, sibling);
    else powerPage.insertBefore(sibling, panel);
    saveLayout();
  };

  const setLayoutEditing = (on) => {
    if (!powerPage || !layoutToggle) return;
    layoutEditing = on;
    showcase.classList.toggle('is-editing', on);
    layoutToggle.setAttribute('aria-pressed', String(on));
    layoutToggleText.textContent = on ? 'Готово' : 'Режим раскладки';
    powerPage.querySelectorAll('.au-grip').forEach((grip) => { grip.tabIndex = on ? 0 : -1; });
    if (on) {
      pauseAuto();
      const index = tabs.findIndex((t) => t.dataset.screen === 'power');
      if (index >= 0) showScreen('power', index);
    } else {
      clearTimeout(resumeTimer);
      if (inView()) startAuto();
    }
  };

  if (layoutToggle && powerPage) {
    restoreLayout();

    layoutToggle.addEventListener('click', () => setLayoutEditing(!layoutEditing));

    powerPage.querySelectorAll('.au-grip').forEach((grip) => {
      grip.addEventListener('keydown', (e) => {
        if (!layoutEditing || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
        e.preventDefault();
        e.stopPropagation();
        moveBy(grip.closest('.au-panel'), e.key === 'ArrowUp' ? -1 : 1);
        grip.focus();
      });
    });

    powerPage.querySelectorAll('.au-panel[data-panel]').forEach((panel) => {
      panel.addEventListener('pointerdown', (e) => {
        if (!layoutEditing || e.button !== 0 || !powerCanvas) return;
        e.preventDefault();
        pauseAuto();
        const scale = powerCanvas.getBoundingClientRect().width / 390 || 1;
        const grab = e.clientY - panel.getBoundingClientRect().top;
        const pointerId = e.pointerId;
        let translate = 0;
        panel.classList.add('is-dragging');

        const update = (clientY) => {
          const rect = panel.getBoundingClientRect();
          const layoutTop = rect.top - translate * scale;
          translate = (clientY - grab - layoutTop) / scale;
          panel.style.transform = `translate3d(0, ${translate}px, 0)`;

          let before = null;
          for (const other of powerPage.querySelectorAll('.au-panel[data-panel]')) {
            if (other === panel) continue;
            const box = other.getBoundingClientRect();
            if (clientY < box.top + box.height / 2) { before = other; break; }
          }
          const atEnd = before === null;
          if ((atEnd && panel === powerPage.lastElementChild) || (!atEnd && panel.nextElementSibling === before)) return;
          powerPage.insertBefore(panel, before);
          const moved = panel.getBoundingClientRect();
          translate = (clientY - grab - (moved.top - translate * scale)) / scale;
          panel.style.transform = `translate3d(0, ${translate}px, 0)`;
        };

        const onMove = (ev) => {
          if (ev.pointerId !== pointerId) return;
          update(ev.clientY);
        };
        const onEnd = (ev) => {
          if (ev.pointerId !== pointerId) return;
          panel.classList.remove('is-dragging');
          panel.style.transform = '';
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onEnd);
          window.removeEventListener('pointercancel', onEnd);
          saveLayout();
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onEnd);
        window.addEventListener('pointercancel', onEnd);
      });
    });
  }


  /* ── horizontal manifesto ───────────────────────────────────── */
  const prSection = document.getElementById('principles');
  const prTrack = document.getElementById('principlesTrack');
  const prProgress = document.getElementById('prProgress');
  let prDistance = 0;
  let prEnabled = false;

  function updatePrinciples() {
    if (!prEnabled || !prSection || !prTrack) return;
    const total = prSection.offsetHeight - window.innerHeight;
    if (total <= 0) return;
    const rect = prSection.getBoundingClientRect();
    const p = Math.min(Math.max(-rect.top / total, 0), 1);
    prTrack.style.transform = `translate3d(${-p * prDistance}px, 0, 0)`;
    if (prProgress) prProgress.style.width = (p * 100) + '%';
  }

  function measurePrinciples() {
    if (!prSection || !prTrack) return;
    if (!desktop.matches || reduce) {
      prEnabled = false;
      prSection.style.height = '';
      prTrack.style.transform = '';
      if (prProgress) prProgress.style.width = '0%';
      return;
    }
    prEnabled = true;
    prTrack.style.transform = 'translate3d(0, 0, 0)';
    prSection.style.height = '';
    prDistance = Math.max(0, prTrack.scrollWidth - window.innerWidth);
    prSection.style.height = (window.innerHeight + prDistance) + 'px';
    updatePrinciples();
  }

  if (prSection && prTrack) {
    measurePrinciples();
    queueScroll();
    desktop.addEventListener('change', measurePrinciples);
    let prResize;
    window.addEventListener('resize', () => {
      clearTimeout(prResize);
      prResize = setTimeout(measurePrinciples, 180);
    }, { passive: true });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measurePrinciples);
    }
    window.addEventListener('load', measurePrinciples);
  }

  /* ── copy clone command ─────────────────────────────────────── */
  const copyBtn = document.getElementById('copyClone');
  const cloneCmd = document.getElementById('cloneCmd');
  if (copyBtn && cloneCmd) {
    copyBtn.addEventListener('click', async () => {
      const text = cloneCmd.textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      const use = copyBtn.querySelector('use');
      copyBtn.classList.add('is-done');
      if (use) use.setAttribute('href', '#i-check');
      window.setTimeout(() => {
        copyBtn.classList.remove('is-done');
        if (use) use.setAttribute('href', '#i-copy');
      }, 1600);
    });
  }

  /* ── initial paint ──────────────────────────────────────────── */
  onScrollFrame();
})();
