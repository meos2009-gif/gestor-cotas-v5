import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

interface Game {
  id: string;
  game_date: string;
  opponent: string;
  local: string | null;
  goals_home: number | null;
  goals_away: number | null;
}

export default function Jogos() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<string | null>(null);
  const [golosFafe, setGolosFafe] = useState<number | null>(null);
  const [golosAdv, setGolosAdv] = useState<number | null>(null);

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

  async function guardarResultado(id: string) {
    const home =
      golosFafe === null || golosFafe === "" ? null : Number(golosFafe);
    const away =
      golosAdv === null || golosAdv === "" ? null : Number(golosAdv);

    const { error } = await supabase
      .from("games")
      .update({
        goals_home: home,
        goals_away: away,
      })
      .eq("id", id);

    if (error) {
      console.error("Erro Supabase:", error.message);
      alert("Erro ao gravar: " + error.message);
      return;
    }

    setGames((prev) =>
      prev.map((g) =>
        g.id === id
          ? { ...g, goals_home: home, goals_away: away }
          : g
      )
    );

    setEditing(null);
  }

  if (loading) return <p className="p-6">A carregar jogos...</p>;

  // -----------------------------
  // 📊 ESTATÍSTICAS DA ÉPOCA
  // -----------------------------
  const jogosComResultado = games.filter(
    (g) => g.goals_home !== null && g.goals_away !== null
  );

  const vitorias = jogosComResultado.filter(
    (g) => g.goals_home! > g.goals_away!
  ).length;

  const empates = jogosComResultado.filter(
    (g) => g.goals_home! === g.goals_away!
  ).length;

  const derrotas = jogosComResultado.filter(
    (g) => g.goals_home! < g.goals_away!
  ).length;

  const golosMarcados = jogosComResultado.reduce(
    (acc, g) => acc + (g.goals_home || 0),
    0
  );

  const golosSofridos = jogosComResultado.reduce(
    (acc, g) => acc + (g.goals_away || 0),
    0
  );

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-secondary">Jogos</h2>

      {/* 📊 ESTATÍSTICAS */}
      <div className="bg-secondary text-white p-4 rounded-lg mb-6 shadow-md">
        <h3 className="text-xl font-bold mb-2">Estatísticas da Época</h3>

        <p><strong>Vitórias:</strong> {vitorias}</p>
        <p><strong>Empates:</strong> {empates}</p>
        <p><strong>Derrotas:</strong> {derrotas}</p>

        <p className="mt-2"><strong>Golos Marcados:</strong> {golosMarcados}</p>
        <p><strong>Golos Sofridos:</strong> {golosSofridos}</p>

        <p className="mt-2">
          <strong>Diferença de Golos:</strong> {golosMarcados - golosSofridos}
        </p>
      </div>

      {/* LISTA DE JOGOS */}
      {games.map((g) => {
        const isHome = (g.local || "").toUpperCase() === "FAFE";
        const temResultado = g.goals_home != null && g.goals_away != null;

        const cor =
          !temResultado
            ? "text-gray-400"
            : g.goals_home! > g.goals_away!
            ? "text-green-400"
            : g.goals_home! < g.goals_away!
            ? "text-red-400"
            : "text-yellow-400";

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

            {/* RESULTADO */}
            <div className={`mt-3 font-bold ${cor}`}>
              {temResultado ? (
                <p>
                  Fafe A60 {g.goals_home} – {g.goals_away} {g.opponent}
                </p>
              ) : (
                <p>Por jogar</p>
              )}
            </div>

            {/* EDITAR RESULTADO INLINE */}
            {editing === g.id ? (
              <div className="mt-3 flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Fafe"
                  className="w-16 p-1 rounded bg-white text-black"
                  value={golosFafe ?? ""}
                  onChange={(e) =>
                    setGolosFafe(
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                />
                <span className="font-bold">–</span>
                <input
                  type="number"
                  placeholder="Adv"
                  className="w-16 p-1 rounded bg-white text-black"
                  value={golosAdv ?? ""}
                  onChange={(e) =>
                    setGolosAdv(
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                />

                <button
                  onClick={() => guardarResultado(g.id)}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Guardar
                </button>

                <button
                  onClick={() => setEditing(null)}
                  className="bg-gray-500 text-white px-3 py-1 rounded"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setEditing(g.id);
                  setGolosFafe(g.goals_home);
                  setGolosAdv(g.goals_away);
                }}
                className="mt-3 inline-block bg-accent text-white px-4 py-2 rounded-md"
              >
                Inserir Resultado
              </button>
            )}

            {/* CONVOCATÓRIA */}
            <Link
              to={`/jogos/${g.id}`}
              className="mt-3 inline-block bg-secondary text-white px-4 py-2 rounded-md ml-2"
            >
              Abrir Convocatória
            </Link>
          </div>
        );
      })}
    </div>
  );
}
