import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { operationsTopics, sendOperationsEvent } from "../../config/operations-events";
export default async function operationsChanged({ event }: SubscriberArgs) {
  try { await sendOperationsEvent(event); }
  catch { console.error("[sericia-operations] change delivery failed; retained event will be retried"); throw new Error("Operations change delivery failed"); }
}
export const config: SubscriberConfig = { event: operationsTopics, context: { subscriberId: "sericia-operations-changes" } };
