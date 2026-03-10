import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// Expor no window para debugging (opcional)
if (typeof window !== "undefined") {
  // @ts-ignore
  window.supabase = supabase;
}
