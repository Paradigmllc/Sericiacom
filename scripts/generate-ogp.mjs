#!/usr/bin/env node
/**
 * OGP Image Generator: spin up Vast.ai ComfyUI, generate 64 country×product OGP images,
 * upload to Supabase Storage, write URLs back to sericia_pseo.ogp_url, stop instance.
 *
 * Flow: rent → wait ready → loop 64 prompts via ComfyUI API → upload → update DB → destroy.
 * Cost: ~$0.50 for full batch on RTX 4090 (~45min runtime).
 */
import { createClient } from "@supabase/supabase-js";
import { COUNTRIES, PRODUCTS } from "../storefront/lib/pseo-matrix.ts";

const VAST_KEY = process.env.VASTAI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function rentInstance() {
  const searchRes = await fetch("https://console.vast.ai/api/v0/bundles/?q=" + encodeURIComponent(JSON.stringify({
    gpu_name: "RTX 4090",
    num_gpus: 1,
    dph_total: { lte: 0.6 },
    rentable: true,
  })), { headers: { Authorization: `Bearer ${VAST_KEY}` } });
  const { offers } = await searchRes.json();
  const best = offers.sort((a, b) => a.dph_total - b.dph_total)[0];
  const rentRes = await fetch(`https://console.vast.ai/api/v0/asks/${best.id}/`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${VAST_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      client_id: "me",
      image: "yanwk/comfyui-boot:latest",
      disk: 40,
      onstart: "cd /ComfyUI && python main.py --listen 0.0.0.0 --port 8188",
    }),
  });
  const { new_contract } = await rentRes.json();
  return new_contract;
}

async function waitReady(instanceId) {
  for (let i = 0; i < 60; i++) {
    const r = await fetch(`https://console.vast.ai/api/v0/instances/${instanceId}/`, {
      headers: { Authorization: `Bearer ${VAST_KEY}` },
    });
    const { instances } = await r.json();
    if (instances?.actual_status === "running" && instances.ports?.["8188/tcp"]) {
      const host = instances.public_ipaddr;
      const port = instances.ports["8188/tcp"][0].HostPort;
      return `http://${host}:${port}`;
    }
    await new Promise((r) => setTimeout(r, 10_000));
  }
  throw new Error("instance timeout");
}

function buildPrompt(country, product) {
  return `editorial still-life photograph of premium Japanese ${product.name.toLowerCase()}, minimalist cream background, soft natural window light, rustic wabi-sabi ceramics, traditional ${country.name} cultural hint in corner, shot on Hasselblad, 85mm f/1.4, shallow depth of field, warm film grain, text-free composition for OGP overlay`;
}

async function runWorkflow(comfyUrl, prompt) {
  const wf = {
    "3": { class_type: "KSampler", inputs: { seed: Math.floor(Math.random() * 1e9), steps: 25, cfg: 7, sampler_name: "dpmpp_2m", scheduler: "karras", denoise: 1.0, model: ["4", 0], positive: ["6", 0], negative: ["7", 0], latent_image: ["5", 0] } },
    "4": { class_type: "CheckpointLoaderSimple", inputs: { ckpt_name: "sd_xl_base_1.0.safetensors" } },
    "5": { class_type: "EmptyLatentImage", inputs: { width: 1200, height: 630, batch_size: 1 } },
    "6": { class_type: "CLIPTextEncode", inputs: { text: prompt, clip: ["4", 1] } },
    "7": { class_type: "CLIPTextEncode", inputs: { text: "text, watermark, logo, blurry, low quality, cartoon", clip: ["4", 1] } },
    "8": { class_type: "VAEDecode", inputs: { samples: ["3", 0], vae: ["4", 2] } },
    "9": { class_type: "SaveImage", inputs: { filename_prefix: "ogp", images: ["8", 0] } },
  };
  const r = await fetch(`${comfyUrl}/prompt`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prompt: wf }) });
  const { prompt_id } = await r.json();
  for (let i = 0; i < 120; i++) {
    const h = await fetch(`${comfyUrl}/history/${prompt_id}`).then((x) => x.json());
    if (h[prompt_id]?.outputs?.["9"]?.images?.[0]) {
      const img = h[prompt_id].outputs["9"].images[0];
      const imgRes = await fetch(`${comfyUrl}/view?filename=${img.filename}&subfolder=${img.subfolder}&type=${img.type}`);
      return Buffer.from(await imgRes.arrayBuffer());
    }
    await new Promise((r) => setTimeout(r, 3_000));
  }
  throw new Error("comfy timeout");
}

async function destroy(instanceId) {
  await fetch(`https://console.vast.ai/api/v0/instances/${instanceId}/`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${VAST_KEY}` },
  });
}

async function main() {
  console.log("[ogp] renting RTX 4090...");
  const instanceId = await rentInstance();
  try {
    const comfyUrl = await waitReady(instanceId);
    console.log("[ogp] comfy ready @", comfyUrl);
    for (const c of COUNTRIES) {
      for (const p of PRODUCTS) {
        const slug = `${c.code}-${p.slug}`;
        const prompt = buildPrompt(c, p);
        try {
          const png = await runWorkflow(comfyUrl, prompt);
          const path = `ogp/${slug}.png`;
          await supabase.storage.from("public").upload(path, png, { contentType: "image/png", upsert: true });
          const { data } = supabase.storage.from("public").getPublicUrl(path);
          await supabase.from("sericia_pseo").update({ ogp_url: data.publicUrl }).eq("slug", slug);
          console.log(`[ogp] ✓ ${slug}`);
        } catch (e) {
          console.error(`[ogp] ✗ ${slug}`, e.message);
        }
      }
    }
  } finally {
    console.log("[ogp] destroying instance...");
    await destroy(instanceId);
  }
}

main().catch(console.error);
