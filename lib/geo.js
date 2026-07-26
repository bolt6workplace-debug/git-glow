async function lookupGeo(ip) {
  if (!ip || ip === '0.0.0.0' || ip.startsWith('127.') || ip.startsWith('10.') || ip.startsWith('192.168.')) {
    return { city: 'Local', region: 'Local', country: 'Local' };
  }
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city`, {
      signal: AbortSignal.timeout(4000),
    });
    const data = await res.json();
    if (data.status !== 'success') return { city: 'Unknown', region: 'Unknown', country: 'Unknown' };
    return {
      city: data.city || 'Unknown',
      region: data.regionName || 'Unknown',
      country: data.country || 'Unknown',
    };
  } catch {
    return { city: 'Unknown', region: 'Unknown', country: 'Unknown' };
  }
}

module.exports = { lookupGeo };
