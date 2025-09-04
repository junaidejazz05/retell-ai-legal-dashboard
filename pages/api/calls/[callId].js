
// pages/api/calls/[callId].js
export default async function handler(req, res) {
  const { callId } = req.query;
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  try {
    const resp = await fetch(`https://api.retellai.com/v2/get-call/${encodeURIComponent(callId)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
      },
      cache: 'no-store',
    });
    if (!resp.ok) {
      const text = await resp.text();
      return res.status(resp.status).json({ error: text || `Upstream error (${resp.status})` });
    }
    const data = await resp.json();
    res.status(200).json(data);
  } catch (err) {
    console.error('Error getting call:', err);
    res.status(500).json({ error: 'Internal error' });
  }
}
