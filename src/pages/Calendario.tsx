import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";

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

  // Apenas jogos da BD
  const jogosCompletos = useMemo(() => {
    return jogosDB
      .map(j => ({
        data: j.game_date,
        adversario: j.opponent,
        local: j.location || "",
        id: j.id
      }))
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
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
        {jogosFiltrados.map((j) => {
          const isCasa = j.local.toUpperCase() === "FAFE";

          return (
            <div
              key={j.id}
              className="p-4 bg-primary text-white rounded shadow border border-gray-700"
            >
              <p className="text-lg font-bold">{j.adversario}</p>
              <p>{j.data}</p>
              <p className={isCasa ? "text-green-400" : "text-red-400"}>
                {isCasa ? "Casa" : "Fora"} — {j.local || "—"}
              </p>

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
