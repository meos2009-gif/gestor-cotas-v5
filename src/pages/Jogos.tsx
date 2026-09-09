import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";

export default function Jogos({ season }) {
  const [games, setGames] = useState([]);

  useEffect(() => {
    async function loadGames() {
      const { data } = await supabase
        .from("games")
        .select("*")
        .eq("season", season)
        .order("date", { ascending: true });

      setGames(data || []);
    }

    loadGames();
  }, [season]);

  return (
    <div className="p-6 mt-6">
      <h2 className="text-3xl font-bold mb-4 text-secondary">
        Jogos {season}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {games.map((g) => (
          <Link
            key={g.id}
            to={`/convocatoria/${g.id}`}
            className="border border-secondary bg-primary p-4 rounded-lg shadow-md"
          >
            <h3 className="text-xl font-semibold">{g.opponent}</h3>
            <p className="opacity-80">{g.date}</p>
            <p className="font-bold">{g.local}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
