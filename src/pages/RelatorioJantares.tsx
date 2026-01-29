import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function RelatorioJantares() {
  const [members, setMembers] = useState([]);
  const [dinners, setDinners] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setError("");

    const { data: membersData, error: membersError } = await supabase
      .from("members")
      .select("*")
      .order("name", { ascending: true });

    if (membersError) {
      setError("Erro ao carregar sócios.");
      return;
    }

    const { data: dinnersData, error: dinnersError } = await supabase
      .from("dinner_payments")
      .select("*")
      .order("date", { ascending: true });

    if (dinnersError) {
      setError("Erro ao carregar pagamentos de jantar.");
      return;
    }

    setMembers(membersData);
    setDinners(dinnersData);
  }

  function getMemberName(id) {
    const m = members.find((x) => x.id === id);
    return m ? m.name : "—";
  }

  return (
    <div className="p-6 bg-bg text-text min-h-screen">
      <h1 className="text-xl font-bold mb-4">Relatório de Jantares</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="overflow-x-auto rounded border border-gray-700 bg-primary p-2">
        <table className="w-full text-left text-white text-sm">
          <thead className="bg-primary text-white font-semibold" translate="no">
            <tr>
              <th className="border p-2">Sócio</th>
              <th className="border p-2">Data</th>
              <th className="border p-2">Adversário</th>
              <th className="border p-2">Valor</th>
              <th className="border p-2">Pago</th>
            </tr>
          </thead>

          <tbody>
            {dinners.map((d) => (
              <tr key={d.id} translate="no">
                <td className="border p-2">{getMemberName(d.member_id)}</td>
                <td className="border p-2">{d.date}</td>
                <td className="border p-2">{d.opponent}</td>
                <td className="border p-2">20€</td>
                <td className="border p-2 text-center">
                  <span className="text-green-400 font-bold">✓</span>
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
