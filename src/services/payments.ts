import { supabase } from "../lib/supabase";

// Obter pagamentos filtrados por ano
export async function getPaymentsByYear(year: number) {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("year", year)
    .order("month", { ascending: true });

  if (error) throw error;
  return data;
}

// Adicionar pagamento
export async function addPayment(data: any) {
  const { error } = await supabase
    .from("payments")
    .insert(data);

  if (error) throw error;
}

// Atualizar pagamento
export async function updatePayment(id: string, data: any) {
  const { error } = await supabase
    .from("payments")
    .update(data)
    .eq("id", id);

  if (error) throw error;
}

// Apagar pagamento
export async function deletePaymentById(id: string) {
  const { error } = await supabase
    .from("payments")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
