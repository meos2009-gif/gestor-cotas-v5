import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Jantar() {
  const [members, setMembers] = useState([]);
  const [dinners, setDinners] = useState([]);

  const [memberId, setMemberId] = useState("");
  const [date, setDate] = useState("");
  const [opponent, setOpponent] = useState("");

  const [editId, setEditId] = useState(null);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadMembers();
    loadDinners();
  }, []);

  async function loadMembers() {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("name", { ascending: true });

    if (!error) setMembers(data);
  }

  async function loadDinners() {
    const { data, error } = await supabase
      .from("dinner_payments")
      .select("*")
      .order("date", { ascending: true });

    if (!error) setDinners(data);
  }

  function getMemberName(id) {
    const m = members.find((x) => x.id === id);
    return m ? m.name : "—";
  }

  function startEdit(d) {
    setEditId(d.id);
    setMemberId(d.member_id);
    setDate(d.date);
    setOpponent(d.opponent);
  }

  async function deleteDinner(id) {
    await supabase.from("dinner_payments").delete().eq("id", id);
    loadDinners();
  }

  async function saveDinner() {
    setError("");
    setSuccess("");

    if (!memberId || !date || !opponent) {
      setError("Preenche todos os campos.");
      return;
    }

    if (editId) {
      // EDITAR
      const { error } = await supabase
        .from("dinner_payments")
        .update({
          member_id: memberId,
          date,
          opponent,
        })
        .eq("id", editId);

      if (!error) {
        setSuccess("Jantar atualizado com sucesso!");
        setEditId(null);
        loadDinners();
      }
    } else {
      // INSERIR
      const { error } = await supabase.from("dinner_payments").insert({
        member_id: memberId,
        value: 20,
        date,
        opponent,
      });

      if (!error) {
        setSuccess("Jantar registado com sucesso!");
        loadDinners();
      }
    }

    setMemberId("");
    setDate("");
    setOpponent("");
  }

  return (
    <div className="p-6 bg-bg text-text min-h-screen">
      <h1 className="text-xl font-bold mb-4">Pagamento de Jantar</h1>

      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-500 mb-2">{success}</div>}

      {/* FORMULÁRIO */}
      <label className="block mb-2">Sócio:</label>
      <select
        value={memberId}
        onChange={(e) => setMemberId(e.target.value)}
        className="border p-2 bg-bg text-text rounded w-full mb-4"
      >
        <option value="">Selecionar sócio</option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>

      <label className="block mb-2">Data:</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="border p-2 bg-bg text-text rounded w-full mb-4"
      />

      <label className="block mb-2">Adversário:</label>
      <input
        type="text"
        value={opponent}
        onChange={(e) => setOpponent(e.target.value)}
        className="border p-2 bg-bg text-text rounded w-full mb-4"
      />

      <button
        onClick={saveDinner}
        className="bg-secondary text-primary font-semibold px-4 py-2 rounded shadow hover:bg-accent transition"
      >
        {editId ? "Guardar Alterações" : "Registar Jantar"}
      </button>

      {/* LISTA DE PAGAMENTOS */}
      <h2 className="text-lg font-bold mt-6 mb-2">Pagamentos registados</h2>

      <div className="overflow-x-auto rounded border border-gray-700 bg-primary p-2">
        <table className="w-full text-left text-white text-sm">
          <thead className="bg-primary text-white font-semibold" translate="no">
            <tr>
              <th className="border p-2">Sócio</th>
              <th className="border p-2">Data</th>
              <th className="border p-2">Adversário</th>
              <th className="border p-2">Valor</th>
              <th className="border p-2">Ações</th>
            </tr>
          </thead>

          <tbody>
            {dinners.map((d) => (
              <tr key={d.id} translate="no">
                <td className="border p-2">{getMemberName(d.member_id)}</td>
                <td className="border p-2">{d.date}</td>
                <td className="border p-2">{d.opponent}</td>
                <td className="border p-2">20€</td>
                <td className="border p-2 space-x-2">
                  <button
                    onClick={() => startEdit(d)}
                    className="bg-secondary text-primary px-2 py-1 rounded text-xs"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => deleteDinner(d.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}

            {dinners.length === 0 && (
              <tr>
                <td className="border p-2 text-center" colSpan={5}>
                  Nenhum jantar registado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
