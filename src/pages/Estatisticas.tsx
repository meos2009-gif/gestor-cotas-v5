import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

interface Member {
  id: string;
  name: string;
}

interface Stat {
  presencas: number;
  faltas: number;
  percentagem: number;
  goals: number;
  minutes: number;
  capitaincies: number;
}

export default function Estatisticas() {
  const [stats, setStats] = useState<Record<string, Stat>>({});
  const [members, setMembers] = useState<Member[]>([]);
  const [totalJogos, setTotalJogos] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      // 1) Carregar jogadores
      const { data: membros } = await supabase
        .from("members")
        .select("id, name")
        .order("name", { ascending: true });

      setMembers(membros || []);

      // 2) Buscar jogos já realizados (data <= hoje)
      const hoje = new Date().toISOString().split("T")[0];

      const { data: jogosRealizados } = await supabase
        .from("games")
        .select("id, game_date")
        .lte("game_date", hoje);

      const jogosIds = jogosRealizados?.map((j) => j.id) || [];

      // 3) Buscar attendance apenas dos jogos realizados
      const { data: attendance } = await supabase
        .from("game_attendance")
        .select("member_id, called, game_id, goals, minutes, captain")
        .in("game_id", jogosIds);

      // 4) Total de jogos realizados
      setTotalJogos(jogosIds.length);

      // 5) Inicializar estatísticas
      const estatisticas: Record<string, Stat> = {};

      membros?.forEach((m) => {
        estatisticas[m.id] = {
          presencas: 0,
          faltas: 0,
          percentagem: 0,
          goals: 0,
          minutes: 0,
          capitaincies: 0,
        };
      });

      // 6) Preencher estatísticas
      attendance?.forEach((a) => {
        const s = estatisticas[a.member_id];
        if (!s) return;

        if (a.called) s.presencas++;

        s.goals += a.goals || 0;
        s.minutes += a.minutes || 0;

        if (a.captain) s.capitaincies++;
      });

      // 7) Calcular faltas reais e percentagem
      Object.keys(estatisticas).forEach((id) => {
        const s = estatisticas[id];

        s.faltas = totalJogos - s.presencas;
        if (s.faltas < 0) s.faltas = 0;

        s.percentagem =
          totalJogos > 0
            ? Math.round((s.presencas / totalJogos) * 100)
            : 0;
      });

      setStats(estatisticas);
      setLoading(false);
    }

    loadStats();
  }, []);

  if (loading) return <p className="p-6">A carregar estatísticas...</p>;

  // 🔥 Ranking de presenças
  const rankingPresencas = [...members].sort(
    (a, b) => (stats[b.id]?.presencas || 0) - (stats[a.id]?.presencas || 0)
  );

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-secondary">Estatísticas da Equipa</h2>

      <p className="mb-4 text-lg opacity-80">
        Jogos realizados: <strong>{totalJogos}</strong>
      </p>

      {/* RANKING DE PRESENÇAS */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-3 text-secondary">Ranking de Presenças</h3>

        <div className="bg-primary border border-secondary rounded-md shadow-md p-4">
          {rankingPresencas.map((m, index) => (
            <div
              key={m.id}
              className="flex justify-between py-2 border-b border-secondary last:border-b-0"
            >
              <span className="font-semibold">
                {index + 1}. {m.name}
              </span>
              <span className="font-bold text-secondary">
                {stats[m.id]?.presencas || 0} presenças
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* TABELA COMPLETA — ORDENADA POR MINUTOS */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-secondary bg-primary">
          <thead>
            <tr className="bg-secondary text-white">
              <th className="p-3 border border-secondary">Jogador</th>
              <th className="p-3 border border-secondary">Presenças</th>
              <th className="p-3 border border-secondary">Faltas</th>
              <th className="p-3 border border-secondary">% Convocação</th>
              <th className="p-3 border border-secondary">Golos</th>
              <th className="p-3 border border-secondary">Minutos</th>
              <th className="p-3 border border-secondary">Capitão</th>
            </tr>
          </thead>

          <tbody>
            {[...members]
              .sort(
                (a, b) =>
                  (stats[b.id]?.minutes || 0) -
                  (stats[a.id]?.minutes || 0)
              )
              .map((m) => (
                <tr key={m.id} className="text-center">
                  <td className="p-3 border border-secondary">{m.name}</td>
                  <td className="p-3 border border-secondary">{stats[m.id]?.presencas || 0}</td>
                  <td className="p-3 border border-secondary">{stats[m.id]?.faltas || 0}</td>
                  <td className="p-3 border border-secondary">
                    {stats[m.id]?.percentagem || 0}%
                  </td>
                  <td className="p-3 border border-secondary">{stats[m.id]?.goals || 0}</td>
                  <td className="p-3 border border-secondary">{stats[m.id]?.minutes || 0}</td>
                  <td className="p-3 border border-secondary">{stats[m.id]?.capitaincies || 0}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
