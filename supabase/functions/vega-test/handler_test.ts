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
