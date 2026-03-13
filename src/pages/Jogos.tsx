import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

interface Player {
  id: string;
  name: string;
  disponivel: boolean;
}

export default function Convocatoria() {
  const { gameId } = useParams();
  const [jogadores, setJogadores] = useState<Player[]>([]);
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadGame() {
      const { data } = await supabase
        .from("games")
        .select("*")
        .eq("id", gameId)
        .single();

      setGame(data);
    }

    async function loadPlayers() {
      const { data: players } = await supabase
        .from("members")
        .select("*")
        .order("name", { ascending: true });

      const { data: stats } = await supabase
        .from("game_attendance")
        .select("*")
        .eq("game_id", gameId);

      const lista = (players || []).map((p) => {
        const s = stats?.find((x) => x.member_id === p.id);
        return {
          id: p.id,
          name: p.name,
          disponivel: s?.called ?? false,
        };
      });

      setJogadores(lista);
      setLoading(false);
    }

    loadGame();
    loadPlayers();
  }, [gameId]);

  async function guardar() {
    setSaving(true);

    for (const j of jogadores) {
      await supabase.from("game_attendance").upsert(
        {
          game_id: gameId,
          member_id: j.id,
          member_name: j.name,
          called: j.disponivel,
        },
        { onConflict: "game_id,member_id" }
      );
    }

    setSaving(false);
    alert("Convocatória guardada!");
  }

  if (loading) return <p className="p-6 mt-6">A carregar...</p>;

  const isHome = game?.local?.toUpperCase() === "FAFE";
  const convocados = jogadores.filter((j) => j.disponivel).length;

  return (
    <div className="p-6 mt-6">
      <h2 className="text-3xl font-bold mb-2 text-secondary">Convocatória</h2>

      {game && (
        <div className="mb-6 text-lg opacity-80">
          <div><strong>Jogo:</strong> {game.opponent}</div>
          <div><strong>Data:</strong> {game.game_date}</div>
          <div
            style={{
              color: isHome ? "#0A1A2F" : "#D97904",
              fontWeight: "bold",
            }}
          >
            {isHome ? "Casa" : "Fora"} — {game.local}
          </div>

          <div className="mt-2 text-xl font-bold">
            {convocados} convocados
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jogadores.map((j) => (
          <div
            key={j.id}
            className="border border-secondary bg-primary p-4 rounded-lg shadow-md flex justify-between items-center"
          >
            <h3 className="text-lg font-semibold">{j.name}</h3>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={j.disponivel}
                onChange={(e) =>
                  setJogadores((prev) =>
                    prev.map((x) =>
                      x.id === j.id
                        ? { ...x, disponivel: e.target.checked }
                        : x
                    )
                  )
                }
                className="w-5 h-5"
              />
              Disponível
            </label>
          </div>
        ))}
      </div>

      <button
        onClick={guardar}
        disabled={saving}
        className="mt-8 bg-accent hover:bg-secondary text-white px-6 py-3 rounded-md text-lg shadow-md"
      >
        {saving ? "A guardar..." : "Guardar Convocatória"}
      </button>
    </div>
  );
}
