import { makeHandler } from "./handler.ts";

const settings = {
  secret: "test-secret-with-at-least-thirty-two-characters",
  url: "https://example.invalid",
  serviceKey: "test-service-key",
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

Deno.test("rejects requests without the webhook secret", async () => {
  const handler = makeHandler(settings);
  const response = await handler(
    new Request("https://example.invalid/vega-test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ event: "purchase.approved" }),
    }),
  );

  assert(response.status === 401, "expected an unauthorized response");
});

Deno.test("stores a valid object payload without forwarding the secret", async () => {
  let storedRequest: RequestInit | undefined;
  const send = async (_input: RequestInfo | URL, init?: RequestInit) => {
    storedRequest = init;
    return new Response(null, { status: 201 });
  };
  const handler = makeHandler(settings, send);
  const response = await handler(
    new Request("https://example.invalid/vega-test", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-vega-test-secret": settings.secret,
      },
      body: JSON.stringify({ event: "purchase.approved", transaction_id: "fake-001" }),
    }),
  );

  assert(response.status === 200, "expected a successful response");
  assert(
    storedRequest?.body ===
      JSON.stringify({ payload: { event: "purchase.approved", transaction_id: "fake-001" } }),
    "expected the payload to be wrapped for storage",
  );
  assert(!storedRequest?.body?.toString().includes(settings.secret), "secret must not be stored");
});

Deno.test("rejects arrays and oversized bodies", async () => {
  const handler = makeHandler(settings);
  const arrayResponse = await handler(
    new Request("https://example.invalid/vega-test", {
      method: "POST",
      headers: { "content-type": "application/json", "x-vega-test-secret": settings.secret },
      body: "[]",
    }),
  );
  const oversizedResponse = await handler(
    new Request("https://example.invalid/vega-test", {
      method: "POST",
      headers: { "content-type": "application/json", "x-vega-test-secret": settings.secret },
      body: JSON.stringify({ value: "x".repeat(262145) }),
    }),
  );

  assert(arrayResponse.status === 400, "expected arrays to be rejected");
  assert(oversizedResponse.status === 413, "expected oversized bodies to be rejected");
});

Deno.test("persists a fictitious notification through the deployed webhook", async () => {
  const secret = Deno.env.get("VEGA_TEST_SECRET");
  const url = Deno.env.get("SUPABASE_URL");
  assert(secret && secret.length >= 32, "VEGA_TEST_SECRET must be configured");
  assert(url, "SUPABASE_URL must be configured");

  const response = await fetch(`${url.replace(/\/$/, "")}/functions/v1/vega-test`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-vega-test-secret": secret,
    },
    body: JSON.stringify({
      event: "purchase.approved",
      transaction_id: "vega-webhook-e2e-20260913",
      customer: { name: "Cliente Webhook Fictício" },
      products: [{ code: "curso-teste", status: "approved" }],
      test: true,
    }),
  });

  assert(response.status === 200, `expected 200, received ${response.status}`);
  const body = await response.json();
  assert(body.received === true, "expected the webhook to acknowledge receipt");
  assert(body.mode === "capture-only", "expected capture-only mode");
});
