import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

interface Stats {
  member_id: string;
  member_name: string;
  total_goals: number;
  total_minutes: number;
  presencas: number;
  convocatorias: number;
  capitao: number;
}

export default function Stats2025_26() {
  const [stats, setStats] = useState<Stats[]>([]);

  useEffect(() => {
    async function loadStats() {
      const { data, error } = await supabase.rpc("stats_epoca", {
        epoca: "25/26"
      });

      if (error) console.error("Erro ao carregar estatísticas:", error);
      else setStats(data);
    }

    loadStats();
  }, []);

  return (
    <div className="p-6 mt-6">
      <h2 className="text-3xl font-bold mb-4 text-secondary">
        Estatísticas da Equipa — Época 25/26
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((s) => (
          <div
            key={s.member_id}
            className="border border-secondary bg-primary p-4 rounded-lg shadow-md"
          >
            <h3 className="text-xl font-semibold">{s.member_name}</h3>

            <p><strong>Golos:</strong> {s.total_goals}</p>
            <p><strong>Minutos:</strong> {s.total_minutes}</p>
            <p><strong>Presenças:</strong> {s.presencas}</p>
            <p><strong>Convocatórias:</strong> {s.convocatorias}</p>
            <p><strong>Capitão:</strong> {s.capitao}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
