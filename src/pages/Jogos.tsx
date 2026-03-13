import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

interface Game {
  id: string;
  game_date: string;
  opponent: string;
  local: string | null;
  golos_fafe: number | null;
  golos_adv: number | null;
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
    const { error } = await supabase
      .from("games")
      .update({
        golos_fafe: golosFafe,
        golos_adv: golosAdv,
      })
      .eq("id", id);

    if (error) {
      console.error("Erro ao guardar resultado:", error);
      return;
    }

    // Atualizar lista localmente
    setGames((prev) =>
      prev.map((g) =>
        g.id === id
          ? { ...g, golos_fafe: golosFafe, golos_adv: golosAdv }
          : g
      )
    );

    setEditing(null);
  }

  if (loading) return <p className="p-6">A carregar jogos...</p>;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-secondary">Jogos</h2>

      {games.map((g) => {
        const isHome = (g.local || "").toUpperCase() === "FAFE";
        const temResultado = g.golos_fafe != null && g.golos_adv != null;

        const cor =
          !temResultado
            ? "text-gray-400"
            : g.golos_fafe! > g.golos_adv!
            ? "text-green-400"
            : g.golos_fafe! < g.golos_adv!
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
                  Fafe A60 {g.golos_fafe} – {g.golos_adv} {g.opponent}
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
                  onChange={(e) => setGolosFafe(Number(e.target.value))}
                />
                <span className="font-bold">–</span>
                <input
                  type="number"
                  placeholder="Adv"
                  className="w-16 p-1 rounded bg-white text-black"
                  value={golosAdv ?? ""}
                  onChange={(e) => setGolosAdv(Number(e.target.value))}
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
                  setGolosFafe(g.golos_fafe);
                  setGolosAdv(g.golos_adv);
                }}
                className="mt-3 inline-block bg-accent text-white px-4 py-2 rounded-md"
              >
                Inserir Resultado
              </button>
            )}

            {/* BOTÃO EXISTENTE */}
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
