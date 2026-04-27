import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function RelatorioJantares() {
  const [members, setMembers] = useState([]);
  const [dinners, setDinners] = useState([]);
  const [error, setError] = useState("");

  // FILTROS
  const [filterDate, setFilterDate] = useState("");
  const [filterOpponent, setFilterOpponent] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setError("");

    // Carregar sócios
    const { data: membersData, error: membersError } = await supabase
      .from("members")
      .select("*")
      .order("name", { ascending: true });

    if (membersError) {
      setError("Erro ao carregar sócios.");
      return;
    }

    // Carregar pagamentos de jantar
    const { data: dinnersData, error: dinnersError } = await supabase
      .from("dinner_payments")
      .select("id, member_id, date, opponent, value")
      .order("date", { ascending: true });

    if (dinnersError) {
      setError("Erro ao carregar pagamentos de jantar.");
      return;
    }

    setMembers(membersData || []);
    setDinners(dinnersData || []);
  }

  // LISTA FILTRADA
  const filteredDinners = dinners.filter((d) => {
    return (
      (filterDate ? d.date === filterDate : true) &&
      (filterOpponent ? d.opponent === filterOpponent : true)
    );
  });

  // TOTAL GERAL
  const totalPago = filteredDinners.reduce(
    (sum, d) => sum + (typeof d.value === "number" ? d.value : 20),
    0
  );

  // ADVERSÁRIOS ÚNICOS
  const adversariosUnicos = [...new Set(dinners.map((d) => d.opponent))];

  // TOTAL POR ADVERSÁRIO
  const totalPorAdversario = filteredDinners.reduce((acc, d) => {
    acc[d.opponent] = (acc[d.opponent] || 0) + Number(d.value || 0);
    return acc;
  }, {});

  return (
    <div className="p-6 bg-bg text-text min-h-screen">
      <h1 className="text-xl font-bold mb-4">Relatório de Jantares</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* FILTROS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        <div>
          <label className="block mb-1 font-semibold">Filtrar por data:</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border p-2 bg-bg text-text rounded w-full"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Filtrar por adversário:</label>
          <select
            value={filterOpponent}
            onChange={(e) => setFilterOpponent(e.target.value)}
            className="border p-2 bg-bg text-text rounded w-full"
          >
            <option value="">Todos</option>
            {adversariosUnicos.map((adv) => (
              <option key={adv} value={adv}>
                {adv}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* TOTAL POR ADVERSÁRIO */}
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

            {Object.keys(totalPorAdversario).length === 0 && (
              <tr>
                <td className="border p-2 text-center" colSpan={2}>
                  Nenhum resultado com os filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* TABELA PRINCIPAL */}
      <div className="overflow-x-auto rounded border border-gray-700 bg-primary p-2">
        <table className="w-full text-left text-white text-sm">
          <thead className="bg-primary text-white font-semibold" translate="no">
            <tr>
              <th className="border p-2">Sócio</th>
              <th className="border p-2">Pagou</th>
              <th className="border p-2">Data</th>
              <th className="border p-2">Adversário</th>
            </tr>
          </thead>

          <tbody>
            {members.map((m) => {
              const pagos = filteredDinners.filter((d) => d.member_id === m.id);

              if (pagos.length === 0) {
                return (
                  <tr key={m.id} translate="no">
                    <td className="border p-2">{m.name}</td>
                    <td className="border p-2 text-center text-white">–</td>
                    <td className="border p-2">—</td>
                    <td className="border p-2">—</td>
                  </tr>
                );
              }

              return pagos.map((p, i) => (
                <tr key={p.id} translate="no">
                  {i === 0 && (
                    <td className="border p-2" rowSpan={pagos.length}>
                      {m.name}
                    </td>
                  )}
                  <td className="border p-2 text-center">
                    <span className="text-green-400 font-bold">✓</span>
                  </td>
                  <td className="border p-2">{p.date}</td>
                  <td className="border p-2">{p.opponent}</td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>

      {/* TOTAL GERAL */}
      <div className="mt-4 text-lg font-bold text-secondary">
        Total pago: {totalPago}€
      </div>
    </div>
  );
}
