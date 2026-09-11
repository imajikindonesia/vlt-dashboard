// Catch-all proxy: forwards /api/* requests to VPS Hermes API
// Solves mixed-content block (Vercel HTTPS → VPS HTTP)

export default async function handler(req, res) {
  // --- Config ---
  const VPS_BASE = process.env.VPS_BASE_URL || 'http://31.97.189.238:8099';
  const token = process.env.VLT_API_TOKEN;

  if (!token) {
    return res.status(500).json({
      error: 'VLT_API_TOKEN belum di-set di Vercel Environment Variables',
    });
  }

  // --- CORS (safe default) ---
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // --- Build target URL ---
  const segments = Array.isArray(req.query.path)
    ? req.query.path
    : [req.query.path].filter(Boolean);
  const apiPath = '/api/' + segments.join('/');

  const url = new URL(apiPath, VPS_BASE);

  // Forward query params (exclude Vercel's internal "path" param)
  Object.entries(req.query).forEach(([key, val]) => {
    if (key !== 'path') url.searchParams.set(key, val);
  });

  // --- Proxy request ---
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-API-Token': token, // fallback kalau VPS pakai header ini
  };

  const fetchOpts = { method: req.method, headers };

  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    fetchOpts.body = JSON.stringify(req.body);
  }

  try {
    const upstream = await fetch(url.toString(), fetchOpts);
    const ct = upstream.headers.get('content-type') || '';

    // Stream response back
    if (ct.includes('application/json')) {
      const data = await upstream.json();
      return res.status(upstream.status).json(data);
    }
    const text = await upstream.text();
    return res.status(upstream.status).send(text);
  } catch (err) {
    return res.status(502).json({
      error: 'VPS tidak bisa dihubungi',
      detail: err.message,
      hint: 'Cek apakah API di VPS masih jalan (nohup process)',
    });
  }
}
