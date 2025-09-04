import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { callId: string } }
) {
  const { callId } = params;
  
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
      return NextResponse.json(
        { error: text || `Upstream error (${resp.status})` },
        { status: resp.status }
      );
    }
    
    const data = await resp.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error getting call:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
