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

  function getPaymentsForMember(id) {
    return dinners.filter((d) => d.member_id === id);
  }

  // Soma robusta (funciona mesmo se algum registo antigo não tiver value)
  const totalPago = dinners.reduce(
    (sum, d) => sum + (typeof d.value === "number" ? d.value : 20),
    0
  );

  return (
    <div className="p-6 bg-bg text-text min-h-screen">
      <h1 className="text-xl font-bold mb-4">Relatório de Jantares</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

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
              const pagos = getPaymentsForMember(m.id);

              // Sócio sem pagamentos
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

              // Sócio com pagamentos
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

      {/* TOTAL */}
      <div className="mt-4 text-lg font-bold text-secondary">
        Total pago: {totalPago}€
      </div>
    </div>
  );
}
