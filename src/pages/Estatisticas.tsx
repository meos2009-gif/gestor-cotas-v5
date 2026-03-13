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

      // 2) Carregar convocatórias
      const { data: attendance } = await supabase
        .from("game_attendance")
        .select("member_id, called, game_id");

      // 3) Contar jogos únicos
      const jogosUnicos = new Set(attendance?.map((a) => a.game_id));
      setTotalJogos(jogosUnicos.size);

      // 4) Calcular estatísticas
      const estatisticas: Record<string, Stat> = {};

      membros?.forEach((m) => {
        estatisticas[m.id] = {
          presencas: 0,
          faltas: 0,
          percentagem: 0,
        };
      });

      attendance?.forEach((a) => {
        if (!estatisticas[a.member_id]) return;

        if (a.called) estatisticas[a.member_id].presencas++;
        else estatisticas[a.member_id].faltas++;
      });

      // 5) Calcular percentagem
      Object.keys(estatisticas).forEach((id) => {
        const s = estatisticas[id];
        const total = s.presencas + s.faltas;
        s.percentagem = total > 0 ? Math.round((s.presencas / total) * 100) : 0;
      });

      setStats(estatisticas);
      setLoading(false);
    }

    loadStats();
  }, []);

  if (loading) return <p className="p-6">A carregar estatísticas...</p>;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-secondary">Estatísticas da Equipa</h2>

      <p className="mb-4 text-lg opacity-80">
        Total de jogos registados: <strong>{totalJogos}</strong>
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-secondary bg-primary">
          <thead>
            <tr className="bg-secondary text-white">
              <th className="p-3 border border-secondary">Jogador</th>
              <th className="p-3 border border-secondary">Presenças</th>
              <th className="p-3 border border-secondary">Faltas</th>
              <th className="p-3 border border-secondary">% Convocação</th>
            </tr>
          </thead>

          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="text-center">
                <td className="p-3 border border-secondary">{m.name}</td>
                <td className="p-3 border border-secondary">{stats[m.id]?.presencas || 0}</td>
                <td className="p-3 border border-secondary">{stats[m.id]?.faltas || 0}</td>
                <td className="p-3 border border-secondary">
                  {stats[m.id]?.percentagem || 0}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
