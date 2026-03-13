import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

interface Player {
  id: string;
  name: string;
  disponivel: boolean;
  goals: number;
  minutes: number;
  captain: boolean;
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
          goals: s?.goals ?? 0,
          minutes: s?.minutes ?? 0,
          captain: s?.captain ?? false,
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
          called: j.disponivel,
          goals: j.goals,
          minutes: j.minutes,
          captain: j.captain,
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
            className="border border-secondary bg-primary p-4 rounded-lg shadow-md"
          >
            <h3 className="text-lg font-semibold mb-2">{j.name}</h3>

            {/* Disponível */}
            <label className="flex items-center gap-2 text-sm mb-2">
              <input
                type="checkbox"
                checked={j.disponivel}
                onChange={(e) =>
                  setJogadores((prev) =>
                    prev.map((x) => {
                      if (x.id !== j.id) return x;

                      const disponivel = e.target.checked;

                      return {
                        ...x,
                        disponivel,
                        minutes: disponivel ? 80 : 0, // regra pedida
                      };
                    })
                  )
                }
                className="w-5 h-5"
              />
              Disponível
            </label>

            {/* Capitão */}
            <label className="flex items-center gap-2 text-sm mb-2">
              <input
                type="checkbox"
                checked={j.captain}
                onChange={(e) =>
                  setJogadores((prev) =>
                    prev.map((x) => {
                      if (x.id === j.id) {
                        return { ...x, captain: e.target.checked };
                      }
                      return { ...x, captain: false };
                    })
                  )
                }
                className="w-5 h-5"
              />
              Capitão
            </label>

            {/* Golos e Minutos */}
            <div className="flex gap-4 mt-2">
              <div>
                <label className="text-sm">Golos</label>
                <input
                  type="number"
                  value={j.goals}
                  onChange={(e) =>
                    setJogadores((prev) =>
                      prev.map((x) =>
                        x.id === j.id
                          ? { ...x, goals: Number(e.target.value) }
                          : x
                      )
                    )
                  }
                  className="w-20 p-1 border rounded"
                />
              </div>

              <div>
                <label className="text-sm">Minutos</label>
                <input
                  type="number"
                  value={j.minutes}
                  onChange={(e) =>
                    setJogadores((prev) =>
                      prev.map((x) =>
                        x.id === j.id
                          ? { ...x, minutes: Number(e.target.value) }
                          : x
                      )
                    )
                  }
                  className="w-20 p-1 border rounded"
                />
              </div>
            </div>
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
