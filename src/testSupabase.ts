import { supabase } from "./supabase";

async function test() {
  const { data, error } = await supabase.from("members").select("*");
  console.log("DATA:", data);
  console.log("ERROR:", error);
}

test();
