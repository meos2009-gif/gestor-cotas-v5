import { useEffect, useState } from "react";
import { PageTitle, Card, Input, Select, Button } from "../lib/ui";
import { supabase } from "../supabaseClient";

/* ============================================================
   FUNÇÕES SUPABASE
   ============================================================ */

async function getMembers() {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}

async function getPaymentsByYear(year) {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("year", year)
    .order("month", { ascending: true });

  if (error) throw error;
  return data;
}

async function updatePayment(id, data) {
  const { error } = await supabase
    .from("payments")
    .update(data)
    .eq("id", id);

  if (error) throw error;
}

async function deletePaymentById(id) {
  const { error } = await supabase
    .from("payments")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

/* ============================================================
   COMPONENTE PRINCIPAL
   ============================================================ */

export default function Pagamentos() {
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);

  const [memberId, setMemberId] = useState("");
  const [months, setMonths] = useState([]); // AGORA ARRAY
  const [year, setYear] = useState(new Date().getFullYear());
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");

  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const [showList, setShowList] = useState(false);

  useEffect(() => {
    load();
  }, [year]);

  async function load() {
    try {
      const p = await getPaymentsByYear(year);
      const m = await getMembers();
      setPayments(p);
      setMembers(m);
    } catch (err) {
      setError(err.message);
    }
  }

  /* ============================================================
     SUBMETER FORMULÁRIO
     ============================================================ */

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      // EDITAR — apenas 1 mês
      if (editingId) {
        const data = {
          member_id: memberId,
          month: months[0],
          year,
          amount,
          method,
        };

        await updatePayment(editingId, data);
        setEditingId(null);
      }

      // ADICIONAR — vários meses
      else {
        const inserts = months.map((m) => ({
          member_id: memberId,
          month: m,
          year,
          amount,
          method,
        }));

        const { error } = await supabase.from("payments").insert(inserts);
        if (error) throw error;
      }

      // limpar
      setMemberId("");
      setMonths([]);
      setAmount("");
      setMethod("cash");

      load();
    } catch (err) {
      setError(err.message);
    }
  }

  /* ============================================================
     EDITAR
     ============================================================ */

  function startEdit(payment) {
    setEditingId(payment.id);
    setMemberId(payment.member_id);
    setMonths([payment.month]); // agora array
    setAmount(payment.amount);
    setMethod(payment.method || "cash");
  }

  /* ============================================================
     APAGAR
     ============================================================ */

  async function handleDelete(id) {
    try {
      await deletePaymentById(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <>
      <PageTitle>Pagamentos</PageTitle>

      {error && (
        <div className="text-red-400 text-sm bg-red-900/30 border border-red-700 px-3 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <Card>
        <div className="space-y-4">

          {/* ANO */}
          <div>
            <label className="block font-semibold mb-1">Ano:</label>
            <Select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {Array.from({ length: 5 }).map((_, i) => {
                const y = new Date().getFullYear() - i;
                return (
                  <option key={y} value={y}>
                    {y}
                  </option>
                );
              })}
            </Select>
          </div>

          {/* FORMULÁRIO */}
          <form onSubmit={handleSubmit} className="space-y-3">

            {/* SÓCIO */}
            <Select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              required
            >
              <option value="">Selecione o sócio</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>

            {/* MESES — MULTI SELECT */}
            <Select
              multiple
              value={months}
              onChange={(e) =>
                setMonths([...e.target.selectedOptions].map((o) => Number(o.value)))
              }
              required
            >
              <option disabled>Selecione os meses</option>
              {[
                "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
              ].map((name, i) => (
                <option key={i + 1} value={i + 1}>
                  {name}
                </option>
              ))}
            </Select>

            {/* VALOR */}
            <Input
              type="number"
              placeholder="Valor (€)"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
            />

            {/* MÉTODO */}
            <Select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              required
            >
              <option value="cash">Cash</option>
              <option value="banco">Banco</option>
            </Select>

            <Button variant="secondary">
              {editingId ? "Guardar Alterações" : "Adicionar Pagamentos"}
            </Button>
          </form>
        </div>
      </Card>

      {/* BOTÃO LISTA */}
      <Button
        onClick={() => setShowList(!showList)}
        variant="primary"
        className="mt-6"
      >
        {showList ? "Esconder Pagamentos" : "Lista de Pagamentos"}
      </Button>

      {/* LISTA */}
      {showList && (
        <Card>
          <table className="w-full border text-xs leading-tight">
            <thead>
              <tr className="bg-primary text-white">
                <th className="border p-1">Sócio</th>
                <th className="border p-1">Mês</th>
                <th className="border p-1">Ano</th>
                <th className="border p-1">Valor</th>
                <th className="border p-1">Método</th>
                <th className="border p-1">Ações</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((p) => {
                const member = members.find((m) => m.id === p.member_id);

                return (
                  <tr key={p.id} className="hover:bg-gray-800/40">
                    <td className="border p-1">{member?.name || "—"}</td>
                    <td className="border p-1">{p.month}</td>
                    <td className="border p-1">{p.year}</td>
                    <td className="border p-1">{p.amount} €</td>
                    <td className="border p-1 capitalize">{p.method}</td>
                    <td className="border p-1 space-x-1">
                      <Button
                        onClick={() => startEdit(p)}
                        variant="secondary"
                        className="text-xs px-2 py-1"
                      >
                        Editar
                      </Button>

                      <Button
                        onClick={() => handleDelete(p.id)}
                        variant="accent"
                        className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700"
                      >
                        Apagar
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
