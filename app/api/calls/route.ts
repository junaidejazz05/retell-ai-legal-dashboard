import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = searchParams.get('limit');
    const direction = searchParams.get('direction');
    const start_timestamp_from = searchParams.get('start_timestamp_from');
    const start_timestamp_to = searchParams.get('start_timestamp_to');
    const agent_id = searchParams.get('agent_id');

    const body: any = {};
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
      cache: 'no-store',
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json(
        { error: text || `Upstream error (${resp.status})` },
        { status: resp.status }
      );
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

    return NextResponse.json({ calls, next_cursor: next_cursor_norm });
  } catch (err) {
    console.error('Error listing calls:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
