import { supabase } from "../lib/supabaseClient";

// Buscar todos os sócios
export async function getMembers() {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}

// Criar sócio
export async function addMember(data: any) {
  const { error } = await supabase
    .from("members")
    .insert({
      name: data.name,
      contact: data.contact || null,
      monthly_fee: data.monthly_fee ?? null,
      start_date: data.start_date || null,
    });

  if (error) throw error;
}

// Atualizar sócio
export async function updateMember(id: string, data: any) {
  const { error } = await supabase
    .from("members")
    .update({
      name: data.name,
      contact: data.contact || null,
      monthly_fee: data.monthly_fee ?? null,
      start_date: data.start_date || null,
    })
    .eq("id", id);

  if (error) throw error;
}

// Apagar sócio
export async function deleteMemberById(id: string) {
  const { error } = await supabase
    .from("members")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
