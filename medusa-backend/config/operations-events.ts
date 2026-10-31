import { createHmac } from "node:crypto";
export const operationsTopics = ["product.created", "product.updated", "product.deleted", "inventory-item.created", "inventory-item.updated", "inventory-item.deleted", "inventory-level.created", "inventory-level.updated", "inventory-level.deleted"];
export async function sendOperationsEvent(event: { name: string; data: unknown; metadata?: { created_at?: Date } }, env = process.env, send: typeof fetch = fetch) {
  const destination = env.SERICIA_OPERATIONS_EVENTS_URL, secret = env.SERICIA_MEDUSA_EVENT_SECRET;
  if (!destination && !secret) return;
  if (!destination || !secret || secret.length < 32) throw new Error("Operations event configuration incomplete");
  const url = new URL(destination);
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash || url.pathname !== "/api/medusa-ops/events") throw new Error("Invalid operations event destination");
  const data = event.data;
  if (!operationsTopics.includes(event.name) || !data || typeof data !== "object" || !("id" in data) || typeof data.id !== "string" || !/^[a-zA-Z0-9_-]{1,120}$/.test(data.id)) throw new Error("Invalid operations event");
  const created = event.metadata?.created_at;
  if (!(created instanceof Date) || !Number.isFinite(created.getTime())) throw new Error("Operations event timestamp missing");
  const body = JSON.stringify({ topic: event.name, entityId: data.id, occurredAt: created.toISOString() });
  const timestamp = String(Date.now());
  const signature = createHmac("sha256", secret).update(timestamp + "." + body).digest("hex");
  const response = await send(url, { method: "POST", redirect: "error", headers: { "Content-Type": "application/json", "x-sericia-timestamp": timestamp, "x-sericia-signature": signature }, body, signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`Operations event delivery failed (${response.status})`);
  const result: unknown = await response.json();
  if (!result || typeof result !== "object" || !("ok" in result) || result.ok !== true) throw new Error("Operations event acknowledgement invalid");
}
