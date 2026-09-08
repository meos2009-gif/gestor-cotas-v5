import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Resultado() {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const [golosCasa, setGolosCasa] = useState("");
  const [golosFora, setGolosFora] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const handleSave = () => {
    // Aqui podes enviar para Supabase se quiseres
    console.log("Resultado guardado:", {
      gameId,
      golosCasa,
      golosFora,
      observacoes
    });

    navigate(`/jogos/${gameId}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Inserir Resultado</h1>

      <p className="text-sm text-gray-400 mb-4">
        Jogo ID: {gameId}
      </p>

      <div className="space-y-4">

        <div>
          <label className="block mb-1">Golos Fafe</label>
          <input
            type="number"
            value={golosCasa}
            onChange={(e) => setGolosCasa(e.target.value)}
            className="border p-2 rounded w-full bg-white text-black"
          />
        </div>

        <div>
          <label className="block mb-1">Golos Adversário</label>
          <input
            type="number"
            value={golosFora}
            onChange={(e) => setGolosFora(e.target.value)}
            className="border p-2 rounded w-full bg-white text-black"
          />
        </div>

        <div>
          <label className="block mb-1">Observações</label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            className="border p-2 rounded w-full bg-white text-black"
            rows={4}
          />
        </div>

        <button
          onClick={handleSave}
          className="bg-secondary text-primary px-4 py-2 rounded hover:bg-accent"
        >
          Guardar Resultado
        </button>

      </div>
    </div>
  );
}
