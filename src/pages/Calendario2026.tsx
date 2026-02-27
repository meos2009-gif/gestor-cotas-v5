import { useMemo, useState } from "react";

const jogos2026_27 = [
  { data: "2026-09-12", adversario: "UNIDOS ORIENTAL", local: "PORTO" },
  { data: "2026-09-19", adversario: "TORNEIO TRIANGULAR (a)", local: "C. SENHORIM" },
  { data: "2026-09-26", adversario: "GIL VICENTE", local: "FAFE" },
  { data: "2026-10-03", adversario: "TAIPAS", local: "TAIPAS" },
  { data: "2026-10-10", adversario: "FERROVIÁRIO FONTAINHAS", local: "FAFE" },
  { data: "2026-10-24", adversario: "BEIRA VOUGA", local: "AVEIRO" },
  { data: "2026-11-07", adversario: "SABROSA", local: "FAFE" },
  { data: "2026-11-21", adversario: "VILA REAL", local: "V. REAL" },
  { data: "2026-12-12", adversario: "P. BRANDAO", local: "P. BRANDAO" },
  { data: "2026-12-19", adversario: "JANTAR DE NATAL", local: "" },

  { data: "2027-01-09", adversario: "MONDINENSE 2008", local: "FAFE" },
  { data: "2027-01-23", adversario: "MOURISQUENSE", local: "FAFE" },
  { data: "2027-02-13", adversario: "UNIDOS ORIENTAL", local: "FAFE" },
  { data: "2027-02-27", adversario: "P. BRANDAO", local: "FAFE" },
  { data: "2027-03-13", adversario: "SABROSA", local: "SABROSA" },
  { data: "2027-03-20", adversario: "VILA REAL", local: "FAFE" },
  { data: "2027-04-10", adversario: "MOURISQUENSE", local: "MOURISCA" },
  { data: "2027-04-24", adversario: "TORNEIO CIDADE DE FAFE", local: "" },
  { data: "2027-05-08", adversario: "BEIRA VOUGA", local: "FAFE" },
  { data: "2027-05-22", adversario: "MONDINENSE 2008", local: "MONDIM" },
  { data: "2027-06-10", adversario: "VIAGEM", local: "" },
  { data: "2027-06-26", adversario: "CANAS DE SENHORIM", local: "FAFE" }
];

export default function Calendario2026() {
  const [ano, setAno] = useState("");
  const [mes, setMes] = useState("");

  const proximoJogo = useMemo(() => {
    const hoje = new Date();
    return jogos2026_27.find(j => new Date(j.data) >= hoje);
  }, []);

  const jogosFiltrados = jogos2026_27.filter((j) => {
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
      <h1 className="text-xl font-bold mb-4">Calendário 2026/2027</h1>

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
