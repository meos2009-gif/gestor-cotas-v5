import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

interface Game {
  id: string;
  game_date: string;
  opponent: string;
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

  if (loading) return <p style={{ padding: 20 }}>A carregar jogos...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Jogos</h2>

      {games.length === 0 && (
        <p>Nenhum jogo encontrado. Adiciona um jogo no Supabase.</p>
      )}

      {games.map((g) => (
        <div
          key={g.id}
          style={{
            border: "1px solid #ccc",
            padding: 12,
            marginBottom: 12,
            borderRadius: 8,
          }}
        >
          <h3>{g.opponent}</h3>
          <p>{g.game_date}</p>

          <Link
            to={`/convocatoria/${g.id}`}
            style={{
              padding: "8px 12px",
              background: "#007bff",
              color: "white",
              borderRadius: 6,
              textDecoration: "none",
            }}
          >
            Abrir Convocatória
          </Link>
        </div>
      ))}
    </div>
  );
}
