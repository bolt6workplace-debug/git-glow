function parseUserAgent(uaString) {
  const ua = (uaString || '').toLowerCase();
  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'Desktop';

  if (/edg\//.test(ua)) browser = 'Microsoft Edge';
  else if (/opr\/|opera/.test(ua)) browser = 'Opera';
  else if (/chrome|crios/.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/.test(ua)) browser = 'Firefox';
  else if (/safari/.test(ua) && !/chrome/.test(ua)) browser = 'Safari';

  if (/windows nt 10/.test(ua)) os = 'Windows 10/11';
  else if (/windows nt 6\.3/.test(ua)) os = 'Windows 8.1';
  else if (/windows nt 6\.1/.test(ua)) os = 'Windows 7';
  else if (/windows/.test(ua)) os = 'Windows';
  else if (/mac os x|iphone|ipad|macintosh/.test(ua)) os = 'macOS / iOS';
  else if (/android/.test(ua)) os = 'Android';
  else if (/linux/.test(ua)) os = 'Linux';

  if (/iphone/.test(ua)) device = 'iPhone';
  else if (/ipad/.test(ua)) device = 'iPad';
  else if (/android/.test(ua)) device = 'Android Phone';
  else if (/mobile/.test(ua)) device = 'Mobile Device';
  else if (/macintosh|windows|linux/.test(ua)) device = 'Desktop';

  return { browser, os, device };
}

function getIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return fwd.split(',')[0].trim();
  return req.socket?.remoteAddress || req.ip || '0.0.0.0';
}

module.exports = { parseUserAgent, getIp };
