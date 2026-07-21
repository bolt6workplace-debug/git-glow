(function () {
  const cd = document.getElementById('countdown');
  if (!cd) return;

  const targetStr = cd.getAttribute('data-target');
  const target = new Date(targetStr).getTime();
  if (isNaN(target)) return;

  const moEl = document.getElementById('cd-mo');
  const dEl  = document.getElementById('cd-days');
  const hEl  = document.getElementById('cd-hours');
  const mEl  = document.getElementById('cd-mins');
  const sEl  = document.getElementById('cd-secs');

  const pad = (n) => String(Math.max(0, n)).padStart(2, '0');

  function tick() {
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      moEl.textContent = '0';
      dEl.textContent  = '0';
      hEl.textContent  = '0';
      mEl.textContent  = '0';
      sEl.textContent  = '00';
      return;
    }

    const totalSecs = Math.floor(diff / 1000);
    const months = Math.floor(totalSecs / 2592000);  // 30-day months
    const remAfterMo = totalSecs - months * 2592000;
    const days  = Math.floor(remAfterMo / 86400);
    const hours = Math.floor((remAfterMo % 86400) / 3600);
    const mins  = Math.floor((remAfterMo % 3600) / 60);
    const secs  = remAfterMo % 60;

    moEl.textContent = months;
    dEl.textContent  = days;
    hEl.textContent  = hours;
    mEl.textContent  = mins;
    sEl.textContent  = pad(secs);
  }

  tick();
  setInterval(tick, 1000);
})();
