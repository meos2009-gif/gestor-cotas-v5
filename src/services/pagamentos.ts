import { supabase } from "../lib/supabase";

export async function getPayments() {
  const { data, error } = await supabase
    .from("main.payments")
    .select("*, members:member_id (name, email, phone)") // relação correta
    .order("year", { ascending: false })
    .order("month", { ascending: false });

  if (error) throw error;
  return data;
}

export async function addPayment(payment) {
  const { data, error } = await supabase
    .from("main.payments")
    .insert([payment])
    .select();

  if (error) throw error;
  return data?.[0];
}
