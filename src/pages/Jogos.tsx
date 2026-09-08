import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const jogos2025_26 = [
  {
    id: 1,
    data: "2025-09-20",
    adversario: "TAIPAS",
    local: "FAFE",
    convocatoria: ["Jogador A", "Jogador B", "Jogador C"],
    golos_fafe: 2,
    golos_adv: 1,
    observacoes: "Bom jogo, domínio total."
  },
  {
    id: 2,
    data: "2025-09-27",
    adversario: "VILA REAL",
    local: "V. REAL",
    convocatoria: ["Jogador A", "Jogador D"],
    golos_fafe: 0,
    golos_adv: 3,
    observacoes: "Jogo difícil fora."
  },
  {
    id: 3,
    data: "2025-10-04",
    adversario: "MOURISQUENSE",
    local: "FAFE",
    convocatoria: ["Jogador A", "Jogador B"],
    golos_fafe: 4,
    golos_adv: 0,
    observacoes: "Grande vitória!"
  },

  // … (continua igual ao teu calendário)
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

              {/* RESULTADO */}
              <p className="mt-2 font-semibold">
                Resultado: Fafe {j.golos_fafe} - {j.golos_adv} {j.adversario}
              </p>

              {/* OBSERVAÇÕES */}
              <p className="text-sm italic">{j.observacoes}</p>

              {/* CONVOCATÓRIA */}
              <div className="mt-3">
                <p className="font-bold">Convocatória:</p>
                <ul className="list-disc ml-6">
                  {j.convocatoria.map((nome, idx) => (
                    <li key={idx}>{nome}</li>
                  ))}
                </ul>
              </div>

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
