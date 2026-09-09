import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";

interface Game {
  id: string;
  opponent: string;
  date: string;
  local: string;
  season: string;
}

interface Resultado {
  game_id: string;
  golos_fafe: number;
  golos_adversario: number;
  observacoes: string;
}

export default function Calendario2025_26() {
  const [games, setGames] = useState<Game[]>([]);
  const [resultados, setResultados] = useState<Resultado[]>([]);

  useEffect(() => {
    async function loadGames() {
      const { data } = await supabase
        .from("games")
        .select("*")
        .eq("season", "25/26")
        .order("date", { ascending: true });

      setGames(data || []);
    }

    async function loadResultados() {
      const { data } = await supabase
        .from("game_results")
        .select("*");

      setResultados(data || []);
    }

    loadGames();
    loadResultados();
  }, []);

  function getResultado(gameId: string) {
    return resultados.find((r) => r.game_id === gameId);
  }

  return (
    <div className="p-6 mt-6">
      <h2 className="text-3xl font-bold mb-4 text-secondary">Época 2025/26</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {games.map((g) => {
          const r = getResultado(g.id);

          return (
            <div
              key={g.id}
              className="border border-secondary bg-primary p-4 rounded-lg shadow-md"
            >
              <h3 className="text-xl font-semibold">{g.opponent}</h3>
              <p className="opacity-80">{g.date}</p>
              <p className="font-bold">{g.local}</p>

              {/* RESULTADO DA BD */}
              {r ? (
                <div className="mt-3 p-3 bg-secondary text-primary rounded">
                  <p className="font-bold">
                    Fafe {r.golos_fafe} - {r.golos_adversario} {g.opponent}
                  </p>
                  {r.observacoes && (
                    <p className="text-sm opacity-80 mt-1">
                      {r.observacoes}
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-sm opacity-60">Sem resultado</p>
              )}

              {/* BOTÕES */}
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
          );
        })}
      </div>
    </div>
  );
}
