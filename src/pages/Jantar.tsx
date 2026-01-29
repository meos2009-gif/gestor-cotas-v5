import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Jantar() {
  const [members, setMembers] = useState([]);
  const [memberId, setMemberId] = useState("");
  const [date, setDate] = useState("");
  const [opponent, setOpponent] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("name", { ascending: true });

    if (!error) setMembers(data);
  }

  async function saveDinner() {
    setError("");
    setSuccess("");

    if (!memberId || !date || !opponent) {
      setError("Preenche todos os campos.");
      return;
    }

    const { error } = await supabase.from("dinner_payments").insert({
      member_id: memberId,
      value: 20,
      date,
      opponent,
    });

    if (error) {
      setError("Erro ao registar jantar.");
      return;
    }

    setSuccess("Jantar registado com sucesso!");
    setMemberId("");
    setDate("");
    setOpponent("");
  }

  return (
    <div className="p-6 bg-bg text-text min-h-screen">
      <h1 className="text-xl font-bold mb-4">Pagamento de Jantar</h1>

      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-500 mb-2">{success}</div>}

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
        Registar Jantar
      </button>
    </div>
  );
}
