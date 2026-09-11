const VPS = process.env.VPS_BASE_URL || 'http://31.97.189.238:8099';
const TOKEN = process.env.VLT_API_TOKEN || '';

export default async function handler(req, res) {
  if (!TOKEN) return res.status(500).json({ error: 'VLT_API_TOKEN not set' });
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const opts = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
        'X-API-Token': TOKEN
      }
    };
    if (req.method === 'POST' && req.body) {
      opts.body = JSON.stringify(req.body);
    }
    const r = await fetch(`${VPS}/api/gate`, opts);
    const data = await r.json();
    return res.status(r.status).json(data);
  } catch (e) {
    return res.status(502).json({ error: 'VPS unreachable', detail: e.message });
  }
}
