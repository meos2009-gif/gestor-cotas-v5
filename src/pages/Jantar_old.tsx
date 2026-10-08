import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Jantar() {
  const [members, setMembers] = useState([]);
  const [dinners, setDinners] = useState([]);
  const [games, setGames] = useState([]);

  const [memberId, setMemberId] = useState("");
  const [date, setDate] = useState("");
  const [opponent, setOpponent] = useState("");
  const [value, setValue] = useState("");

  const [editId, setEditId] = useState(null);

  // FILTROS AVANÇADOS
  const [filterDate, setFilterDate] = useState("");
  const [filterOpponent, setFilterOpponent] = useState("");
  const [filterMinValue, setFilterMinValue] = useState("");
  const [filterMaxValue, setFilterMaxValue] = useState("");

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const totalPago = dinners.reduce((acc, d) => acc + Number(d.value || 0), 0);

  useEffect(() => {
    loadMembers();
    loadDinners();
    loadGames();
  }, []);

  async function loadMembers() {
    const { data } = await supabase
      .from("members")
      .select("*")
      .order("name", { ascending: true });

    if (data) setMembers(data);
  }

  async function loadDinners() {
    const { data } = await supabase
      .from("dinner_payments")
      .select("*")
      .order("date", { ascending: true });

    if (data) setDinners(data);
  }

  async function loadGames() {
    const { data } = await supabase
      .from("games")
      .select("id, opponent")
      .order("id", { ascending: false });

    if (data) setGames(data);
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
    setValue(d.value);
  }

  async function deleteDinner(id) {
    await supabase.from("dinner_payments").delete().eq("id", id);
    loadDinners();
  }

  async function saveDinner() {
    setError("");
    setSuccess("");

    if (!memberId || !date || !opponent || !value) {
      setError("Preenche todos os campos.");
      return;
    }

    if (editId) {
      const { error } = await supabase
        .from("dinner_payments")
        .update({
          member_id: memberId,
          date,
          opponent,
          value: Number(value),
        })
        .eq("id", editId);

      if (!error) {
        setSuccess("Jantar atualizado com sucesso!");
        setEditId(null);
        loadDinners();
      }
    } else {
      const { error } = await supabase.from("dinner_payments").insert({
        member_id: memberId,
        date,
        opponent,
        value: Number(value),
      });

      if (!error) {
        setSuccess("Jantar registado com sucesso!");
        loadDinners();
      }
    }

    setMemberId("");
    setDate("");
    setOpponent("");
    setValue("");
  }

  // FILTROS AVANÇADOS
  const filteredDinners = dinners.filter((d) => {
    return (
      (filterDate ? d.date === filterDate : true) &&
      (filterOpponent ? d.opponent === filterOpponent : true) &&
      (filterMinValue ? Number(d.value) >= Number(filterMinValue) : true) &&
      (filterMaxValue ? Number(d.value) <= Number(filterMaxValue) : true)
    );
  });

  // TOTAL POR ADVERSÁRIO
  const totalPorAdversario = filteredDinners.reduce((acc, d) => {
    acc[d.opponent] = (acc[d.opponent] || 0) + Number(d.value);
    return acc;
  }, {});

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
      <select
        value={opponent}
        onChange={(e) => setOpponent(e.target.value)}
        className="border p-2 bg-bg text-text rounded w-full mb-4"
      >
        <option value="">Selecionar adversário</option>
        {games.map((g) => (
          <option key={g.id} value={g.opponent}>
            {g.opponent}
          </option>
        ))}
      </select>

      <label className="block mb-2">Valor (€):</label>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="border p-2 bg-bg text-text rounded w-full mb-4"
        placeholder="Ex: 20"
      />

      <button
        onClick={saveDinner}
        className="bg-secondary text-primary font-semibold px-4 py-2 rounded shadow hover:bg-accent transition"
      >
        {editId ? "Guardar Alterações" : "Registar Jantar"}
      </button>

      {/* TOTAL GERAL */}
      <div className="mt-6 text-lg font-bold text-secondary">
        Total pago por todos os sócios: {totalPago}€
      </div>

      {/* FILTROS AVANÇADOS */}
      <h2 className="text-lg font-bold mt-6 mb-2">Filtros</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="border p-2 bg-bg text-text rounded"
        />

        <select
          value={filterOpponent}
          onChange={(e) => setFilterOpponent(e.target.value)}
          className="border p-2 bg-bg text-text rounded"
        >
          <option value="">Todos os adversários</option>
          {games.map((g) => (
            <option key={g.id} value={g.opponent}>
              {g.opponent}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Valor mínimo"
          value={filterMinValue}
          onChange={(e) => setFilterMinValue(e.target.value)}
          className="border p-2 bg-bg text-text rounded"
        />

        <input
          type="number"
          placeholder="Valor máximo"
          value={filterMaxValue}
          onChange={(e) => setFilterMaxValue(e.target.value)}
          className="border p-2 bg-bg text-text rounded"
        />
      </div>

      {/* TOTAIS POR ADVERSÁRIO */}
      <h2 className="text-lg font-bold mt-6 mb-2">Total por adversário</h2>

      <div className="overflow-x-auto rounded border border-gray-700 bg-primary p-2 mb-6">
        <table className="w-full text-left text-white text-sm">
          <thead className="bg-primary text-white font-semibold">
            <tr>
              <th className="border p-2">Adversário</th>
              <th className="border p-2">Total (€)</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(totalPorAdversario).map((adv) => (
              <tr key={adv}>
                <td className="border p-2">{adv}</td>
                <td className="border p-2">{totalPorAdversario[adv]}€</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* LISTA DE PAGAMENTOS FILTRADOS */}
      <h2 className="text-lg font-bold mt-6 mb-2">Pagamentos registados</h2>

      <div className="overflow-x-auto rounded border border-gray-700 bg-primary p-2">
        <table className="w-full text-left text-white text-sm">
          <thead className="bg-primary text-white font-semibold">
            <tr>
              <th className="border p-2">Sócio</th>
              <th className="border p-2">Data</th>
              <th className="border p-2">Adversário</th>
              <th className="border p-2">Valor</th>
              <th className="border p-2">Ações</th>
            </tr>
          </thead>

          <tbody>
            {filteredDinners.map((d) => (
              <tr key={d.id}>
                <td className="border p-2">{getMemberName(d.member_id)}</td>
                <td className="border p-2">{d.date}</td>
                <td className="border p-2">{d.opponent}</td>
                <td className="border p-2">{d.value}€</td>
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

            {filteredDinners.length === 0 && (
              <tr>
                <td className="border p-2 text-center" colSpan={5}>
                  Nenhum jantar encontrado com os filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
