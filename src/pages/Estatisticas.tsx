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
  capitao: number; // agora é número
};

export default function Estatisticas() {
  const [stats, setStats] = useState<MemberStats[]>([]);

 async function loadStats() {
  const { data, error } = await supabase
    .from("member_stats")
    .select(`
      id,
      member_name,
      convocado,
      presencas,
      minutos_totais,
      golos_totais,
      capitao
    `)
    .order("golos_totais", { ascending: false });

  if (error) {
    console.error("Erro ao carregar estatísticas:", error);
    return;
  }

  if (data) {
    const processed = data.map((m) => ({
      ...m,
      media_minutos: m.presencas > 0 ? m.minutos_totais / m.presencas : 0,
      media_golos: m.presencas > 0 ? m.golos_totais / m.presencas : 0,
      percentagem: m.convocado > 0 ? (m.presencas / m.convocado) * 100 : 0,
      name: m.member_name,
    }));

    setStats(processed);
  }
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
            {/* Nome + Capitão */}
            <h2 className="text-lg font-bold flex items-center gap-2">
              {m.name}

              {m.capitao > 0 && (
                <span className="px-2 py-1 bg-yellow-500 text-black rounded text-sm">
                  Capitão {m.capitao}x
                </span>
              )}
            </h2>

            <p><strong>Convocado:</strong> {m.convocado}</p>
            <p><strong>Presenças:</strong> {m.presencas}</p>
            <p><strong>Minutos Totais:</strong> {m.minutos_totais}</p>
            <p><strong>Média de Minutos:</strong> {Math.round(m.media_minutos || 0)}</p>

            <p className="mt-2 text-yellow-300">
              <strong>Golos Totais:</strong> {m.golos_totais}
            </p>

            <p className="text-yellow-300">
              <strong>Média de Golos:</strong> {m.media_golos?.toFixed(2)}</p>

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
