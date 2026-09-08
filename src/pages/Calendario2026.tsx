import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Calendario2026() {
  const [jogos, setJogos] = useState([]);
  const [ano, setAno] = useState("");
  const [mes, setMes] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchGames() {
      const { data } = await supabase
        .from("games")
        .select("*")
        .order("date", { ascending: true });

      const filtrados = data.filter((g) => {
        const d = new Date(g.date);
        return d >= new Date("2026-09-01") && d <= new Date("2027-08-31");
      });

      setJogos(filtrados);
    }

    fetchGames();
  }, []);

  const proximoJogo = useMemo(() => {
    const hoje = new Date();
    return jogos.find((j) => new Date(j.date) >= hoje);
  }, [jogos]);

  const jogosFiltrados = jogos.filter((j) => {
    const d = new Date(j.date);
    const anoJogo = d.getFullYear().toString();
    const mesJogo = String(d.getMonth() + 1).padStart(2, "0");

    return (
      (ano === "" || ano === anoJogo) &&
      (mes === "" || mes === mesJogo)
    );
  });

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Calendário 2026/2027</h1>

      {proximoJogo && (
        <div className="bg-secondary text-primary p-4 rounded mb-6 shadow">
          <h2 className="text-lg font-bold">Próximo Jogo</h2>
          <p className="mt-2 font-semibold">{proximoJogo.opponent}</p>
          <p>{proximoJogo.date}</p>
          <p>{proximoJogo.local || "—"}</p>
        </div>
      )}

      <div className="flex space-x-4 mb-6">
        <select
          value={ano}
          onChange={(e) => setAno(e.target.value)}
          className="border p-2 rounded bg-white text-black"
        >
          <option value="">Todos os anos</option>
          <option value="2026">2026</option>
          <option value="2027">2027</option>
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

      <div className="space-y-3">
        {jogosFiltrados.map((j) => {
          const isCasa = j.local?.toUpperCase() === "FAFE";

          return (
            <div
              key={j.id}
              className="p-4 bg-primary text-white rounded shadow border border-gray-700"
            >
              <p className="text-lg font-bold">{j.opponent}</p>
              <p>{j.date}</p>
              <p className={isCasa ? "text-green-400" : "text-red-400"}>
                {isCasa ? "Casa" : "Fora"} — {j.local || "—"}
              </p>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => navigate(`/jogos/${j.id}`)}
                  className="bg-secondary text-primary px-3 py-1 rounded hover:bg-accent"
                >
                  Convocatória
                </button>

                <button
                  onClick={() => navigate(`/resultado/${j.id}`)}
                  className="bg-accent text-white px-3 py-1 rounded hover:bg-secondary"
                >
                  Inserir Resultado
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
