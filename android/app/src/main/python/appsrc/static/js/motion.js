/* ==========================================================================
   FORCE RACING // MOTION & COMMAND LAYER
   Isolated behaviour module for the premium UI layer.
   - Scroll progress, nav elevation, staggered reveal, card spotlight
   - Button ripples, route-transition veil
   - Command palette (Ctrl/Cmd + K)
   - Respects prefers-reduced-motion and degrades safely without JS
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = false;
  try {
    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (err) {
    reduceMotion = false;
  }

  /* Enable motion styles only when JS is alive, so content is never hidden. */
  root.classList.add('fr-motion');

  /* Low-power devices: keep the depth styling but skip pointer-driven effects. */
  var lowPower = false;
  try {
    lowPower = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
      (navigator.connection && navigator.connection.saveData) ||
      (navigator.deviceMemory && navigator.deviceMemory <= 4);
  } catch (err) {
    lowPower = false;
  }
  if (lowPower) root.classList.add('fr-lite');

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Scroll progress + navbar elevation                                     */
  /* ---------------------------------------------------------------------- */
  function initScrollChrome() {
    var bar = document.createElement('div');
    bar.id = 'fr-scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    var navbar = document.querySelector('.navbar');
    var ticking = false;

    function update() {
      if (document.hidden) { ticking = false; return; }
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
      if (navbar) navbar.classList.toggle('fr-scrolled', window.scrollY > 8);
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  /* ---------------------------------------------------------------------- */
  /* Staggered reveal                                                       */
  /* ---------------------------------------------------------------------- */
  function initReveal() {
    if (reduceMotion || !('IntersectionObserver' in window)) return;

    var selector = [
      '.card', '.quicklink-card', '.countdown-tile', '.fleet-card',
      '.task-filter-card', '.mobile-task-card', '.assigned-tasks-card',
      '.section-header-wrap', '.data-table', '.table-responsive',
      '.telemetry-item', '.task-widget-item'
    ].join(',');

    var nodes = Array.prototype.slice.call(document.querySelectorAll(selector));
    if (!nodes.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('fr-in');
        observer.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    nodes.forEach(function (el, index) {
      if (el.hasAttribute('data-fr-no-reveal')) return;
      el.classList.add('fr-reveal');
      el.style.setProperty('--fr-delay', (Math.min(index % 6, 5) * 55) + 'ms');
      observer.observe(el);
    });

    /* Safety net: if layout shifts and an element never intersects, reveal it. */
    window.setTimeout(function () {
      nodes.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) el.classList.add('fr-in');
      });
    }, 1600);
  }

  /* ---------------------------------------------------------------------- */
  /* Card spotlight                                                        */
  /* ---------------------------------------------------------------------- */
  function initSpotlight() {
    if (reduceMotion || lowPower) return;
    if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    var frames = new WeakMap();

    document.addEventListener('pointermove', function (event) {
      var card = event.target && event.target.closest
        ? event.target.closest('.card, .quicklink-card, .countdown-tile, .fleet-card, .tachometer-card')
        : null;
      if (!card) return;

      if (frames.has(card)) return;
      var rect = card.getBoundingClientRect();
      var x = event.clientX - rect.left;
      var y = event.clientY - rect.top;

      frames.set(card, window.requestAnimationFrame(function () {
        card.style.setProperty('--fr-mx', x + 'px');
        card.style.setProperty('--fr-my', y + 'px');
        frames.delete(card);
      }));
    }, { passive: true });
  }

  /* ---------------------------------------------------------------------- */
  /* Button ripple                                                         */
  /* ---------------------------------------------------------------------- */
  function initRipple() {
    if (reduceMotion || lowPower) return;

    document.addEventListener('pointerdown', function (event) {
      var btn = event.target && event.target.closest
        ? event.target.closest('.btn, .btn-quick-refresh, .quicklink-card')
        : null;
      if (!btn) return;

      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height) * 0.9;
      var span = document.createElement('span');
      span.className = 'fr-ripple';
      span.style.width = size + 'px';
      span.style.height = size + 'px';
      span.style.left = (event.clientX - rect.left - size / 2) + 'px';
      span.style.top = (event.clientY - rect.top - size / 2) + 'px';

      if (getComputedStyle(btn).position === 'static') btn.style.position = 'relative';
      btn.appendChild(span);
      window.setTimeout(function () {
        if (span.parentNode) span.parentNode.removeChild(span);
      }, 680);
    }, { passive: true });
  }

  /* ---------------------------------------------------------------------- */
  /* Command palette                                                       */
  /* ---------------------------------------------------------------------- */
  function initCommandPalette() {
    var palette = document.createElement('div');
    palette.id = 'fr-command';
    palette.setAttribute('role', 'dialog');
    palette.setAttribute('aria-modal', 'true');
    palette.setAttribute('aria-label', 'Command palette');
    palette.innerHTML =
      '<div class="fr-command-panel">' +
        '<div class="fr-command-head">' +
          '<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>' +
          '<input class="fr-command-input" type="text" placeholder="Jump to a page, tool or action…" ' +
            'aria-label="Search commands" autocomplete="off" spellcheck="false">' +
          '<span class="fr-kbd">ESC</span>' +
        '</div>' +
        '<ul class="fr-command-list" role="listbox"></ul>' +
        '<div class="fr-command-foot">' +
          '<span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>' +
          '<span><kbd>↵</kbd> open</span>' +
          '<span><kbd>Ctrl</kbd>+<kbd>K</kbd> toggle</span>' +
        '</div>' +
      '</div>';
    document.body.appendChild(palette);

    var input = palette.querySelector('.fr-command-input');
    var list = palette.querySelector('.fr-command-list');
    var items = [];
    var filtered = [];
    var active = 0;
    var isOpen = false;

    function collect() {
      var seen = {};
      var found = [];

      function push(label, href, icon) {
        if (!label || !href) return;
        var key = href + '|' + label.toLowerCase();
        if (seen[key]) return;
        seen[key] = true;
        found.push({ label: label, href: href, icon: icon || 'fa-arrow-right' });
      }

      Array.prototype.forEach.call(document.querySelectorAll('.nav-link'), function (link) {
        push((link.textContent || '').trim(), link.getAttribute('href'), 'fa-compass');
      });
      Array.prototype.forEach.call(document.querySelectorAll('.pit-bottom-nav a'), function (link) {
        push((link.textContent || '').trim(), link.getAttribute('href'), 'fa-mobile-screen');
      });
      Array.prototype.forEach.call(document.querySelectorAll('.footer-links a'), function (link) {
        push((link.textContent || '').trim(), link.getAttribute('href'), 'fa-link');
      });

      push('Home', '/', 'fa-house');
      push('Refresh telemetry', '#refresh', 'fa-rotate');
      items = found;
    }

    function render() {
      list.innerHTML = '';
      if (!filtered.length) {
        var empty = document.createElement('li');
        empty.className = 'fr-command-empty';
        empty.textContent = 'No matching destination';
        list.appendChild(empty);
        return;
      }
      filtered.forEach(function (item, index) {
        var li = document.createElement('li');
        li.className = 'fr-command-item' + (index === active ? ' fr-active' : '');
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', index === active ? 'true' : 'false');
        li.innerHTML = '<i class="fa-solid ' + item.icon + '" aria-hidden="true"></i>' +
          '<span>' + item.label + '</span>' +
          '<small>' + (item.href === '#refresh' ? 'ACTION' : 'PAGE') + '</small>';
        li.addEventListener('click', function () { choose(index); });
        li.addEventListener('pointermove', function () {
          if (active !== index) { active = index; render(); }
        });
        list.appendChild(li);
      });
      var current = list.children[active];
      if (current && current.scrollIntoView) {
        current.scrollIntoView({ block: 'nearest' });
      }
    }

    function filter(query) {
      var q = (query || '').trim().toLowerCase();
      filtered = items.filter(function (item) {
        return !q || item.label.toLowerCase().indexOf(q) !== -1 || item.href.toLowerCase().indexOf(q) !== -1;
      });
      active = 0;
      render();
    }

    function choose(index) {
      var item = filtered[index];
      if (!item) return;
      close();
      if (item.href === '#refresh') {
        window.dispatchEvent(new CustomEvent('fr:refresh'));
        var btn = document.getElementById('btn-quick-refresh');
        if (btn) btn.click();
        return;
      }
      window.location.href = item.href;
    }

    function open() {
      if (isOpen) return;
      collect();
      isOpen = true;
      palette.classList.add('fr-open');
      document.body.style.overflow = 'hidden';
      filter('');
      window.setTimeout(function () { input.focus(); }, 30);
    }

    function close() {
      if (!isOpen) return;
      isOpen = false;
      palette.classList.remove('fr-open');
      document.body.style.overflow = '';
      input.value = '';
    }

    input.addEventListener('input', function () { filter(input.value); });

    palette.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { event.preventDefault(); close(); return; }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        active = Math.min(filtered.length - 1, active + 1);
        render();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        active = Math.max(0, active - 1);
        render();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        choose(active);
      }
    });

    palette.addEventListener('mousedown', function (event) {
      if (event.target === palette) close();
    });

    document.addEventListener('keydown', function (event) {
      var key = (event.key || '').toLowerCase();
      if ((event.ctrlKey || event.metaKey) && key === 'k') {
        event.preventDefault();
        if (isOpen) close(); else open();
      } else if (key === '/' && !isOpen) {
        var tag = (event.target && event.target.tagName || '').toLowerCase();
        var typing = tag === 'input' || tag === 'textarea' || (event.target && event.target.isContentEditable);
        if (!typing) { event.preventDefault(); open(); }
      }
    });

    window.ForceRacingPalette = { open: open, close: close };
  }

  /* ---------------------------------------------------------------------- */
  /* Route transition veil                                                 */
  /* ---------------------------------------------------------------------- */
  function initPageVeil() {
    if (reduceMotion) return;

    var veil = document.createElement('div');
    veil.id = 'fr-page-veil';
    veil.setAttribute('aria-hidden', 'true');
    document.body.appendChild(veil);

    document.addEventListener('click', function (event) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      var link = event.target && event.target.closest ? event.target.closest('a[href]') : null;
      if (!link) return;
      if (link.target && link.target !== '_self') return;
      if (link.hasAttribute('download')) return;

      var href = link.getAttribute('href');
      if (!href || href.charAt(0) === '#' || href.indexOf('javascript:') === 0) return;

      var url;
      try { url = new URL(href, window.location.href); } catch (err) { return; }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      veil.classList.add('fr-active');
      window.setTimeout(function () {
        if (veil.classList.contains('fr-active')) veil.classList.remove('fr-active');
      }, 6000);
    }, true);

    window.addEventListener('pageshow', function () {
      veil.classList.remove('fr-active');
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Kinetic hero words                                                    */
  /* ---------------------------------------------------------------------- */
  function initKineticHero() {
    var motto = document.querySelector('.hero-motto');
    if (!motto) return;

    var index = 0;
    function walk(node) {
      if (node.nodeType === 3) {
        var frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (!part.trim()) { frag.appendChild(document.createTextNode(part)); return; }
          var span = document.createElement('span');
          span.className = 'fr-word';
          span.textContent = part;
          span.style.setProperty('--fr-wi', index++);
          frag.appendChild(span);
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1) {
        Array.prototype.slice.call(node.childNodes).forEach(walk);
      }
    }
    Array.prototype.slice.call(motto.childNodes).forEach(walk);
  }

  /* ---------------------------------------------------------------------- */
  /* Countdown digit flip                                                  */
  /* ---------------------------------------------------------------------- */
  function initCountdownFlip() {
    if (reduceMotion || !('MutationObserver' in window)) return;
    var seconds = document.getElementById('countdown-seconds');
    if (!seconds) return;
    var tile = seconds.closest('.countdown-tile');
    if (!tile) return;

    var timer = null;
    new MutationObserver(function () {
      tile.classList.remove('fr-tick');
      void tile.offsetWidth;
      tile.classList.add('fr-tick');
      window.clearTimeout(timer);
      timer = window.setTimeout(function () { tile.classList.remove('fr-tick'); }, 470);
    }).observe(seconds, { childList: true, characterData: true, subtree: true });
  }

  /* ---------------------------------------------------------------------- */
  /* 3D card tilt                                                          */
  /* ---------------------------------------------------------------------- */
  function initTilt() {
    if (reduceMotion || lowPower) return;
    if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    Array.prototype.forEach.call(document.querySelectorAll('.quicklink-card'), function (card) {
      var frame = null;
      card.addEventListener('pointermove', function (event) {
        if (frame) return;
        frame = window.requestAnimationFrame(function () {
          frame = null;
          var rect = card.getBoundingClientRect();
          var px = (event.clientX - rect.left) / rect.width - 0.5;
          var py = (event.clientY - rect.top) / rect.height - 0.5;
          card.classList.add('fr-tilting');
          card.style.transform = 'perspective(900px) rotateX(' + (-py * 6).toFixed(2) +
            'deg) rotateY(' + (px * 8).toFixed(2) + 'deg) translateY(-4px)';
        });
      }, { passive: true });

      card.addEventListener('pointerleave', function () {
        card.style.transform = '';
        window.setTimeout(function () { card.classList.remove('fr-tilting'); }, 230);
      });
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Tracking reticle                                                      */
  /* ---------------------------------------------------------------------- */
  function initReticle() {
    if (reduceMotion || lowPower) return;
    if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    var dot = document.createElement('div');
    dot.id = 'fr-reticle';
    dot.setAttribute('aria-hidden', 'true');
    document.body.appendChild(dot);

    var tx = window.innerWidth / 2;
    var ty = window.innerHeight / 2;
    var x = tx;
    var y = ty;
    var shown = false;
    var raf = null;

    function loop() {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      dot.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      raf = (Math.abs(tx - x) > 0.3 || Math.abs(ty - y) > 0.3) ? window.requestAnimationFrame(loop) : null;
    }

    document.addEventListener('pointermove', function (event) {
      tx = event.clientX;
      ty = event.clientY;
      if (!shown) { shown = true; dot.classList.add('fr-visible'); }
      if (!raf) raf = window.requestAnimationFrame(loop);
      var hot = event.target && event.target.closest
        ? event.target.closest('a, button, .quicklink-card, .countdown-tile, input, .btn')
        : null;
      dot.classList.toggle('fr-hot', !!hot);
    }, { passive: true });

    document.addEventListener('pointerleave', function () {
      shown = false;
      dot.classList.remove('fr-visible');
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Boot                                                                  */
  /* ---------------------------------------------------------------------- */
  ready(function () {
    initScrollChrome();
    initReveal();
    initSpotlight();
    initRipple();
    initCommandPalette();
    initPageVeil();
    initKineticHero();
    initCountdownFlip();
    initTilt();
  });
})();
