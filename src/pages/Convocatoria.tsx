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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

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

    loadData();
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

  if (loading) return <p style={{ padding: 20 }}>A carregar...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Convocatória</h2>

      {jogadores.map((j) => (
        <div
          key={j.id}
          style={{
            border: "1px solid #ccc",
            padding: 12,
            marginBottom: 12,
            borderRadius: 8,
          }}
        >
          <h3>{j.name}</h3>

          <label>
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
            />
            Disponível
          </label>
        </div>
      ))}

      <button
        onClick={guardar}
        disabled={saving}
        style={{
          padding: "10px 20px",
          fontSize: 16,
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        {saving ? "A guardar..." : "Guardar Convocatória"}
      </button>
    </div>
  );
}
