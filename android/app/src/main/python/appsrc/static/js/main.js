/**
 * FORCE RACING // PIT WALL OPERATIONS
 * Client-Side Telemetry & Motion Graphics Engine
 * Zero external JS dependencies (Vanilla JS)
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeEngine();
  initNetworkStatusMonitor();
  initSupraCountdown();
  initPasswordUtilities();
  initFlashToasts();
  initDeleteConfirmations();
  initFormSubmitSpinners();
  initMobileNavigation();
  initCameraCapture();
  initSearchHighlighting();
  dismissLockdownGatekeeper();
  initFRLatencyLoader();
  initPullToRefresh();
});

/* --------------------------------------------------------------------------
   1. THEME ENGINE (Dynamic Phone Theme Default & Dark / Light Mode)
   -------------------------------------------------------------------------- */
function initThemeEngine() {
  const STORAGE_KEY = 'force_theme';
  const toggleBtn = document.getElementById('theme-toggle');

  function getPhoneSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  function getEffectiveTheme() {
    // Follow phone system theme dynamically
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    // If phone has a preferred color scheme, prioritize phone system theme
    if (window.matchMedia && (window.matchMedia('(prefers-color-scheme: dark)').matches || window.matchMedia('(prefers-color-scheme: light)').matches)) {
      return getPhoneSystemTheme();
    }
    return savedTheme || getPhoneSystemTheme();
  }

  function applyTheme(theme, saveUserPreference = false) {
    document.documentElement.setAttribute('data-theme', theme);
    if (saveUserPreference) {
      localStorage.setItem(STORAGE_KEY, theme);
    }

    const meta = document.getElementById('meta-theme-color') || document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'light' ? '#ffffff' : '#090a0f');
    }

    if (toggleBtn) {
      const icon = toggleBtn.querySelector('i');
      if (icon) {
        if (theme === 'light') {
          icon.className = 'fa-solid fa-moon';
          toggleBtn.setAttribute('title', 'Switch to Pit Dark Mode');
          toggleBtn.setAttribute('aria-label', 'Switch to Pit Dark Mode');
        } else {
          icon.className = 'fa-solid fa-sun';
          toggleBtn.setAttribute('title', 'Switch to Aerodynamic Light Mode');
          toggleBtn.setAttribute('aria-label', 'Switch to Aerodynamic Light Mode');
        }
      }
    }
  }

  // 1. Synchronize UI strictly with phone/system dark or light mode
  const initialTheme = getEffectiveTheme();
  applyTheme(initialTheme, false);

  // 2. User manual toggle button
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const active = document.documentElement.getAttribute('data-theme') || getPhoneSystemTheme();
      const nextTheme = active === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme, true);
    });
  }

  // 3. Live listener: Automatically synchronize when phone switches between Light/Dark mode
  if (window.matchMedia) {
    const darkMedia = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e) => {
      applyTheme(e.matches ? 'dark' : 'light', false);
    };
    if (darkMedia.addEventListener) {
      darkMedia.addEventListener('change', handleThemeChange);
    } else if (darkMedia.addListener) {
      darkMedia.addListener(handleThemeChange);
    }
  }
}

/* --------------------------------------------------------------------------
   2. LIVE SUPRA SAEINDIA 2027 COUNTDOWN
   -------------------------------------------------------------------------- */
function initSupraCountdown() {
  const countdownContainer = document.querySelector('[data-supra-date]');
  const DEFAULT_SUPRA_2027 = '2027-01-22T08:00:00';
  let rawDate = countdownContainer ? countdownContainer.getAttribute('data-supra-date') : null;
  if (!rawDate) rawDate = DEFAULT_SUPRA_2027;

  let targetDate = new Date(rawDate).getTime();
  if (isNaN(targetDate)) {
    targetDate = new Date(DEFAULT_SUPRA_2027).getTime();
  }

  const daysEl = document.getElementById('countdown-days');
  const hoursEl = document.getElementById('countdown-hours');
  const minutesEl = document.getElementById('countdown-minutes');
  const secondsEl = document.getElementById('countdown-seconds');

  if (!daysEl && !hoursEl && !minutesEl && !secondsEl) return;

  function pad(num) {
    return String(num).padStart(2, '0');
  }

  function update() {
    // Background/minimised windows do no work: the timer resumes on focus.
    if (document.hidden) return;
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minutesEl) minutesEl.textContent = '00';
      if (secondsEl) secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = pad(days);
    if (hoursEl) hoursEl.textContent = pad(hours);
    if (minutesEl) minutesEl.textContent = pad(minutes);
    if (secondsEl) secondsEl.textContent = pad(seconds);
  }

  update();
  setInterval(update, 1000);
}

/* --------------------------------------------------------------------------
   3. PASSWORD STRENGTH & SHOW/HIDE
   -------------------------------------------------------------------------- */
function initPasswordUtilities() {
  document.querySelectorAll('input[type="password"]').forEach((pwdInput) => {
    const wrapper = pwdInput.closest('.password-wrapper') || pwdInput.parentElement;
    if (!wrapper || wrapper.querySelector('.password-toggle-btn')) return;

    wrapper.style.position = 'relative';

    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'password-toggle-btn';
    toggleBtn.setAttribute('aria-label', 'Toggle password visibility');
    toggleBtn.innerHTML = '<i class="fa-solid fa-eye text-muted"></i>';
    toggleBtn.style.cssText = `
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      z-index: 5;
    `;

    toggleBtn.addEventListener('click', () => {
      const isPassword = pwdInput.type === 'password';
      pwdInput.type = isPassword ? 'text' : 'password';
      toggleBtn.innerHTML = isPassword
        ? '<i class="fa-solid fa-eye-slash text-lime"></i>'
        : '<i class="fa-solid fa-eye text-muted"></i>';
    });

    wrapper.appendChild(toggleBtn);
  });

  const targetPwd = document.querySelector('input[data-password-strength="true"], #password');
  if (targetPwd) {
    const parentGroup = targetPwd.closest('.form-group');
    if (parentGroup && !parentGroup.querySelector('.strength-meter')) {
      const meterEl = document.createElement('div');
      meterEl.className = 'strength-meter';
      meterEl.innerHTML = `
        <div class="strength-bar-track">
          <div class="strength-bar-fill" id="pwd-strength-bar"></div>
        </div>
        <div class="strength-label" id="pwd-strength-label">Password Strength: Empty</div>
      `;
      parentGroup.appendChild(meterEl);

      const barFill = meterEl.querySelector('#pwd-strength-bar');
      const labelText = meterEl.querySelector('#pwd-strength-label');

      targetPwd.addEventListener('input', () => {
        const val = targetPwd.value;
        const res = calculateStrength(val);

        if (barFill && labelText) {
          barFill.style.width = res.percent + '%';
          barFill.style.backgroundColor = res.color;
          labelText.textContent = 'Password Strength: ' + res.label;
          labelText.style.color = res.color;
        }
      });
    }
  }

  function calculateStrength(pwd) {
    if (!pwd) return { percent: 0, color: 'var(--border-default)', label: 'Empty' };
    let score = 0;
    if (pwd.length >= 8) score += 25;
    if (pwd.length >= 12) score += 15;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 20;
    if (/\d/.test(pwd)) score += 20;
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 20;

    if (score < 40) return { percent: score, color: '#ef4444', label: 'Weak' };
    if (score < 70) return { percent: score, color: '#f59e0b', label: 'Moderate' };
    if (score < 90) return { percent: score, color: '#10b981', label: 'Strong' };
    return { percent: 100, color: 'var(--accent-lime)', label: 'Race Ready (Optimal)' };
  }
}

/* --------------------------------------------------------------------------
   4. TOAST DISMISSAL & UTILITIES
   -------------------------------------------------------------------------- */
function initFlashToasts() {
  document.querySelectorAll('.toast').forEach((toast) => {
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 6000);
  });
}

window.showPitToast = function(msg, category = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${category}`;
  toast.innerHTML = `
    <div class="toast-icon"><i class="fa-solid fa-circle-info"></i></div>
    <div class="toast-content">${msg}</div>
    <button type="button" class="toast-close" onclick="this.parentElement.remove()">&times;</button>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
};

/* --------------------------------------------------------------------------
   5. CONFIRMATION MODALS
   -------------------------------------------------------------------------- */
function initDeleteConfirmations() {
  document.querySelectorAll('[data-confirm]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const message = btn.getAttribute('data-confirm');
      const itemTitle = btn.getAttribute('data-item-title') || 'this item';
      e.preventDefault();

      showCustomConfirmModal(message, itemTitle, () => {
        const form = btn.closest('form');
        if (form) form.submit();
      });
    });
  });

  function showCustomConfirmModal(message, itemTitle, onConfirm) {
    let modalEl = document.getElementById('pit-confirm-modal');
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.id = 'pit-confirm-modal';
      modalEl.className = 'modal-backdrop';
      modalEl.innerHTML = `
        <div class="modal-card card card-accent-red">
          <div class="modal-header">
            <h3 class="modal-title"><i class="fa-solid fa-triangle-exclamation text-red"></i> CONFIRM ACTION</h3>
            <button type="button" class="modal-close-x">&times;</button>
          </div>
          <div class="modal-body">
            <p id="pit-confirm-message"></p>
            <div id="pit-confirm-target" class="font-mono text-cyan" style="margin: 8px 0; font-size: 0.9rem;"></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary modal-cancel-btn">CANCEL</button>
            <button type="button" class="btn btn-danger modal-confirm-btn"><i class="fa-solid fa-trash"></i> CONFIRM</button>
          </div>
        </div>
      `;
      document.body.appendChild(modalEl);
    }

    const msgEl = modalEl.querySelector('#pit-confirm-message');
    const targetEl = modalEl.querySelector('#pit-confirm-target');
    const cancelBtn = modalEl.querySelector('.modal-cancel-btn');
    const closeXBtn = modalEl.querySelector('.modal-close-x');
    const confirmBtn = modalEl.querySelector('.modal-confirm-btn');

    if (msgEl) msgEl.textContent = message;
    if (targetEl) targetEl.textContent = itemTitle;

    function closeModal() {
      modalEl.classList.remove('is-active');
      document.removeEventListener('keydown', handleKeydown);
    }

    function handleKeydown(e) {
      if (e.key === 'Escape') closeModal();
    }

    cancelBtn.onclick = closeModal;
    closeXBtn.onclick = closeModal;
    modalEl.onclick = (e) => {
      if (e.target === modalEl) closeModal();
    };

    confirmBtn.onclick = () => {
      closeModal();
      if (typeof onConfirm === 'function') onConfirm();
    };

    document.addEventListener('keydown', handleKeydown);
    modalEl.classList.add('is-active');
  }
}

/* --------------------------------------------------------------------------
   6. BUTTON LOADING SPINNER ON FORM SUBMISSION
   -------------------------------------------------------------------------- */
function initFormSubmitSpinners() {
  const forms = document.querySelectorAll('form:not([data-no-disable])');
  forms.forEach((form) => {
    form.addEventListener('submit', () => {
      if (!form.checkValidity || !form.checkValidity()) return;
      const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
      if (submitBtn) {
        submitBtn.classList.add('is-loading');
        submitBtn.setAttribute('disabled', 'disabled');
        setTimeout(() => {
          submitBtn.classList.remove('is-loading');
          submitBtn.removeAttribute('disabled');
        }, 12000);
      }
    });
  });
}

/* --------------------------------------------------------------------------
   7. MOBILE NAVIGATION TOGGLE
   -------------------------------------------------------------------------- */
function initMobileNavigation() {
  const toggleBtn = document.getElementById('mobile-nav-toggle');
  const navWrapper = document.getElementById('nav-menu-wrapper');

  if (toggleBtn && navWrapper) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = navWrapper.classList.toggle('is-open');
      toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      const icon = toggleBtn.querySelector('i');
      if (icon) {
        icon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
      }
    });

    navWrapper.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        navWrapper.classList.remove('is-open');
        const icon = toggleBtn.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-bars';
      });
    });
  }
}

/* --------------------------------------------------------------------------
   8. CAMERA CAPTURE / UPLOAD HANDLERS (CLEANED)
   Auto-injection of "Take Photo / Use Camera" buttons and file upload interception
   have been removed. Engineers select CAD files and engineering documents directly.
   -------------------------------------------------------------------------- */
function initCameraCapture() {
  // Disabled: Auto-injection and file upload interception removed.
  // Direct file selection enabled for all engineering uploads.
}

function openCameraModal() {}
function closeCameraModal() {}
function captureCameraSnapshot() {}
function openCameraSnapshot() {}

window.initCameraCapture = initCameraCapture;
window.openCameraModal = openCameraModal;
window.closeCameraModal = closeCameraModal;
window.captureCameraSnapshot = captureCameraSnapshot;
window.openCameraSnapshot = openCameraSnapshot;

/* --------------------------------------------------------------------------
   9. LIVE SEARCH TERM HIGHLIGHTING
   Interactively highlights search terms across cards, tables, titles, and
   names using <mark class="search-highlight"> without breaking DOM elements.
   -------------------------------------------------------------------------- */
function initSearchHighlighting() {
  // Inject highlighting styles if not already defined
  if (!document.getElementById('search-highlight-style')) {
    const style = document.createElement('style');
    style.id = 'search-highlight-style';
    style.textContent = `
      mark.search-highlight {
        background-color: rgba(227, 24, 55, 0.28);
        color: inherit;
        border-bottom: 2px solid var(--accent-red, #e31837);
        padding: 0 2px;
        border-radius: 2px;
        font-weight: 700;
      }
      [data-theme="dark"] mark.search-highlight,
      html[data-theme="dark"] mark.search-highlight {
        background-color: rgba(200, 255, 0, 0.28);
        border-bottom: 2px solid var(--accent-lime, #c8ff00);
      }
    `;
    document.head.appendChild(style);
  }

  const searchInputSelectors = [
    '#search-input',
    '#universal-search',
    '#garage-filter',
    'input[name="q"]',
    'input[name="search"]',
    '.search-input'
  ];

  const targetSelectors = [
    '.card',
    'table tbody tr',
    'table tr',
    '.car-card',
    '.car-title',
    '.member-name',
    '.search-results'
  ];

  function getTargetContainers() {
    const containers = [];
    targetSelectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        // Exclude inputs, navbars, and modals
        if (!el.closest('nav, .navbar, .modal-backdrop, #pit-permissions-modal, #camera-snapshot-modal, form')) {
          containers.push(el);
        }
      });
    });
    return Array.from(new Set(containers));
  }

  function unmark(root) {
    const marks = root.querySelectorAll('mark.search-highlight');
    marks.forEach((mark) => {
      const parent = mark.parentNode;
      if (parent) {
        while (mark.firstChild) {
          parent.insertBefore(mark.firstChild, mark);
        }
        parent.removeChild(mark);
        parent.normalize();
      }
    });
  }

  function markTextNode(textNode, regex) {
    const text = textNode.nodeValue;
    if (!text || !regex.test(text)) return;
    regex.lastIndex = 0;

    const fragment = document.createDocumentFragment();
    let lastIdx = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        fragment.appendChild(document.createTextNode(text.substring(lastIdx, match.index)));
      }
      const mark = document.createElement('mark');
      mark.className = 'search-highlight';
      mark.textContent = match[0];
      fragment.appendChild(mark);
      lastIdx = regex.lastIndex;
    }

    if (lastIdx < text.length) {
      fragment.appendChild(document.createTextNode(text.substring(lastIdx)));
    }

    if (textNode.parentNode) {
      textNode.parentNode.replaceChild(fragment, textNode);
    }
  }

  function highlightInElement(root, regex) {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (!node.nodeValue || !node.nodeValue.trim()) {
            return NodeFilter.FILTER_REJECT;
          }
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName.toUpperCase();
          if (['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'SVG', 'I', 'MARK'].includes(tag)) {
            return NodeFilter.FILTER_REJECT;
          }
          if (parent.closest('mark.search-highlight, .btn, .badge, script, style')) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const nodesToHighlight = [];
    while (walker.nextNode()) {
      nodesToHighlight.push(walker.currentNode);
    }

    nodesToHighlight.forEach((node) => {
      markTextNode(node, regex);
    });
  }

  function applyHighlighting(query) {
    const targets = getTargetContainers();
    targets.forEach((el) => unmark(el));

    const trimmed = (query || '').trim();
    if (trimmed.length === 0) return;

    const words = trimmed.split(/\s+/).filter((w) => w.length > 0);
    if (words.length === 0) return;

    const pattern = '(' + words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')';
    const regex = new RegExp(pattern, 'gi');

    targets.forEach((el) => {
      highlightInElement(el, regex);
    });
  }

  let debounceTimer = null;
  function handleInput(e) {
    const val = e.target.value;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      applyHighlighting(val);
    }, 150);
  }

  // Attach live input listeners
  searchInputSelectors.forEach((sel) => {
    document.querySelectorAll(sel).forEach((input) => {
      input.addEventListener('input', handleInput);
      input.addEventListener('change', handleInput);
    });
  });

  // Highlight initial search query on page load (e.g. on search results page)
  let initialQuery = '';
  for (const sel of searchInputSelectors) {
    const input = document.querySelector(sel);
    if (input && input.value && input.value.trim()) {
      initialQuery = input.value.trim();
      break;
    }
  }

  if (!initialQuery && window.location.search) {
    const params = new URLSearchParams(window.location.search);
    initialQuery = params.get('q') || params.get('search') || '';
  }

  if (initialQuery) {
    setTimeout(() => {
      applyHighlighting(initialQuery);
    }, 100);
  }
}

window.initSearchHighlighting = initSearchHighlighting;

/* --------------------------------------------------------------------------
   10. LOCKDOWN & AUDIO REMOVAL / SAFE FALLBACK STUBS
   Ensures app is never locked or closed on startup.
   Harmless no-op stubs prevent console errors if legacy buttons are clicked.
   -------------------------------------------------------------------------- */
function dismissLockdownGatekeeper() {
  const modal = document.getElementById('pit-permissions-modal');
  if (modal) modal.style.display = 'none';

  const lockdownOverlay = document.getElementById('pit-lockdown-overlay');
  if (lockdownOverlay) lockdownOverlay.style.display = 'none';
}

window.startEngineRev = function() {};
window.stopEngineRev = function() {};
window.playEngineSound = function() {};
window.closeTerminalWindow = function() {};
window.restartPermissionFlow = function() {};

/* --------------------------------------------------------------------------
   11. REAL-TIME NETWORK MONITOR & OFFLINE TASK ASSIGNMENT GUARD
   Listens to online/offline network events. Intercepts task assignments
   and submissions when disconnected from the internet, prevents submission,
   shakes the action button, and triggers the '#network-status-toast'.
   -------------------------------------------------------------------------- */
function initNetworkStatusMonitor() {
  const toast = document.getElementById('network-status-toast');
  const dot = document.getElementById('network-status-dot');
  const icon = document.getElementById('network-status-icon');
  const msgEl = document.getElementById('network-status-message');
  const closeBtn = document.getElementById('network-status-close');

  let autoDismissTimer = null;

  function showOfflineToast(message) {
    if (!toast) return;
    clearTimeout(autoDismissTimer);

    const defaultMsg = 'Internet disconnected';
    const rawMsg = message || defaultMsg;
    // Strip leading icon if passed in text to prevent duplicate icons
    const cleanMsg = rawMsg.replace(/^[⚠️!]\s*/, '');

    if (msgEl) msgEl.textContent = cleanMsg;
    if (icon) icon.textContent = '⚠️';
    if (dot) dot.style.display = 'inline-block';

    toast.classList.remove('is-online');
    toast.classList.add('is-offline', 'is-visible');
  }

  function showOnlineToast(message) {
    if (!toast) return;
    clearTimeout(autoDismissTimer);

    const defaultMsg = 'Internet reconnected';
    const rawMsg = message || defaultMsg;
    const cleanMsg = rawMsg.replace(/^[✓✔]\s*/, '');

    if (msgEl) msgEl.textContent = cleanMsg;
    if (icon) icon.textContent = '✓';

    toast.classList.remove('is-offline');
    toast.classList.add('is-online', 'is-visible');

    // Quick auto-dismiss for reconnection toast
    autoDismissTimer = setTimeout(() => {
      hideToast();
    }, 3500);
  }

  function hideToast() {
    if (!toast) return;
    clearTimeout(autoDismissTimer);
    toast.classList.remove('is-visible');
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      hideToast();
    });
  }

  // Network offline event listener
  window.addEventListener('offline', () => {
    showOfflineToast('Internet disconnected');
  });

  // Network online event listener
  window.addEventListener('online', () => {
    showOnlineToast('Internet reconnected');
  });

  // Check state on initial page load
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    showOfflineToast('Internet disconnected');
  }

  // Subtle button shake helper
  function triggerButtonShake(el) {
    if (!el) return;
    el.classList.remove('btn-shake', 'shake-btn');
    // Force DOM reflow to re-trigger CSS keyframes
    void el.offsetWidth;
    el.classList.add('btn-shake');
    setTimeout(() => {
      el.classList.remove('btn-shake');
    }, 600);
  }

  // Detect whether an element or form represents work assignment / task management
  function isTaskOrAssignmentTarget(element, form) {
    if (form) {
      const action = (form.getAttribute('action') || window.location.pathname || '').toLowerCase();
      if (action.includes('task') || action.includes('assign') || action.includes('member')) {
        return true;
      }
      if (form.querySelector('[name="assignee_id"], #assignee_id, [name="due_date"], #due_date, #task-form, .task-form')) {
        return true;
      }
    }
    if (element) {
      const href = (element.getAttribute('href') || '').toLowerCase();
      const txt = (element.textContent || '').trim().toLowerCase();
      const cls = (element.className || '').toLowerCase();
      if (href.includes('task') || href.includes('assign')) return true;
      if (txt.includes('assign') || txt.includes('task') || txt.includes('save task') || txt.includes('create new task')) {
        return true;
      }
      if (cls.includes('btn-assign') || cls.includes('btn-task')) return true;
    }
    return false;
  }

  // 1. Guard form submissions when offline
  document.addEventListener('submit', (e) => {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      e.preventDefault();
      e.stopImmediatePropagation();

      const form = e.target;
      const submitBtn = form ? (form.querySelector('button[type="submit"], input[type="submit"]') || e.submitter) : null;
      if (submitBtn) {
        triggerButtonShake(submitBtn);
      }

      const isAssignment = isTaskOrAssignmentTarget(submitBtn, form);
      const offlineNotice = isAssignment
        ? 'Internet disconnected. Please reconnect before assigning work.'
        : 'Internet disconnected. Please reconnect before submitting.';

      showOfflineToast(offlineNotice);
      return false;
    }
  }, true); // Capture phase ensures interception before any inline or bubbling handler

  // 2. Guard task assignment and creation click triggers (buttons, action links) when offline
  document.addEventListener('click', (e) => {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      const targetAction = e.target.closest('a[href*="task"], a[href*="assign"], button[type="submit"], button[data-action="assign"], .btn-primary, .btn-secondary');
      if (targetAction) {
        const isAssignment = isTaskOrAssignmentTarget(targetAction, targetAction.closest('form'));
        if (isAssignment) {
          e.preventDefault();
          e.stopImmediatePropagation();
          triggerButtonShake(targetAction);
          showOfflineToast('Internet disconnected. Please reconnect before assigning work.');
        }
      }
    }
  }, true);

  // Expose global interface for automated tests and pit-wall modules
  window.ForceRacingNetwork = {
    showOfflineToast,
    showOnlineToast,
    hideToast,
    triggerButtonShake,
    isTaskOrAssignmentTarget
  };
}

window.initNetworkStatusMonitor = initNetworkStatusMonitor;

/* --------------------------------------------------------------------------
   12. FORCE RACING LATENCY LOADER & ROTATING DOT CIRCULAR MOTION
   Displays the official Force Racing logo centered inside a circular
   orbit of 12 glowing red & gold animated dots with contextual status text.
   -------------------------------------------------------------------------- */
let frLoaderTimer = null;

window.showFRLoader = function(message) {
  const overlay = document.getElementById('fr-loading-overlay');
  if (!overlay) return;

  const statusEl = document.getElementById('fr-loader-status');
  if (statusEl && message) {
    statusEl.textContent = message;
  }

  overlay.classList.add('is-active');
  overlay.setAttribute('aria-busy', 'true');
  overlay.setAttribute('aria-hidden', 'false');

  // Failsafe auto-dismiss after 25s if network or server request hangs
  clearTimeout(frLoaderTimer);
  frLoaderTimer = setTimeout(() => {
    window.hideFRLoader();
  }, 25000);
};

window.hideFRLoader = function() {
  const overlay = document.getElementById('fr-loading-overlay');
  if (!overlay) return;

  overlay.classList.remove('is-active');
  overlay.setAttribute('aria-busy', 'false');
  overlay.setAttribute('aria-hidden', 'true');
  clearTimeout(frLoaderTimer);
};

function initFRLatencyLoader() {
  // Ensure loader is cleanly dismissed if restored from bfcache or back navigation
  window.addEventListener('pageshow', () => {
    window.hideFRLoader();
  });

  // 1. Intercept Form Submissions (Login, Signup, Work Order Assignment, CAD Transmission)
  document.addEventListener('submit', (e) => {
    // If disconnected from internet, allow offline guard to handle alert
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return;
    }

    const form = e.target;
    if (!form || !(form instanceof HTMLFormElement)) return;

    // Do not trigger loader if HTML5 native validation fails
    if (form.checkValidity && !form.checkValidity()) {
      return;
    }

    const action = (form.getAttribute('action') || window.location.pathname || '').toLowerCase();
    const formId = (form.id || '').toLowerCase();
    const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]') || e.submitter;
    const submitText = submitBtn ? (submitBtn.innerText || submitBtn.textContent || submitBtn.value || '').trim() : '';

    let message = 'Synchronizing Pit Telemetry...';

    // Contextual detection of latency operations
    if (
      action.includes('login') ||
      formId.includes('login') ||
      form.querySelector('#login-btn') ||
      (form.querySelector('input[name="password"]') && form.querySelector('input[name="username"]') && !form.querySelector('input[name="confirm_password"]'))
    ) {
      message = 'Authorizing Pit Wall Access...';
    } else if (
      action.includes('signup') ||
      action.includes('register') ||
      formId.includes('signup') ||
      form.querySelector('#signup-submit-btn') ||
      form.querySelector('input[name="confirm_password"]')
    ) {
      message = 'Enrolling Crew Engineer...';
    } else if (
      action.includes('tasks/new') ||
      action.includes('tasks/create') ||
      form.querySelector('#assignee_id') ||
      /assign|deploy/i.test(submitText)
    ) {
      message = 'Assigning Work Order...';
    } else if (
      action.includes('tasks') && action.includes('edit')
    ) {
      message = 'Updating Task Telemetry...';
    } else if (
      action.includes('cad') ||
      form.querySelector('#cad_file') ||
      form.querySelector('input[type="file"][name*="cad"]') ||
      /transmit/i.test(submitText)
    ) {
      message = 'Transmitting CAD Telemetry...';
    } else if (form.getAttribute('data-loading-msg')) {
      message = form.getAttribute('data-loading-msg');
    } else if (/save/i.test(submitText)) {
      message = 'Saving Engineering Telemetry...';
    }

    window.showFRLoader(message);
  });

  // 2. Intercept Direct Clicks on Action Links / Navigation Triggers
  document.addEventListener('click', (e) => {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return;
    }

    const target = e.target.closest('a, button');
    if (!target) return;

    // Submit buttons inside forms are managed by the form submit handler
    if (target.type === 'submit' || target.closest('button[type="submit"]') || target.closest('input[type="submit"]')) {
      return;
    }

    const text = (target.innerText || target.textContent || '').trim().toLowerCase();
    const href = target.getAttribute('href') || '';
    const id = (target.id || '').toLowerCase();

    // Check for explicit "Sign In", "Sign Up", "Assign Task", "Transmit CAD"
    if (id === 'login-btn' || text.includes('sign in') || text.includes('initialize pit session')) {
      if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
        window.showFRLoader('Authorizing Pit Wall Access...');
      }
    } else if (id === 'signup-submit-btn' || text.includes('sign up') || text.includes('join pit crew') || text.includes('complete crew enrollment')) {
      if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
        window.showFRLoader('Enrolling Crew Engineer...');
      }
    } else if (text.includes('assign task') || text.includes('assign new task') || text.includes('create new task') || text.includes('assign first task')) {
      if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
        window.showFRLoader('Assigning Work Order...');
      }
    } else if (text.includes('transmit cad') || text.includes('transmit to department')) {
      if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
        window.showFRLoader('Transmitting CAD Telemetry...');
      }
    } else if (target.hasAttribute('data-fr-loader')) {
      const customMsg = target.getAttribute('data-fr-loader') || 'Synchronizing Pit Telemetry...';
      window.showFRLoader(customMsg);
    }
  });
}

window.initFRLatencyLoader = initFRLatencyLoader;

/* --------------------------------------------------------------------------
   12. CIRCULAR PULL-TO-REFRESH & QUICK REFRESH ENGINE
   High-performance gesture and button refresh across Desktop & Mobile
   -------------------------------------------------------------------------- */
function initPullToRefresh() {
  const indicator = document.getElementById('ptr-indicator');
  const track = document.getElementById('ptr-track');
  const ringFill = document.getElementById('ptr-ring-fill');
  const centerIcon = document.getElementById('ptr-center-icon');
  const statusLabel = document.getElementById('ptr-status-label');
  const quickRefreshBtn = document.getElementById('btn-quick-refresh');

  if (!indicator || !track) return;

  const CIRCUMFERENCE = 113.1; // 2 * pi * 18
  const TRIGGER_THRESHOLD = 75; // px to trigger refresh
  const MAX_PULL = 135; // maximum visual pull travel
  const DAMPING = 0.45; // elastic resistance

  let isRefreshing = false;
  let isPulling = false;
  let startY = 0;
  let startX = 0;
  let currentPull = 0;

  // Desktop mouse drag tracking
  let isMouseDown = false;
  let mouseStartY = 0;

  // Desktop/Laptop wheel overscroll tracking
  let wheelPull = 0;
  let wheelTimer = null;

  function updateVisual(dist) {
    if (dist <= 0) {
      track.style.transform = '';
      track.style.opacity = '0';
      indicator.classList.remove('ptr-pulling', 'ptr-ready');
      if (ringFill) ringFill.style.strokeDashoffset = CIRCUMFERENCE;
      if (centerIcon) centerIcon.style.transform = '';
      return;
    }

    const visualY = Math.min(dist, MAX_PULL);
    const progress = Math.min(1, visualY / TRIGGER_THRESHOLD);

    // Smooth entry from top (-80px hidden offset down towards +22px)
    const translateY = -80 + (visualY * 1.15);
    track.style.transform = `translateY(${translateY}px)`;
    track.style.opacity = Math.min(1, visualY / 25).toString();

    // Circular SVG ring progress
    if (ringFill) {
      const offset = CIRCUMFERENCE * (1 - progress);
      ringFill.style.strokeDashoffset = offset.toFixed(1);
    }

    // Circular icon rotation with pull depth
    if (centerIcon) {
      centerIcon.style.transform = `rotate(${Math.round(progress * 360)}deg)`;
    }

    // Threshold indicator state
    if (visualY >= TRIGGER_THRESHOLD) {
      indicator.classList.add('ptr-ready');
      if (statusLabel) statusLabel.textContent = 'Release to refresh';
    } else {
      indicator.classList.remove('ptr-ready');
      if (statusLabel) statusLabel.textContent = 'Pull to refresh';
    }
  }

  function resetPull() {
    indicator.classList.remove('ptr-pulling', 'ptr-ready');
    track.style.transform = '';
    track.style.opacity = '';
    if (ringFill) ringFill.style.strokeDashoffset = CIRCUMFERENCE;
    if (centerIcon) centerIcon.style.transform = '';
    if (statusLabel) statusLabel.textContent = 'Pull to refresh';
    currentPull = 0;
    wheelPull = 0;
  }

  function triggerRefresh() {
    if (isRefreshing) return;
    isRefreshing = true;

    indicator.classList.remove('ptr-pulling', 'ptr-ready');
    indicator.classList.add('ptr-refreshing');
    if (statusLabel) statusLabel.textContent = 'Refreshing Operations...';

    if (quickRefreshBtn) {
      quickRefreshBtn.classList.add('refreshing');
    }

    // Dispatch global telemetry refresh event for dashboards/live widgets
    try {
      document.dispatchEvent(new CustomEvent('telemetry:refresh', {
        detail: { timestamp: Date.now() }
      }));
    } catch (e) {}

    // Fast asynchronous version/health ping to ensure cache freshness
    fetch('/api/app-version?t=' + Date.now(), { cache: 'no-store' })
      .catch(() => null);

    // Seamless instant refresh after high-speed spin feedback
    setTimeout(() => {
      if ('caches' in window) {
        // Clear runtime request caches if present
        caches.keys().then((names) => {
          return Promise.all(names.map((name) => caches.delete(name)));
        }).finally(() => {
          window.location.reload();
        });
      } else {
        window.location.reload();
      }
    }, 1000);
  }

  window.triggerQuickRefresh = triggerRefresh;

  // 1. Dedicated Top Navigation Circular Refresh Button
  if (quickRefreshBtn) {
    quickRefreshBtn.addEventListener('click', (e) => {
      e.preventDefault();
      triggerRefresh();
    });
  }

  // 2. Mobile Touch Pull-to-Refresh Gesture
  window.addEventListener('touchstart', (e) => {
    if (isRefreshing) return;
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    if (scrollY <= 2) {
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
      isPulling = false;
      currentPull = 0;
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (isRefreshing) return;
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    if (scrollY <= 2) {
      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const diffY = currentY - startY;
      const diffX = Math.abs(currentX - startX);

      if (diffY > 0 && diffY > diffX) {
        isPulling = true;
        indicator.classList.add('ptr-pulling');
        currentPull = diffY * DAMPING;
        updateVisual(currentPull);
        if (e.cancelable) {
          e.preventDefault();
        }
      } else if (diffY < 0 && isPulling) {
        resetPull();
        isPulling = false;
      }
    }
  }, { passive: false });

  const handleTouchEnd = () => {
    if (isPulling) {
      isPulling = false;
      if (currentPull >= TRIGGER_THRESHOLD) {
        triggerRefresh();
      } else {
        resetPull();
      }
    }
  };

  window.addEventListener('touchend', handleTouchEnd, { passive: true });
  window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

  // 3. Desktop / Laptop Mouse Click-and-Drag Pull Gesture
  window.addEventListener('mousedown', (e) => {
    if (isRefreshing) return;
    // Only primary (left) button
    if (e.button !== 0) return;
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    if (scrollY <= 2) {
      // Allow drag on navbar, header, or top section but ignore inputs/buttons/links
      const targetTag = e.target.tagName ? e.target.tagName.toLowerCase() : '';
      if (['input', 'textarea', 'select', 'button', 'a'].includes(targetTag) || e.target.closest('button, a, input, textarea, select')) {
        return;
      }
      isMouseDown = true;
      mouseStartY = e.clientY;
      currentPull = 0;
    }
  }, { passive: true });

  window.addEventListener('mousemove', (e) => {
    if (!isMouseDown || isRefreshing) return;
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    if (scrollY <= 2) {
      const diffY = e.clientY - mouseStartY;
      if (diffY > 10) {
        indicator.classList.add('ptr-pulling');
        currentPull = diffY * DAMPING;
        updateVisual(currentPull);
      }
    } else {
      isMouseDown = false;
      resetPull();
    }
  }, { passive: true });

  const handleMouseUp = () => {
    if (isMouseDown) {
      isMouseDown = false;
      if (currentPull >= TRIGGER_THRESHOLD) {
        triggerRefresh();
      } else {
        resetPull();
      }
    }
  };

  window.addEventListener('mouseup', handleMouseUp, { passive: true });

  // 4. Desktop / Laptop Trackpad & Wheel Overscroll Pull Gesture
  window.addEventListener('wheel', (e) => {
    if (isRefreshing) return;
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;

    // Upward scrolling at top of page (deltaY < 0 indicates scroll up / swipe down)
    if (scrollY <= 1 && e.deltaY < 0) {
      indicator.classList.add('ptr-pulling');
      wheelPull = Math.min(MAX_PULL + 10, wheelPull + Math.abs(e.deltaY) * 0.35);
      currentPull = wheelPull;
      updateVisual(currentPull);

      if (e.cancelable && currentPull > 15) {
        e.preventDefault();
      }

      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => {
        if (wheelPull >= TRIGGER_THRESHOLD) {
          triggerRefresh();
        } else {
          resetPull();
        }
        wheelPull = 0;
      }, 250);
    }
  }, { passive: false });

  // 5. Keyboard shortcut: Alt+R or Ctrl+Shift+R triggers quick refresh
  window.addEventListener('keydown', (e) => {
    if ((e.altKey && e.key.toLowerCase() === 'r') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'r')) {
      e.preventDefault();
      triggerRefresh();
    }
  });
}

window.initPullToRefresh = initPullToRefresh;

