import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";

type Stats = {
  member_id: string;
  member_name: string;
  convocado: number;
  presencas: number;
  minutos_totais: number;
  golos_totais: number;
  capitao: number;
};

export default function Estatisticas() {
  const [stats, setStats] = useState<Stats[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    loadStats();
  }, [location.pathname]);

  async function loadStats() {
    setLoading(true);

    const { data, error } = await supabase
      .from("member_stats")
      .select("*")
      .order("minutos_totais", { ascending: false });

    if (error) {
      console.error("Erro ao carregar estatísticas:", error);
      setStats([]);
    } else {
      setStats(data as Stats[]);
    }

    setLoading(false);
  }

  if (loading) {
    return <div className="p-4 text-white">A carregar estatísticas...</div>;
  }

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">Estatísticas Individuais</h1>

      <button
        onClick={loadStats}
        className="mb-4 bg-blue-600 px-3 py-1 rounded"
      >
        Atualizar
      </button>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-900 border border-gray-700 rounded">
          <thead>
            <tr className="bg-gray-800 text-left">
              <th className="p-2 border-b border-gray-700">Jogador</th>
              <th className="p-2 border-b border-gray-700">Convocado</th>
              <th className="p-2 border-b border-gray-700">Presenças</th>
              <th className="p-2 border-b border-gray-700">Minutos</th>
              <th className="p-2 border-b border-gray-700">Golos</th>
              <th className="p-2 border-b border-gray-700">Capitão</th>
            </tr>
          </thead>

          <tbody>
            {stats.map((s) => (
              <tr key={s.member_id} className="hover:bg-gray-800">
                <td className="p-2 border-b border-gray-700">{s.member_name}</td>
                <td className="p-2 border-b border-gray-700">{s.convocado}</td>
                <td className="p-2 border-b border-gray-700">{s.presencas}</td>
                <td className="p-2 border-b border-gray-700">{s.minutos_totais}</td>
                <td className="p-2 border-b border-gray-700">{s.golos_totais}</td>
                <td className="p-2 border-b border-gray-700">{s.capitao}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
