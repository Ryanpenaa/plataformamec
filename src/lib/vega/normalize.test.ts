import { describe, expect, test } from "bun:test";
import { makeVegaAccessHandler } from "./handler";
import { normalizeVegaPayload, VEGA_PRODUCT_GRANTS } from "./normalize";

const base = {
  transaction_token: "tx-1",
  status: "approved",
  customer: { email: " ALUNO@Example.com ", name: "Aluno" },
  event_occurred_at: "2026-09-15T20:00:00Z",
};

describe("Vega product rules", () => {
  test("main product grants auto and apostilas regardless of price", () => {
    for (const price of [10, 18.9, 27.9]) {
      const event = normalizeVegaPayload({
        ...base,
        amount: price,
        products: [{ code: "3MKJ1N" }],
      });
      expect(event.productCodes).toEqual(["3MKJ1N"]);
      expect(VEGA_PRODUCT_GRANTS[event.productCodes[0] ?? ""]).toEqual([
        "course:auto",
        "materials:apostilas",
      ]);
    }
  });

  test("each bump grants only its extra course plus shared access", () => {
    const expected = {
      "3MNO78": "course:ar",
      "3MNO79": "course:eletrica",
      "3MNO7B": "course:motos",
      "3MOP51": "course:som",
    };
    for (const [code, course] of Object.entries(expected)) {
      const grants = VEGA_PRODUCT_GRANTS[code] ?? [];
      expect(grants).toContain("course:auto");
      expect(grants).toContain("materials:apostilas");
      expect(grants).toContain("materials:imprimiveis");
      expect(grants.filter((item) => item.startsWith("course:") && item !== "course:auto")).toEqual(
        [course],
      );
    }
  });

  test("deduplicates v1 plans and v2 products", () => {
    const event = normalizeVegaPayload({
      ...base,
      products: [{ code: "3MOP51" }],
      plans: [{ product_code: "3MOP51" }, "UNKNOWN"],
    });
    expect(event.productCodes).toEqual(["3MOP51", "UNKNOWN"]);
    expect(event.customerEmail).toBe("aluno@example.com");
  });

  test("unknown products grant nothing", () => {
    const event = normalizeVegaPayload({ ...base, products: [{ code: "UNKNOWN" }] });
    expect(event.productCodes).toEqual(["UNKNOWN"]);
    expect(VEGA_PRODUCT_GRANTS["UNKNOWN"]).toBeUndefined();
  });

  test("accepts documented v1 plans", () => {
    const event = normalizeVegaPayload({
      transaction_id: "legacy-1",
      status: "paid",
      customer: { email: "legacy@example.com", full_name: "Aluno Legado" },
      event_date: "2026-09-15T18:00:00Z",
      plans: [{ product_id: "3MNO7B" }],
    });
    expect(event.sourceVersion).toBe("v1");
    expect(event.status).toBe("approved");
    expect(event.productCodes).toEqual(["3MNO7B"]);
  });
});

describe("Vega access endpoint", () => {
  const secret = "test-secret-with-at-least-thirty-two-characters";
  const request = (body: object, supplied = secret) =>
    new Request("https://example.invalid/api/public/vega-access", {
      method: "POST",
      headers: { "content-type": "application/json", "x-vega-test-secret": supplied },
      body: JSON.stringify(body),
    });

  test("rejects missing authentication", async () => {
    const handler = makeVegaAccessHandler({ secret, enabled: true, process: async () => ({}) });
    expect((await handler(request({ ...base, products: [] }, ""))).status).toBe(401);
  });

  test("test mode never reaches processing", async () => {
    let calls = 0;
    const handler = makeVegaAccessHandler({
      secret,
      enabled: true,
      process: async () => {
        calls += 1;
      },
    });
    const result = await handler(
      request({ ...base, test_mode: true, products: [{ code: "3MKJ1N" }] }),
    );
    expect(result.status).toBe(200);
    expect(calls).toBe(0);
    expect((await result.json()).reason).toBe("test_mode");
  });

  test("disabled mode validates but never processes", async () => {
    let calls = 0;
    const handler = makeVegaAccessHandler({
      secret,
      enabled: false,
      process: async () => {
        calls += 1;
      },
    });
    const result = await handler(request({ ...base, products: [{ code: "3MKJ1N" }] }));
    expect(result.status).toBe(202);
    expect(calls).toBe(0);
  });
});
