import { useEffect, useState, useMemo } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";

interface SubGame {
  opponent: string;
  hora?: string;
  goals_home?: number | null;
  goals_away?: number | null;
}

interface Game {
  id: string;
  opponent: string;
  location: string;
  competition: string;
  goals_home: number | null;
  goals_away: number | null;
  game_date: string | null;
  season: string;
  subGames?: SubGame[];
}

export default function Calendario2026_27() {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    async function loadGames() {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("season", "26/27")
        .order("game_date", { ascending: true });

      if (error) {
        console.error("Erro ao carregar jogos:", error);
        return;
      }

      // INJETAR SUB-JOGOS APENAS NO TORNEIO
      const jogosComSub = (data || []).map((g) => {
        if (g.opponent === "TORNEIO DE CANAS DE SENHORIM") {
          return {
            ...g,
            subGames: [
              {
                opponent: "CANAS DE SENHORIM - FAFE",
                hora: "10:00",
                goals_home: 2,
                goals_away: 1
              },
              {
                opponent: "FAFE - C.A. MOLELOS",
                hora: "11:30",
                goals_home: 1,
                goals_away: 1
              }
            ]
          };
        }
        return g;
      });

      setGames(jogosComSub);
    }

    loadGames();
  }, []);

  // -----------------------------
  // CÁLCULO DAS ESTATÍSTICAS (AGORA INCLUI SUB-JOGOS)
  // -----------------------------
  const stats = useMemo(() => {
    let vitorias = 0;
    let empates = 0;
    let derrotas = 0;
    let golosMarcados = 0;
    let golosSofridos = 0;

    games.forEach((g) => {
      // JOGOS NORMAIS
      if (
        g.goals_home !== null &&
        g.goals_away !== null &&
        !(g.goals_home === 0 && g.goals_away === 0)
      ) {
        golosMarcados += g.goals_home;
        golosSofridos += g.goals_away;

        if (g.goals_home > g.goals_away) vitorias++;
        else if (g.goals_home === g.goals_away) empates++;
        else derrotas++;
      }

      // SUB-JOGOS DO TORNEIO
      if (g.subGames) {
        g.subGames.forEach((sj) => {
          if (
            sj.goals_home !== null &&
            sj.goals_away !== null
          ) {
            golosMarcados += sj.goals_home;
            golosSofridos += sj.goals_away;

            if (sj.goals_home > sj.goals_away) vitorias++;
            else if (sj.goals_home === sj.goals_away) empates++;
            else derrotas++;
          }
        });
      }
    });

    const jogosComResultado = vitorias + empates + derrotas;
    const pontos = vitorias * 3 + empates * 1;
    const diferenca = golosMarcados - golosSofridos;

    return {
      vitorias,
      empates,
      derrotas,
      golosMarcados,
      golosSofridos,
      diferenca,
      pontos,
      jogosComResultado,
    };
  }, [games]);

  // -----------------------------
  // COR DO CARTÃO POR RESULTADO
  // -----------------------------
  function getCardColor(g: Game) {
    if (g.goals_home === null || g.goals_away === null) return "bg-primary";

    if (g.goals_home > g.goals_away) return "bg-green-700 border-green-500";
    if (g.goals_home === g.goals_away) return "bg-yellow-600 border-yellow-400";
    return "bg-red-700 border-red-500";
  }

  return (
    <div className="p-6 mt-6">
      <h2 className="text-3xl font-bold mb-4 text-secondary">Época 2026/27</h2>

      {/* ESTATÍSTICAS DA ÉPOCA */}
      <div className="mb-6 p-4 bg-secondary text-primary rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-2">Estatísticas da Época</h3>

        <p><strong>Vitórias:</strong> {stats.vitorias}</p>
        <p><strong>Empates:</strong> {stats.empates}</p>
        <p><strong>Derrotas:</strong> {stats.derrotas}</p>

        <p className="mt-2"><strong>Golos Marcados:</strong> {stats.golosMarcados}</p>
        <p><strong>Golos Sofridos:</strong> {stats.golosSofridos}</p>
        <p><strong>Diferença de Golos:</strong> {stats.diferenca}</p>

        <p className="mt-2"><strong>Pontos Totais:</strong> {stats.pontos}</p>
        <p><strong>Jogos com Resultado:</strong> {stats.jogosComResultado}</p>
      </div>

      {/* LISTA DE JOGOS */}
      {games.length === 0 && (
        <p className="opacity-70">Nenhum jogo encontrado para esta época.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {games.map((g) => (
          <div
            key={g.id}
            className={`border p-4 rounded-lg shadow-md ${getCardColor(g)}`}
          >
            <h3 className="text-xl font-semibold text-white">{g.opponent}</h3>

            <p className="opacity-80 text-white">
              {g.game_date ? g.game_date : "Data não registada"}
            </p>

            <p className="font-bold text-white">
              {g.location ? g.location : "Local não registado"}
            </p>

            {/* RESULTADO DO JOGO PRINCIPAL */}
            {(g.goals_home !== null && g.goals_away !== null && (g.goals_home > 0 || g.goals_away > 0)) ? (
              <div className="mt-3 p-3 bg-white text-black rounded">
                <p className="font-bold">
                  Fafe {g.goals_home} - {g.goals_away} {g.opponent}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm opacity-60 text-white">Sem resultado registado</p>
            )}

            {/* SUB-JOGOS DO TORNEIO */}
            {g.subGames && (
              <div className="mt-3 bg-white text-black p-3 rounded">
                <p className="font-bold mb-2">Jogos do Torneio:</p>

                {g.subGames.map((sj, idx) => (
                  <div key={idx} className="border-b border-gray-300 py-2">
                    <p className="font-semibold">{sj.opponent}</p>
                    {sj.hora && <p className="text-sm">Hora: {sj.hora}</p>}

                    {/* Resultado do sub-jogo */}
                    {(sj.goals_home !== null && sj.goals_away !== null) ? (
                      <p className="mt-1 font-bold">
                        Fafe {sj.goals_home} - {sj.goals_away} {sj.opponent}
                      </p>
                    ) : (
                      <p className="text-sm opacity-60">Sem resultado</p>
                    )}

                    {/* Botão de convocatória do sub-jogo */}
                    <Link
                      to={`/convocatoria/${g.id}?sub=${idx}`}
                      className="inline-block mt-2 bg-accent hover:bg-secondary text-white px-3 py-1 rounded-md text-sm"
                    >
                      Convocatória
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* BOTÕES DO JOGO PRINCIPAL */}
            <div className="flex gap-3 mt-4">
              <Link
                to={`/convocatoria/${g.id}`}
                className="bg-accent hover:bg-secondary text-white px-4 py-2 rounded-md"
              >
                Convocatória
              </Link>

              <Link
                to={`/resultado/${g.id}`}
                className="bg-secondary hover:bg-accent text-white px-4 py-2 rounded-md"
              >
                Resultado
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
