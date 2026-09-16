import { createHash, timingSafeEqual } from "node:crypto";
import { normalizeVegaPayload, type NormalizedVegaEvent } from "./normalize";

type ProcessEvent = (event: NormalizedVegaEvent, payloadHash: string) => Promise<unknown>;
type Settings = { secret?: string; enabled: boolean; process: ProcessEvent };
const MAX_BODY_BYTES = 262144;
const response = (status: number, body: object) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

function secureEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function readLimitedBody(request: Request): Promise<string | null> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) return null;
  if (!request.body) return "";

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > MAX_BODY_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(body);
}

export function makeVegaAccessHandler(settings: Settings) {
  return async (request: Request) => {
    if (request.method !== "POST") return response(405, { error: "POST required" });
    if (!settings.secret || settings.secret.length < 32)
      return response(503, { error: "Receiver not configured" });
    const supplied =
      request.headers.get("x-vega-test-secret") ??
      new URL(request.url).searchParams.get("key") ??
      "";
    if (!secureEqual(supplied, settings.secret)) return response(401, { error: "Unauthorized" });
    if (!request.headers.get("content-type")?.toLowerCase().includes("application/json"))
      return response(415, { error: "JSON required" });
    const raw = await readLimitedBody(request);
    if (raw === null) return response(413, { error: "Body too large" });

    let payload: unknown;
    try {
      payload = JSON.parse(raw);
    } catch {
      return response(400, { error: "Invalid JSON" });
    }
    let event: NormalizedVegaEvent;
    try {
      event = normalizeVegaPayload(payload);
    } catch (error) {
      return response(400, { error: error instanceof Error ? error.message : "Invalid payload" });
    }
    if (event.testMode)
      return response(200, { received: true, processed: false, reason: "test_mode" });
    if (!settings.enabled)
      return response(202, { received: true, processed: false, reason: "disabled" });

    const payloadHash = createHash("sha256").update(raw).digest("hex");
    try {
      const result = await settings.process(event, payloadHash);
      return response(200, { received: true, result });
    } catch {
      return response(503, { error: "Service unavailable" });
    }
  };
}
