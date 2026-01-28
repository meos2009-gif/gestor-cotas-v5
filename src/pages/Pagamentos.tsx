import { useEffect, useState } from "react";
import {
  addPayment,
  updatePayment,
  deletePaymentById,
  getPaymentsByYear
} from "../services/payments";
import { getMembers } from "../services/members";

import { PageTitle, Card, Input, Select, Button } from "../lib/ui";

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
    <>
      <PageTitle>Pagamentos</PageTitle>

      {error && (
        <div className="text-red-400 text-sm bg-red-900/30 border border-red-700 px-3 py-2 rounded mb-4">
          {error}
        </div>
      )}

      {/* CARD PRINCIPAL */}
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
              {members.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>

            {/* MÊS */}
            <Select
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
            </Select>

            {/* VALOR */}
            <Input
              type="number"
              placeholder="Valor (€)"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
            />

            {/* BOTÃO */}
            <Button variant="secondary">
              {editingId ? "Guardar Alterações" : "Adicionar Pagamento"}
            </Button>
          </form>
        </div>
      </Card>

      {/* BOTÃO MOSTRAR LISTA */}
      <Button
        onClick={() => setShowList(!showList)}
        variant="primary"
        className="mt-6"
      >
        {showList ? "Esconder Pagamentos" : "Lista de Pagamentos"}
      </Button>

      {/* LISTAGEM */}
      {showList && (
        <Card>
          <table className="w-full border text-xs leading-tight">
            <thead>
              <tr className="bg-primary text-white">
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
                  <tr key={p.id} className="hover:bg-gray-800/40">
                    <td className="border p-1">{member?.name || "—"}</td>
                    <td className="border p-1">{p.month}</td>
                    <td className="border p-1">{p.year}</td>
                    <td className="border p-1">{p.amount} €</td>
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
