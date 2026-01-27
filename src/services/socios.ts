import { supabase } from "../lib/supabase";

export async function getSocios(): Promise<Socio[]> {
  const { data, error } = await supabase
    .from("socios")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}

export async function addSocio(socio: Partial<Socio>) {
  const { data, error } = await supabase
    .from("socios")
    .insert([socio])
    .select();

  if (error) throw error;
  return data?.[0];
}
