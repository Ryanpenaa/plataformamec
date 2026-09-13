type Settings = { secret?: string; url?: string; serviceKey?: string };
const reply = (status: number, body: object) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

// Capture only. Receiving a notification is not proof of a paid purchase.
export function makeHandler(settings: Settings, send: typeof fetch = fetch) {
  return async (request: Request): Promise<Response> => {
    if (request.method !== 'POST') return reply(405, { error: 'POST required' });
    if (!settings.secret || settings.secret.length < 32 || !settings.url || !settings.serviceKey)
      return reply(503, { error: 'Test receiver not configured' });
    const supplied = request.headers.get('x-vega-test-secret') ?? new URL(request.url).searchParams.get('key') ?? '';
    if (supplied !== settings.secret) return reply(401, { error: 'Unauthorized' });
    if (!request.headers.get('content-type')?.toLowerCase().includes('application/json'))
      return reply(415, { error: 'JSON required' });
    const reader = request.body?.getReader();
    if (!reader) return reply(400, { error: 'Empty body' });
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 262144) { await reader.cancel(); return reply(413, { error: 'Body too large' }); }
        chunks.push(value);
      }
      const bytes = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      let payload;
      try { payload = JSON.parse(new TextDecoder().decode(bytes)); }
      catch { return reply(400, { error: 'Invalid JSON' }); }
      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return reply(400, { error: 'Object required' });
      // Do not copy request headers or the secret URL into storage or logs.
      const result = await send(`${settings.url.replace(/\/$/, '')}/rest/v1/vega_test_events`, {
        method: 'POST',
        headers: { apikey: settings.serviceKey, Authorization: `Bearer ${settings.serviceKey}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ payload }),
      });
      if (!result.ok) return reply(503, { error: 'Could not store notification; retry later' });
      return reply(200, { received: true, mode: 'capture-only' });
    } catch { return reply(503, { error: 'Receiver temporarily unavailable' }); }
  };
}
