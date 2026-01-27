import { supabase } from "./lib/supabase";

export async function testarLigacao() {
  const { data, error } = await supabase.from("public.payments").select("*").limit(1);

  console.log("DATA:", data);
  console.log("ERROR:", error);
}
