import { useEffect, useState } from "react";
import {
  addPayment,
  updatePayment,
  deletePaymentById,
  getPaymentsByYear
} from "../services/payments";
import { getMembers } from "../services/members";

export default function Pagamentos() {
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [memberId, setMemberId] = useState("");
  const [month, setMonth] = useState<number | "">("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [amount, setAmount] = useState<number | "">("");
  const [editingId, setEditingId] = useState<string | null>(null);
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
    } catch (err: any) {
      console.error("Erro no load:", err);
      setError(err.message);
    }
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    setError("");

    try {
      const data = { member_id: memberId, month, year, amount };

      if (editingId) {
        await updatePayment(editingId, data);
        setEditingId(null);
      } else {
        await addPayment(data);
      }

      setMemberId("");
      setMonth("");
      setAmount("");
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  function startEdit(payment: any) {
    setEditingId(payment.id);
    setMemberId(payment.member_id);
    setMonth(payment.month);
    setAmount(payment.amount);
  }

  async function handleDelete(id: string) {
    try {
      await deletePaymentById(id);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Pagamentos</h1>

      {error && <div className="text-red-600 mb-2">{error}</div>}

      {/* SELETOR DE ANO */}
      <div className="mb-4">
        <label className="mr-2 font-semibold">Ano:</label>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border p-2"
        >
          {Array.from({ length: 5 }).map((_, i) => {
            const y = new Date().getFullYear() - i;
            return (
              <option key={y} value={y}>
                {y}
              </option>
            );
          })}
        </select>
      </div>

      {/* FORMULÁRIO */}
      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <select
          className="border p-2 w-full"
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
          required
        >
          <option value="">Selecione o sócio</option>
          {members.map((m: any) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        <select
          className="border p-2 w-full"
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          required
        >
          <option value="">Selecione o mês</option>
          {[
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
          ].map((name, i) => (
            <option key={i + 1} value={i + 1}>
              {name}
            </option>
          ))}
        </select>

        <input
          type="number"
          className="border p-2 w-full"
          placeholder="Valor (€)"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          required
        />

        {/* BOTÃO AMARELO DO CLUBE */}
        <button className="bg-secondary text-primary font-semibold px-4 py-2 rounded shadow hover:bg-accent transition">
          {editingId ? "Guardar Alterações" : "Adicionar Pagamento"}
        </button>
      </form>

      {/* BOTÃO MOSTRAR/ESCONDER LISTA */}
      <button
        onClick={() => setShowList(!showList)}
        className="bg-gray-700 text-white px-4 py-2 rounded mb-4"
      >
        {showList ? "Esconder Pagamentos" : "Lista de Pagamentos"}
      </button>

      {/* LISTAGEM */}
      {showList && (
        <table className="w-full border text-xs leading-tight mt-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-1">Sócio</th>
              <th className="border p-1">Mês</th>
              <th className="border p-1">Ano</th>
              <th className="border p-1">Valor</th>
              <th className="border p-1">Ações</th>
            </tr>
          </thead>

          <tbody>
            {payments.map((p: any) => {
              const member = members.find((m: any) => m.id === p.member_id);

              return (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="border p-1">{member?.name || "—"}</td>
                  <td className="border p-1">{p.month}</td>
                  <td className="border p-1">{p.year}</td>
                  <td className="border p-1">{p.amount} €</td>
                  <td className="border p-1 space-x-1">
                    <button
                      onClick={() => startEdit(p)}
                      className="px-2 py-1 bg-secondary text-primary rounded text-xs hover:bg-accent transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition"
                    >
                      Apagar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
