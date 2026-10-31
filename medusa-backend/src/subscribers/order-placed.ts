import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";
import { sendEmail, templates, formatOrderTotal } from "../lib/resend";

export default async function orderPlacedHandler({ event, container }: SubscriberArgs<{ id: string }>) {
  if (process.env.SERICIA_ORDER_EMAILS_ENABLED !== "true") return;
  const orderModule = container.resolve(Modules.ORDER);
  const order = await orderModule.retrieveOrder(event.data.id, {
    relations: ["items", "shipping_address"],
  });
  const email = order?.email;
  if (!email) return;

  const title = order.items?.[0]?.title ?? "Sericia drop";
  const amount = formatOrderTotal(Number(order.total), order.currency_code);
  const name = order.shipping_address?.first_name ?? "there";

  const tpl = templates.orderConfirmation({ name, orderId: String(order.display_id ?? order.id), title, amount });
  await sendEmail({ to: email, ...tpl, idempotencyKey: `order-confirmation/${order.id}` });
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
