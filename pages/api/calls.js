
// pages/api/calls.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const {
      cursor,
      limit,
      direction,
      start_timestamp_from,
      start_timestamp_to,
      agent_id,
    } = req.query;

    const body = {};
    if (cursor) body.cursor = cursor;
    if (limit) body.limit = Number(limit);
    if (direction) body.direction = direction;
    if (start_timestamp_from) body.start_timestamp_from = Number(start_timestamp_from);
    if (start_timestamp_to) body.start_timestamp_to = Number(start_timestamp_to);
    if (agent_id) body.agent_id = agent_id;

    const resp = await fetch('https://api.retellai.com/v2/list-calls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
      },
      body: JSON.stringify(body),
      // avoid any caching on serverless platforms
      cache: 'no-store',
    });

    if (!resp.ok) {
      const text = await resp.text();
      // bubble up Retell error with status
      return res.status(resp.status).json({ error: text || `Upstream error (${resp.status})` });
    }

    const data = await resp.json();

    // Normalize response to { calls, next_cursor }
    let calls = [];
    if (Array.isArray(data)) {
      calls = data;
    } else if (Array.isArray(data?.calls)) {
      calls = data.calls;
    } else if (Array.isArray(data?.data)) {
      calls = data.data;
    } else if (Array.isArray(data?.items)) {
      calls = data.items;
    }

    const next_cursor_norm = data?.next_cursor || data?.cursor || null;

    res.status(200).json({ calls, next_cursor: next_cursor_norm });
  } catch (err) {
    console.error('Error listing calls:', err);
    res.status(500).json({ error: 'Internal error' });
  }
}
