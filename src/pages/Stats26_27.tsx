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

export default function Stats26_27() {
  const [stats, setStats] = useState<Stats[]>([]);

  useEffect(() => {
    async function loadStats() {
      // 1. Buscar IDs dos jogos da época 26/27
      const { data: games, error: gamesError } = await supabase
        .from("games")
        .select("id")
        .eq("season", "26/27");

      if (gamesError) {
        console.error("Erro ao carregar jogos 26/27:", gamesError);
        return;
      }

      const gameIds = games.map((g) => g.id);

      if (gameIds.length === 0) {
        console.warn("Não há jogos na época 26/27");
        setStats([]);
        return;
      }

      // 2. Buscar presenças só desses jogos
      const { data, error } = await supabase
        .from("game_attendance")
        .select(
          "member_id, member_name, goals, minutes, present, called, captain, game_id"
        )
        .in("game_id", gameIds); // ⭐ aqui garantimos que só vem 26/27

      if (error) {
        console.error("Erro ao carregar estatísticas 26/27:", error);
        return;
      }

      const mapa = new Map<string, Stats>();

      data.forEach((row: any) => {
        if (!mapa.has(row.member_id)) {
          mapa.set(row.member_id, {
            member_id: row.member_id,
            member_name: row.member_name,
            total_goals: 0,
            total_minutes: 0,
            presencas: 0,
            convocatorias: 0,
            capitao: 0,
          });
        }

        const s = mapa.get(row.member_id)!;

        s.total_goals += row.goals ?? 0;
        s.total_minutes += row.minutes ?? 0;
        s.presencas += row.present ? 1 : 0;
        s.convocatorias += row.called ? 1 : 0;
        s.capitao += row.captain ? 1 : 0;
      });

      setStats(
        Array.from(mapa.values()).sort((a, b) => b.presencas - a.presencas)
      );
    }

    loadStats();
  }, []);

  return (
    <div className="p-6 mt-6">
      <h2 className="text-3xl font-bold mb-4 text-secondary">
        Estatísticas da Equipa — Época 26/27
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((s) => (
          <div
            key={s.member_id}
            className="border border-secondary bg-primary p-4 rounded-lg shadow-md"
          >
            <h3 className="text-xl font-semibold">{s.member_name}</h3>

            <p><strong>Presenças:</strong> {s.presencas}</p>
            <p><strong>Convocatórias:</strong> {s.convocatorias}</p>
            <p><strong>Golos:</strong> {s.total_goals}</p>
            <p><strong>Minutos:</strong> {s.total_minutes}</p>
            <p><strong>Capitão:</strong> {s.capitao}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
