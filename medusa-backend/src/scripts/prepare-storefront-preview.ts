import type { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createApiKeysWorkflow, createRegionsWorkflow, createSalesChannelsWorkflow, linkSalesChannelsToApiKeyWorkflow } from "@medusajs/medusa/core-flows";

// No countries, payment providers, stock, or product publication are inferred here.
export default async function prepareStorefrontPreview({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const channels = await container.resolve(Modules.SALES_CHANNEL).listSalesChannels({ name: "Sericia preview" });
  const regions = await container.resolve(Modules.REGION).listRegions({ name: "Sericia preview JPY" }, { relations: ["countries"] });
  const { data: keys } = await query.graph({ entity: "api_key", fields: ["id", "revoked_at", "sales_channels.id"], filters: { title: "Sericia preview", type: "publishable" } });
  if (channels.length > 1 || regions.length > 1 || keys.length > 1) throw new Error("Duplicate preview configuration; resolve in Admin before retrying");
  if (regions[0] && (regions[0].currency_code !== "jpy" || regions[0].countries?.length)) throw new Error("Preview region has changed; refusing to overwrite");
  if (keys[0]?.revoked_at) throw new Error("Preview API key was revoked; refusing to recreate access");
  if (channels[0]?.is_disabled) throw new Error("Preview channel was disabled; refusing to enable access");
  if (keys[0]?.sales_channels?.some(channel => channel?.id !== channels[0]?.id)) throw new Error("Preview key has unexpected channel access");
  if (process.env.SERICIA_PREVIEW_APPLY !== "true") {
    logger.info(`Preview plan: channel=${channels.length}, region=${regions.length}, key=${keys.length}; set SERICIA_PREVIEW_APPLY=true to create missing configuration`);
    return;
  }
  const channel = channels[0] ?? (await createSalesChannelsWorkflow(container).run({ input: { salesChannelsData: [{ name: "Sericia preview", description: "Unpublished migration preview" }] } })).result[0];
  const region = regions[0] ?? (await createRegionsWorkflow(container).run({ input: { regions: [{
    name: "Sericia preview JPY", currency_code: "jpy", countries: [], payment_providers: [], automatic_taxes: false, metadata: { slug: "preview", launch_ready: false },
  }] } })).result[0];
  const key = keys[0] ?? (await createApiKeysWorkflow(container).run({ input: { api_keys: [{ title: "Sericia preview", type: "publishable", created_by: "sericia-migration" }] } })).result[0];
  if (!keys[0]?.sales_channels?.some(item => item?.id === channel.id)) {
    await linkSalesChannelsToApiKeyWorkflow(container).run({ input: { id: key.id, add: [channel.id] } });
  }
  logger.info(`Preview ready: channel=${channel.id}, region=${region.id}; retrieve publishable key from Admin. No products published or stock allocated.`);
}
