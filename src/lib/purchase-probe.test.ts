import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizePurchaseForTest } from "./purchase-probe.ts";

test("AppMax approves and extracts buyer identity and purchased product", () => {
 const r = normalizePurchaseForTest("appmax", {
  event: "OrderApproved", data: { id: 1234, customer: { fullname: "Pessoa Teste", email: "PESSOA@EXAMPLE.COM" },
  products: [{ id: "curso-auto" }] }
 });
 assert.equal(r.transactionId, "1234");
 assert.equal(r.fullName, "Pessoa Teste");
 assert.equal(r.email, "pessoa@example.com");
 assert.deepEqual(r.productIds, ["curso-auto"]);
 assert.equal(r.completeApprovedEvent, true);
});

test("AppMax authorized with delay remains pending", () => {
 const r = normalizePurchaseForTest("appmax", {
  event: "OrderAuthorizedWithDelay", data: { id: 12,
  customer: { firstname: "Pessoa", lastname: "Exemplo", email: "pessoa@example.com" },
  products: [{ product_id: "moto" }] }
 });
 assert.equal(r.fullName, "Pessoa Exemplo");
 assert.equal(r.status, "pending");
 assert.equal(r.completeApprovedEvent, false);
});

test("Vega v2 extracts buyer name, email and products", () => {
 const r = normalizePurchaseForTest("vega", { transaction_token: "tx-1", status: "approved",
  customer: { name: "Pessoa Teste", email: "teste@example.com" },
  products: [{ code: "3MKJ1N" }] });
 assert.equal(r.completeApprovedEvent, true);
 assert.deepEqual(r.productIds, ["3MKJ1N"]);
});

test("Vega v1 supports plans", () => {
 const r = normalizePurchaseForTest("vega", { transaction_id: "v1", status: "approved",
  customer: { full_name: "Pessoa Teste", email: "teste@example.com" },
  plans: [{ products: [{ id: "3MNO7B" }] }] });
 assert.deepEqual(r.productIds, ["3MNO7B"]);
});

test("AppMax refund does not count as approved", () => {
 const r = normalizePurchaseForTest("appmax", { event: "OrderRefund", data: { id: 34,
 customer: { fullname: "Pessoa Teste", email: "teste@example.com" }, products: [{ id: 7 }] } });
 assert.equal(r.status, "refunded");
 assert.equal(r.completeApprovedEvent, false);
});

test("Missing fields never make the event complete", () => {
 const r = normalizePurchaseForTest("appmax", { event: "OrderPaid",
  data: { id: 98, customer: { email: "sem-arroba" }, products: [] } });
 assert.equal(r.completeApprovedEvent, false);
 assert.deepEqual(r.missing.sort(), ["full_name", "email", "products"].sort());
});
