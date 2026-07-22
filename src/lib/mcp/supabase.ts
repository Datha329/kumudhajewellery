import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Public Supabase client for MCP tools. Uses the anon/publishable key so RLS
// applies as `anon` — only intentionally public catalog data is reachable.
export function getPublicSupabase() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}
