/** Normalizador de testes: não grava, autentica, cria contas ou concede acesso. */
export type Provider = "vega" | "appmax";
export type Status = "approved" | "pending" | "refunded" | "rejected" | "unknown";
type Obj = Record<string, unknown>;
const obj = (x: unknown): Obj => x && typeof x === "object" && !Array.isArray(x) ? x as Obj : {};
const str = (x: unknown): string => typeof x === "string" ? x.trim() : typeof x === "number" && Number.isFinite(x) ? String(x) : "";
const first = (...xs: unknown[]): string => xs.map(str).find(Boolean) ?? "";
const arr = (x: unknown): unknown[] => Array.isArray(x) ? x : [];
export interface PurchaseProbe {
  provider: Provider;
  transactionId: string;
  fullName: string;
  email: string;
  productIds: string[];
  status: Status;
  missing: string[];
  completeApprovedEvent: boolean;
}
function statusOf(provider: Provider, root: Obj, purchase: Obj): Status {
  const raw = (provider === "appmax" ? first(root["event"], purchase["status"]) : str(root["status"])).toLowerCase();
  if (provider === "appmax") {
    if (["orderpaid", "orderapproved"].includes(raw)) return "approved";
    if (["orderrefund", "orderrefunded", "orderchargeback"].includes(raw)) return "refunded";
    if (["orderauthorizedwithdelay", "ordercreated", "orderpending"].includes(raw)) return "pending";
    return "unknown";
  }
  if (raw === "approved") return "approved";
  if (["pending", "waiting_payment", "in_process"].includes(raw)) return "pending";
  if (["refunded", "refund", "chargeback", "charge_back"].includes(raw)) return "refunded";
  if (["refused", "declined", "in_dispute", "expired", "canceled", "cancelled"].includes(raw)) return "rejected";
  return "unknown";
}
export function normalizePurchaseForTest(provider: Provider, payload: unknown): PurchaseProbe {
  const root = obj(payload);
  const purchase = provider === "appmax" ? obj(root["data"]) : root;
  const customer = obj(purchase["customer"]);
  const fullName = provider === "appmax"
    ? first(customer["fullname"], customer["full_name"],
        [str(customer["firstname"]), str(customer["lastname"])].filter(Boolean).join(" "))
    : first(customer["name"], customer["full_name"]);
  const email = str(customer["email"]).toLowerCase();
  const transactionId = provider === "appmax"
    ? first(purchase["id"], purchase["order_id"])
    : first(root["transaction_token"], root["transaction_id"], root["token"]);
  const products = provider === "appmax" ? arr(purchase["products"])
    : Array.isArray(root["products"]) ? arr(root["products"])
    : arr(root["plans"]).flatMap(plan => arr(obj(plan)["products"]));
  const productIds = Array.from(new Set(products.map(item => {
    const p = obj(item);
    return first(p["code"], p["product_code"], p["product_id"], p["id"], p["sku"]);
  }).filter(Boolean)));
  const status = statusOf(provider, root, purchase);
  const missing: string[] = [];
  if (!transactionId) missing.push("transaction_id");
  if (!fullName) missing.push("full_name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) missing.push("email");
  if (productIds.length === 0) missing.push("products");
  if (status === "unknown") missing.push("status");
  return { provider, transactionId, fullName, email, productIds, status, missing,
    completeApprovedEvent: status === "approved" && missing.length === 0 };
}
