
// pages/api/calls.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  try {
    const resp = await fetch('https://api.retellai.com/v2/list-calls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
      },
      body: JSON.stringify({}), // add filters if needed
    });
    if (!resp.ok) {
      const text = await resp.text();
      return res.status(resp.status).send(text);
    }
    const data = await resp.json();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
}
