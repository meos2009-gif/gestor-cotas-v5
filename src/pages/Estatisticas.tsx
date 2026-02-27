import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useSearchParams } from "react-router-dom";

type TeamStats = {
  jogos: number;
  jogos_jogados: number;
  media_convocados: number;
  media_presencas: number;
  assiduidade_global: number;
};

type MemberStats = {
  id: string;
  name: string;
  convocado: number;
  presencas: number;
  minutos_totais: number;
  media_minutos: number;
  percentagem: number;
};

export default function Estatisticas() {
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [members, setMembers] = useState<MemberStats[]>([]);
  const [loading, setLoading] = useState(true);

  const [params] = useSearchParams();
  const gameId = params.get("gameId");

  async function loadTeamStats() {
    const { data, error } = await supabase.rpc("get_team_stats");
    if (!error && data && data.length > 0) {
      setTeamStats(data[0]);
    }
  }

  async function loadMemberStats() {
    const { data, error } = await supabase
      .from("member_stats")
      .select("*")
      .order("percentagem", { ascending: false });

    if (!error && data) setMembers(data);
  }

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      await loadTeamStats();
      await loadMemberStats();
      setLoading(false);
    }
    loadAll();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">Estatísticas</h1>

      {loading && <p>A carregar...</p>}

      {!loading && (
        <>
          {/* ESTATÍSTICAS GERAIS */}
          {teamStats && (
            <div className="bg-primary text-white p-4 rounded shadow mb-6">
              <h2 className="text-lg font-bold mb-2">Estatísticas da Equipa</h2>

              <p><strong>Jogos totais:</strong> {teamStats.jogos}</p>
              <p><strong>Jogos já realizados:</strong> {teamStats.jogos_jogados}</p>
              <p><strong>Média de convocados:</strong> {teamStats.media_convocados?.toFixed(1)}</p>
              <p><strong>Média de presenças:</strong> {teamStats.media_presencas?.toFixed(1)}</p>
              <p><strong>Assiduidade global:</strong> {teamStats.assiduidade_global?.toFixed(1)}%</p>
            </div>
          )}

          {/* RANKING DE ASSIDUIDADE */}
          <div className="bg-secondary text-primary p-4 rounded shadow mb-6">
            <h2 className="text-lg font-bold mb-3">Ranking de Assiduidade</h2>

            {members.length === 0 && <p>Nenhum dado disponível.</p>}

            <div className="space-y-3">
              {members.map((m, i) => (
                <div
                  key={m.id}
                  className="p-3 bg-white text-black rounded shadow border border-gray-300"
                >
                  <p className="font-bold">
                    {i + 1}. {m.name}
                  </p>
                  <p><strong>Convocado:</strong> {m.convocado}</p>
                  <p><strong>Presenças:</strong> {m.presencas}</p>
                  <p><strong>Minutos:</strong> {m.minutos_totais}</p>
                  <p><strong>Assiduidade:</strong> {m.percentagem?.toFixed(1)}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* ESTATÍSTICAS DE UM JOGO ESPECÍFICO (SE VIER gameId) */}
          {gameId && (
            <div className="bg-yellow-100 text-black p-4 rounded shadow">
              <h2 className="text-lg font-bold mb-2">Estatísticas do Jogo</h2>
              <p>Em breve: estatísticas específicas do jogo {gameId}.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
