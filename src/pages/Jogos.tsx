import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const jogos2025_26 = [
  { id: 1, data: "2025-09-20", adversario: "TAIPAS", local: "FAFE" },
  { id: 2, data: "2025-09-27", adversario: "VILA REAL", local: "V. REAL" },
  { id: 3, data: "2025-10-04", adversario: "MOURISQUENSE", local: "FAFE" },
  { id: 4, data: "2025-10-18", adversario: "BEIRA VOUGA", local: "AVEIRO" },
  { id: 5, data: "2025-11-01", adversario: "MONDINENSE 2008", local: "MONDIM" },
  { id: 6, data: "2025-11-15", adversario: "SABROSA", local: "FAFE" },
  { id: 7, data: "2025-11-29", adversario: "TAIPAS", local: "TAIPAS" },
  { id: 8, data: "2025-12-13", adversario: "P. BRANDAO", local: "FAFE" },
  { id: 9, data: "2025-12-20", adversario: "JANTAR DE NATAL", local: "" },

  { id: 10, data: "2026-01-10", adversario: "UNIDOS ORIENTAL", local: "FAFE" },
  { id: 11, data: "2026-01-24", adversario: "VILA REAL", local: "FAFE" },
  { id: 12, data: "2026-02-07", adversario: "BEIRA VOUGA", local: "FAFE" },
  { id: 13, data: "2026-02-21", adversario: "MONDINENSE 2008", local: "MONDIM" },
  { id: 14, data: "2026-03-07", adversario: "SABROSA", local: "SABROSA" },
  { id: 15, data: "2026-03-21", adversario: "TAIPAS", local: "FAFE" },
  { id: 16, data: "2026-04-11", adversario: "MOURISQUENSE", local: "MOURISCA" },
  { id: 17, data: "2026-04-25", adversario: "TORNEIO CIDADE DE FAFE", local: "" },
  { id: 18, data: "2026-05-09", adversario: "P. BRANDAO", local: "P. BRANDAO" },
  { id: 19, data: "2026-05-23", adversario: "CANAS DE SENHORIM", local: "FAFE" }
];

export default function Calendario2025_26() {
  const [ano, setAno] = useState("");
  const [mes, setMes] = useState("");
  const navigate = useNavigate();

  const proximoJogo = useMemo(() => {
    const hoje = new Date();
    return jogos2025_26.find(j => new Date(j.data) >= hoje);
  }, []);

  const jogosFiltrados = jogos2025_26.filter((j) => {
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
      <h1 className="text-xl font-bold mb-4">Calendário 2025/2026</h1>

      {proximoJogo && (
        <div className="bg-secondary text-primary p-4 rounded mb-6 shadow">
          <h2 className="text-lg font-bold">Próximo Jogo</h2>
          <p className="mt-2 font-semibold">{proximoJogo.adversario}</p>
          <p>{proximoJogo.data}</p>
          <p className="text-sm">{proximoJogo.local || "—"}</p>
        </div>
      )}

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

        {jogosFiltrados.length === 0 && (
          <p className="text-gray-500">Nenhum jogo encontrado.</p>
        )}
      </div>
    </div>
  );
}
