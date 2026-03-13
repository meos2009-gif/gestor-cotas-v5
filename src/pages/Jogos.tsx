import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

interface Game {
  id: string;
  game_date: string;
  opponent: string;
  local: string | null;
}

export default function Jogos() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGames() {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .order("game_date", { ascending: true });

      if (error) {
        console.error("Erro ao carregar jogos:", error);
        return;
      }

      setGames(data || []);
      setLoading(false);
    }

    loadGames();
  }, []);

  if (loading) return <p className="p-6">A carregar jogos...</p>;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-secondary">Jogos</h2>

      {games.map((g) => {
        const isHome = (g.local || "").toUpperCase() === "FAFE";

        return (
          <div
            key={g.id}
            className="border border-secondary bg-primary p-4 rounded-lg shadow-md mb-4"
          >
            <h3 className="text-xl font-bold">{g.opponent}</h3>
            <p>{g.game_date}</p>

            {g.local && (
              <p
                className="text-sm mt-1 font-semibold"
                style={{
                  color: isHome ? "#0A1A2F" : "#D97904",
                }}
              >
                {isHome ? "Casa" : "Fora"} — {g.local}
              </p>
            )}

            {/* ESTE BOTÃO É O QUE FALTAVA */}
            <Link
              to={`/jogos/${g.id}`}
              className="mt-3 inline-block bg-accent text-white px-4 py-2 rounded-md"
            >
              Abrir Convocatória
            </Link>
          </div>
        );
      })}
    </div>
  );
}
