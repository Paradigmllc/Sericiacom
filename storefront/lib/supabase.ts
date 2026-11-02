import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, property) {
    if (!client) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) throw new Error("Supabase public configuration is missing");
      client = createClient(url, key, { auth: { persistSession: false } });
    }
    const value = Reflect.get(client, property);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export type PseoArticle = {
  slug: string;
  country_code: string;
  country_name: string;
  product_slug: string;
  product_name: string;
  title: string;
  meta_description: string;
  intro_md: string;
  why_japanese_md: string;
  shipping_info_md: string;
  faq: { q: string; a: string }[];
  related_drop_handle: string | null;
  ogp_url: string | null;
  published_at: string;
  updated_at: string;
};
