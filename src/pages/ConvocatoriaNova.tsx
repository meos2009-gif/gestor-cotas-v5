import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../supabaseClient";

export default function ConvocatoriaNova() {
  const { gameId } = useParams();
  const gameIdNum = Number(gameId); // ← CORREÇÃO IMPORTANTE

  const [jogadores, setJogadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Carregar jogadores + estatísticas do jogo
  useEffect(() => {
    async function loadData() {
      setLoading(true);

      // 1) Buscar jogadores
      const { data: players, error: playersError } = await supabase
        .from("players")
        .select("*")
        .order("name", { ascending: true });

      if (playersError) {
        console.error("Erro ao carregar jogadores:", playersError);
        setLoading(false);
        return;
      }

      // 2) Buscar estatísticas deste jogo
      const { data: stats, error: statsError } = await supabase
        .from("game_stats")
        .select("*")
        .eq("game_id", gameIdNum); // ← CORREÇÃO

      if (statsError) {
        console.error("Erro ao carregar estatísticas:", statsError);
        setLoading(false);
        return;
      }

      // 3) Combinar jogadores com estatísticas
      const jogadoresComStats = players.map((p) => {
        const s = stats.find((x) => x.player_id === p.id);
        return {
          id: p.id,
          name: p.name,
          disponivel: s ? s.disponivel : false,
          capitao: s ? s.capitao : false,
          minutos: s ? s.minutos : 0,
          golos: s ? s.golos : 0,
        };
      });

      setJogadores(jogadoresComStats);
      setLoading(false);
    }

    loadData();
  }, [gameIdNum]);

  // Atualizar campo de um jogador
  function updateField(playerId, field, value) {
    setJogadores((prev) =>
      prev.map((j) =>
        j.id === playerId ? { ...j, [field]: value } : j
      )
    );
  }

  // Guardar estatísticas
  async function guardar() {
    setSaving(true);

    for (const j of jogadores) {
      const { error } = await supabase
        .from("game_stats")
        .upsert({
          game_id: gameIdNum, // ← CORREÇÃO
          player_id: j.id,
          disponivel: j.disponivel,
          capitao: j.capitao,
          minutos: j.minutos,
          golos: j.golos,
        });

      if (error) {
        console.error("Erro ao guardar:", error);
        alert("Erro ao guardar estatísticas.");
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    alert("ESTATISTICAS CORRETA");
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
                updateField(j.id, "disponivel", e.target.checked)
              }
            />
            Disponível
          </label>

          <br />

          <label>
            <input
              type="checkbox"
              checked={j.capitao}
              onChange={(e) =>
                updateField(j.id, "capitao", e.target.checked)
              }
            />
            Capitão
          </label>

          <br />

          <label>
            Minutos:{" "}
            <input
              type="number"
              value={j.minutos}
              onChange={(e) =>
                updateField(j.id, "minutos", Number(e.target.value))
              }
              style={{ width: 60 }}
            />
          </label>

          <br />

          <label>
            Golos:{" "}
            <input
              type="number"
              value={j.golos}
              onChange={(e) =>
                updateField(j.id, "golos", Number(e.target.value))
              }
              style={{ width: 60 }}
            />
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
        {saving ? "A guardar..." : "Guardar Estatísticas"}
      </button>
    </div>
  );
}
