import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";
import { sendEmail, templates } from "../lib/resend";

export default async function orderPlacedHandler({ event, container }: SubscriberArgs<{ id: string }>) {
  const orderModule = container.resolve(Modules.ORDER);
  const order: any = await orderModule.retrieveOrder(event.data.id, {
    relations: ["items", "shipping_address"],
  });
  const email = order?.email;
  if (!email) return;

  const title = order.items?.[0]?.title ?? "Sericia drop";
  const amount = `${order.currency_code?.toUpperCase()} ${(order.total / 100).toFixed(2)}`;
  const name = order.shipping_address?.first_name ?? "there";

  const tpl = templates.orderConfirmation({ name, orderId: order.display_id ?? order.id, title, amount });
  await sendEmail({ to: email, ...tpl });
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
