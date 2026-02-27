import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";

// JOGOS ESTÁTICOS 2025
const jogos2025 = [
  { data: "2025-09-13", adversario: "MARINHAS", local: "MARINHAS" },
  { data: "2025-09-27", adversario: "MOURISQUENSE", local: "FAFE" },
  { data: "2025-10-11", adversario: "AMIGOS S.ROMÃO", local: "S.ROMÃO" },
  { data: "2025-10-25", adversario: "PESQUEIRA", local: "FAFE" },
  { data: "2025-11-08", adversario: "TORCATENSE", local: "S.TORCATO" },
  { data: "2025-11-15", adversario: "MARINHAS", local: "FAFE" },
  { data: "2025-11-22", adversario: "MONDINENSE", local: "MONDIM" },
  { data: "2025-12-13", adversario: "VILA REAL", local: "FAFE" },
  { data: "2025-12-20", adversario: "Jantar de Natal", local: "" }
];

// JOGOS ESTÁTICOS 2026
const jogos2026 = [
  { data: "2026-01-10", adversario: "AMIGOS S.ROMÃO", local: "FAFE" },
  { data: "2026-01-17", adversario: "PALMEIRAS", local: "PALMEIRAS" },
  { data: "2026-01-31", adversario: "GIL VICENTE", local: "BARCELOS" },
  { data: "2026-02-07", adversario: "FERROVIÁRIO FONTAINHAS", local: "P.VARZIM" },
  { data: "2026-02-21", adversario: "MONDINENSE", local: "FAFE" },
  { data: "2026-02-28", adversario: "BUSTELO", local: "BUSTELO" },
  { data: "2026-03-07", adversario: "TAIPAS *", local: "FAFE" },
  { data: "2026-03-14", adversario: "VILA REAL", local: "VILA REAL" },
  { data: "2026-03-28", adversario: "VISTA ALEGRE", local: "FAFE" },
  { data: "2026-04-11", adversario: "PESQUEIRA", local: "PESQUEIRA" },
  { data: "2026-04-25", adversario: "TORNEIO CIDADE DE FAFE", local: "" },
  { data: "2026-05-09", adversario: "PALMEIRAS", local: "FAFE" },
  { data: "2026-05-23", adversario: "MOURISQUENSE", local: "MOURISCA" },
  { data: "2026-06-20", adversario: "VISTA ALEGRE", local: "AVEIRO" },
  { data: "2026-06-27", adversario: "BUSTELO", local: "FAFE" }
];

const jogosEstaticos = [...jogos2025, ...jogos2026];

type GameDB = {
  id: string;
  game_date: string;
  opponent: string;
  location: string | null;
  competition: string | null;
};

export default function Calendario() {
  const [ano, setAno] = useState("");
  const [mes, setMes] = useState("");
  const [jogosDB, setJogosDB] = useState<GameDB[]>([]);
  const navigate = useNavigate();

  async function loadJogosDB() {
    const { data } = await supabase
      .from("games")
      .select("*")
      .order("game_date", { ascending: true });

    if (data) setJogosDB(data);
  }

  useEffect(() => {
    loadJogosDB();
  }, []);

  // Junta jogos estáticos + jogos da BD
  const jogosCompletos = useMemo(() => {
    const convertidosDB = jogosDB.map(j => ({
      data: j.game_date,
      adversario: j.opponent,
      local: j.location || "",
      id: j.id
    }));

    const convertidosEstaticos = jogosEstaticos.map(j => ({
      ...j,
      id: null
    }));

    return [...convertidosDB, ...convertidosEstaticos].sort(
      (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
    );
  }, [jogosDB]);

  // Próximo jogo
  const proximoJogo = useMemo(() => {
    const hoje = new Date();
    return jogosCompletos.find(j => new Date(j.data) >= hoje);
  }, [jogosCompletos]);

  // Filtros
  const jogosFiltrados = jogosCompletos.filter((j) => {
    const d = new Date(j.data);
    const anoJogo = d.getFullYear().toString();
    const mesJogo = String(d.getMonth() + 1).padStart(2, "0");

    return (
      (ano === "" || ano === anoJogo) &&
      (mes === "" || mes === mesJogo)
    );
  });

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Calendário de Jogos</h1>

      {/* Estatísticas gerais */}
      <button
        onClick={() => navigate("/estatisticas")}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Estatísticas da Equipa
      </button>

      {/* Próximo jogo */}
      {proximoJogo && (
        <div className="bg-secondary text-primary p-4 rounded mb-6 shadow">
          <h2 className="text-lg font-bold">Próximo Jogo</h2>
          <p className="mt-2 font-semibold">{proximoJogo.adversario}</p>
          <p>{proximoJogo.data}</p>
          <p className="text-sm">{proximoJogo.local || "—"}</p>
        </div>
      )}

      {/* Filtros */}
      <div className="flex space-x-4 mb-6">
        <select
          value={ano}
          onChange={(e) => setAno(e.target.value)}
          className="border p-2 rounded bg-white text-black"
        >
          <option value="">Todos os anos</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>

        <select
          value={mes}
          onChange={(e) => setMes(e.target.value)}
          className="border p-2 rounded bg-white text-black"
        >
          <option value="">Todos os meses</option>
          {[
            ["01", "Jan"], ["02", "Fev"], ["03", "Mar"], ["04", "Abr"],
            ["05", "Mai"], ["06", "Jun"], ["07", "Jul"], ["08", "Ago"],
            ["09", "Set"], ["10", "Out"], ["11", "Nov"], ["12", "Dez"]
          ].map(([v, label]) => (
            <option key={v} value={v}>{label}</option>
          ))}
        </select>
      </div>

      {/* Lista de jogos */}
      <div className="space-y-3">
        {jogosFiltrados.map((j, i) => {
          const isCasa = j.local.toUpperCase() === "FAFE";

          return (
            <div
              key={i}
              className="p-4 bg-primary text-white rounded shadow border border-gray-700"
            >
              <p className="text-lg font-bold">{j.adversario}</p>
              <p>{j.data}</p>
              <p className={isCasa ? "text-green-400" : "text-red-400"}>
                {isCasa ? "Casa" : "Fora"} — {j.local || "—"}
              </p>

              {/* Botões apenas para jogos da BD */}
              {j.id && (
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => navigate(`/convocatoria/${j.id}`)}
                    className="px-3 py-1 bg-yellow-500 text-black rounded"
                  >
                    Convocatória
                  </button>

                  <button
                    onClick={() => navigate(`/estatisticas?gameId=${j.id}`)}
                    className="px-3 py-1 bg-blue-500 text-white rounded"
                  >
                    Estatísticas
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {jogosFiltrados.length === 0 && (
          <p className="text-gray-500">Nenhum jogo encontrado.</p>
        )}
      </div>
    </div>
  );
}
