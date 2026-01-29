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

    const { data: membersData } = await supabase
      .from("members")
      .select("*")
      .order("name", { ascending: true });

    const { data: dinnersData } = await supabase
      .from("dinner_payments")
      .select("*")
      .order("date", { ascending: true });

    setMembers(membersData || []);
    setDinners(dinnersData || []);
  }

  function getPaymentsForMember(id) {
    return dinners.filter((d) => d.member_id === id);
  }

  const totalPago = dinners.length * 20;

  return (
    <div className="p-6 bg-bg text-text min-h-screen">
      <h1 className="text-xl font-bold mb-4">Relatório de Jantares</h1>

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

      <div className="mt-4 text-lg font-bold text-secondary">
        Total pago: {totalPago}€
      </div>
    </div>
  );
}
