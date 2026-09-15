export const VEGA_PRODUCT_GRANTS: Record<string, string[]> = {
  "3MKJ1N": ["course:auto", "materials:apostilas"],
  "3MNO78": ["course:auto", "materials:apostilas", "materials:imprimiveis", "course:ar"],
  "3MNO79": ["course:auto", "materials:apostilas", "materials:imprimiveis", "course:eletrica"],
  "3MNO7B": ["course:auto", "materials:apostilas", "materials:imprimiveis", "course:motos"],
  "3MOP51": ["course:auto", "materials:apostilas", "materials:imprimiveis", "course:som"],
};

const statuses: Record<string, string> = {
  paid: "approved",
  approved: "approved",
  completed: "approved",
  pending: "pending",
  waiting_payment: "pending",
  refused: "declined",
  declined: "declined",
  refunded: "refunded",
  refund: "refunded",
  chargeback: "chargeback",
  canceled: "cancelled",
  cancelled: "cancelled",
};

type UnknownRecord = Record<string, unknown>;
export type NormalizedVegaEvent = {
  transactionToken: string;
  status: string;
  customerEmail: string;
  customerName: string;
  sourceVersion: "v1" | "v2";
  eventOccurredAt: string;
  productCodes: string[];
  testMode: boolean;
};

const record = (value: unknown): UnknownRecord | null =>
  value !== null && typeof value === "object" && !Array.isArray(value) ? (value as UnknownRecord) : null;
const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

function productCode(value: unknown): string {
  if (typeof value === "string") return value.trim().toUpperCase();
  const item = record(value);
  return text(item?.["code"] ?? item?.["product_code"] ?? item?.["product_id"] ?? item?.["id"]).toUpperCase();
}

export function normalizeVegaPayload(payload: unknown): NormalizedVegaEvent {
  const root = record(payload);
  if (!root) throw new Error("Payload must be an object");
  const customer = record(root["customer"]);
  if (!customer) throw new Error("Customer is required");

  const transactionToken = text(root["transaction_token"] ?? root["transaction_id"] ?? root["token"]);
  const customerEmail = text(customer["email"]).toLowerCase();
  const customerName = text(customer["name"] ?? customer["full_name"]);
  const rawStatus = text(root["status"]).toLowerCase();
  const status = statuses[rawStatus];
  const rawDate = text(root["event_occurred_at"] ?? root["updated_at"] ?? root["created_at"] ?? root["event_date"]);
  const date = new Date(rawDate);
  if (!transactionToken) throw new Error("Transaction token is required");
  if (!customerEmail || !customerEmail.includes("@")) throw new Error("Customer email is invalid");
  if (!status) throw new Error("Status is unsupported");
  if (!rawDate || Number.isNaN(date.getTime())) throw new Error("Event date is invalid");

  const products = Array.isArray(root["products"]) ? root["products"] : [];
  const plans = Array.isArray(root["plans"]) ? root["plans"] : [];
  const productCodes = Array.from(new Set([...products, ...plans].map(productCode).filter(Boolean)));
  const sourceVersion: "v1" | "v2" = Array.isArray(root["products"]) ? "v2" : "v1";

  return {
    transactionToken,
    status,
    customerEmail,
    customerName,
    sourceVersion,
    eventOccurredAt: date.toISOString(),
    productCodes,
    testMode: root["test_mode"] === true || root["test"] === true,
  };
}
