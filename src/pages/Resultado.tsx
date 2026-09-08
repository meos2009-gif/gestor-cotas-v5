import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Resultado() {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const [golosCasa, setGolosCasa] = useState("");
  const [golosFora, setGolosFora] = useState("");
  const [observacoes, setObservacoes] = useState("");

  async function guardarResultado() {
    await supabase
      .from("games")
      .update({
        goals_home: Number(golosCasa),
        goals_away: Number(golosFora),
        local: observacoes
      })
      .eq("id", gameId);

    navigate(`/jogos/${gameId}`);
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Inserir Resultado</h1>

      <div className="space-y-4">
        <input
          type="number"
          placeholder="Golos Fafe"
          value={golosCasa}
          onChange={(e) => setGolosCasa(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <input
          type="number"
          placeholder="Golos Adversário"
          value={golosFora}
          onChange={(e) => setGolosFora(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <textarea
          placeholder="Observações"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <button
          onClick={guardarResultado}
          className="bg-primary text-white px-4 py-2 rounded"
        >
          Guardar Resultado
        </button>
      </div>
    </div>
  );
}
