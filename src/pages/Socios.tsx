import { useEffect, useState } from "react";
import { getMembers, addMember, updateMember, deleteMemberById } from "../services/members";

export default function Socios() {
  const [members, setMembers] = useState([]);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [monthlyFee, setMonthlyFee] = useState("");
  const [startDate, setStartDate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // NOVO: controlar se a lista está visível
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await getMembers();
      setMembers(data);
    } catch (err: any) {
      console.error("Erro ao carregar sócios:", err);
      setError(err.message);
    }
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    setError("");

    const payload = {
      name,
      contact,
      monthly_fee: monthlyFee ? Number(monthlyFee) : null,
      start_date: startDate || null,
    };

    try {
      if (editingId) {
        await updateMember(editingId, payload);
        setEditingId(null);
      } else {
        await addMember(payload);
      }

      setName("");
      setContact("");
      setMonthlyFee("");
      setStartDate("");
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  function startEdit(member: any) {
    setEditingId(member.id);
    setName(member.name || "");
    setContact(member.contact || "");
    setMonthlyFee(member.monthly_fee || "");
    setStartDate(member.start_date || "");
  }

  async function handleDelete(id: string) {
    try {
      await deleteMemberById(id);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Sócios</h1>

      {error && <div className="text-red-600 mb-2">{error}</div>}

      {/* FORMULÁRIO */}
      <form onSubmit={handleSubmit} className="space-y-3 mb-6">

        <input
          type="text"
          className="border p-2 w-full"
          placeholder="Nome do sócio"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="text"
          className="border p-2 w-full"
          placeholder="Contacto (telemóvel)"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />

        <input
          type="number"
          step="0.01"
          className="border p-2 w-full"
          placeholder="Valor da cota (€)"
          value={monthlyFee}
          onChange={(e) => setMonthlyFee(e.target.value)}
        />

        <input
          type="date"
          className="border p-2 w-full"
          placeholder="Data de admissão"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        {/* BOTÃO AMARELO DO CLUBE */}
        <button className="bg-secondary text-primary font-semibold px-4 py-2 rounded shadow hover:bg-accent transition">
          {editingId ? "Guardar Alterações" : "Adicionar Sócio"}
        </button>
      </form>

      {/* BOTÃO MOSTRAR/ESCONDER LISTA */}
      <button
        onClick={() => setShowList(!showList)}
        className="bg-gray-700 text-white px-4 py-2 rounded mb-4"
      >
        {showList ? "Esconder Lista de Sócios" : "Lista de Sócios"}
      </button>

      {/* LISTAGEM (ESCONDIDA POR PADRÃO) */}
      {showList && (
        <table className="w-full border mt-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left font-semibold text-gray-900">Nome</th>              
              <th className="border p-2 text-gray-900">Contacto</th>
              <th className="border p-2 text-gray-900">Cota (€)</th>
              <th className="border p-2 text-gray-900">Admissão</th>
              <th className="border p-2 text-gray-900">Ações</th>
            </tr>
          </thead>

          <tbody>
            {members.map((m: any) => (
              <tr key={m.id}>
                <td className="border p-2 text-xs" translate="no">{m.name}</td>
                <td className="border p-2 text-xs" translate="no">{m.contact || "—"}</td>
                <td className="border p-2 text-xs" translate="no">{m.monthly_fee || "—"}</td>
                <td className="border p-2 text-xs" translate="no">{m.start_date || "—"}</td>

                <td className="border p-2 space-x-2">
                  <button
                    onClick={() => startEdit(m)}
                    className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => handleDelete(m.id)}
                    className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                  >
                    Apagar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
