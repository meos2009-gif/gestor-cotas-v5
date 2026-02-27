import { useEffect, useState } from "react";
import { supabase } from "../supabase";

type MemberStats = {
  id: string;
  name: string;
  convocado: number;
  presencas: number;
  minutos_totais: number;
  media_minutos: number;
  golos_totais: number;
  media_golos: number;
  percentagem: number;
};

export default function EstatisticasIndividuais() {
  const [stats, setStats] = useState<MemberStats[]>([]);

  async function loadStats() {
    const { data } = await supabase
      .from("member_stats")
      .select("*")
      .order("golos_totais", { ascending: false });

    if (data) setStats(data);
  }

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Estatísticas Individuais</h1>

      <div className="space-y-4">
        {stats.map((m) => (
          <div
            key={m.id}
            className="p-4 bg-primary text-white rounded shadow border border-gray-700"
          >
            <h2 className="text-lg font-bold">{m.name}</h2>

            <p><strong>Convocado:</strong> {m.convocado}</p>
            <p><strong>Presenças:</strong> {m.presencas}</p>
            <p><strong>Minutos Totais:</strong> {m.minutos_totais}</p>
            <p><strong>Média de Minutos:</strong> {Math.round(m.media_minutos || 0)}</p>

            <p className="mt-2 text-yellow-300">
              <strong>Golos Totais:</strong> {m.golos_totais}
            </p>

            <p className="text-yellow-300">
              <strong>Média de Golos:</strong> {m.media_golos?.toFixed(2)}
            </p>

            <p className="mt-2">
              <strong>Percentagem Presença:</strong> {m.percentagem.toFixed(1)}%
            </p>
          </div>
        ))}

        {stats.length === 0 && (
          <p className="text-gray-500">Sem estatísticas disponíveis.</p>
        )}
      </div>
    </div>
  );
}
