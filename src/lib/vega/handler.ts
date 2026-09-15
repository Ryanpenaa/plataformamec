import { createHash, timingSafeEqual } from "node:crypto";
import { normalizeVegaPayload, type NormalizedVegaEvent } from "./normalize";

type ProcessEvent = (event: NormalizedVegaEvent, payloadHash: string) => Promise<unknown>;
type Settings = { secret?: string; enabled: boolean; process: ProcessEvent };
const response = (status: number, body: object) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

function secureEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
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
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 262144)
      return response(413, { error: "Body too large" });

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
    const result = await settings.process(event, payloadHash);
    return response(200, { received: true, result });
  };
}
