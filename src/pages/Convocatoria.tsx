import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Convocatoria() {
  const { gameId } = useParams();
  const [jogo, setJogo] = useState(null);

  useEffect(() => {
    async function fetchGame() {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("id", gameId)
        .single();

      if (!error) setJogo(data);
    }

    fetchGame();
  }, [gameId]);

  if (!jogo) return <p className="p-6">A carregar...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Convocatória</h1>

      <div className="bg-primary text-white p-4 rounded shadow">
        <p className="text-lg font-bold">{jogo.opponent}</p>
        <p>{jogo.date}</p>
        <p>{jogo.local || "—"}</p>
        <p className="text-sm">{jogo.competition}</p>
      </div>

      {jogo.goals_home !== null && jogo.goals_away !== null && (
        <div className="mt-6 bg-secondary text-primary p-4 rounded shadow">
          <h2 className="font-bold text-lg mb-2">Resultado</h2>
          <p className="text-xl font-semibold">
            Fafe {jogo.goals_home} - {jogo.goals_away} {jogo.opponent}
          </p>
        </div>
      )}
    </div>
  );
}
