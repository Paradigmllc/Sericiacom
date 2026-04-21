/**
 * Module link: Product ↔ Shipping Profile
 *
 * In Medusa v2, the association between a product and its shipping profile
 * is expressed as a module link (not a column on the product table).
 *
 * Registering this file inside `src/links/` teaches the framework about
 * the (product.product_id ↔ fulfillment.shipping_profile_id) relationship
 * so that `createLinksWorkflow` / `remoteLink.create` can resolve it.
 *
 * Without this definition, the seed script fails with:
 *   "Module to type product and fulfillment by keys product_id
 *    and shipping_profile_id was not found."
 */
import ProductModule from "@medusajs/medusa/product";
import FulfillmentModule from "@medusajs/medusa/fulfillment";
import { defineLink } from "@medusajs/framework/utils";

export default defineLink(
  ProductModule.linkable.product,
  FulfillmentModule.linkable.shippingProfile
);
