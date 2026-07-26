async function lookupGeo(ip) {
  if (!ip || ip === '0.0.0.0' || ip.startsWith('127.') || ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.')) {
    return { city: 'Local', region: 'Local', country: 'Local', lat: null, lng: null, timezone: null, isp: null };
  }
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,lat,lon,timezone,isp`, {
      signal: AbortSignal.timeout(4000),
    });
    const data = await res.json();
    if (data.status !== 'success') return { city: 'Unknown', region: 'Unknown', country: 'Unknown', lat: null, lng: null, timezone: null, isp: null };
    return {
      city: data.city || 'Unknown',
      region: data.regionName || 'Unknown',
      country: data.country || 'Unknown',
      lat: data.lat ?? null,
      lng: data.lon ?? null,
      timezone: data.timezone || null,
      isp: data.isp || null,
    };
  } catch {
    return { city: 'Unknown', region: 'Unknown', country: 'Unknown', lat: null, lng: null, timezone: null, isp: null };
  }
}

module.exports = { lookupGeo };
