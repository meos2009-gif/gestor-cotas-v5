import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Attendance {
  member_name: string;
  called: boolean;
  present: boolean;
  minutes: number | string | null;
  goals: number | string | null;
  captain: boolean;
}

export default function Convocatoria() {
  const { gameId } = useParams();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gameId) return;
    fetchAttendance();
  }, [gameId]);

  async function fetchAttendance() {
    const { data, error } = await supabase
      .from("game_attendance")
      .select("*")
      .eq("game_id", gameId);

    if (error) {
      console.error("Erro ao carregar convocatória:", error);
      return;
    }

    setAttendance(
      data.map((row) => ({
        member_name: row.member_name,
        called: row.called ?? false,
        present: row.present ?? false,
        minutes: row.minutes ?? 0,
        goals: row.goals ?? 0,
        captain: row.captain ?? false,
      }))
    );

    setLoading(false);
  }

  async function atualizarEstatisticas() {
    for (const a of attendance) {
      const payload = {
        p_member_name: a.member_name,
        p_convocado: !!a.called,
        p_presente: !!a.present,
        p_minutos: Number(a.minutes) || 0,
        p_golos: Number(a.goals) || 0,
        p_capitao: !!a.captain,
      };

      const { error } = await supabase.rpc("update_member_stats", payload);
      if (error) console.error("Erro no RPC:", error);
    }

    alert("Estatísticas atualizadas!");
  }

  function updateField(index: number, field: keyof Attendance, value: any) {
    const updated = [...attendance];
    updated[index][field] = value;
    setAttendance(updated);
  }

  if (loading) return <p>A carregar...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Convocatória</h1>

      {attendance.map((a, index) => (
        <div key={index} className="border p-4 mb-3 rounded">
          <h2 className="font-semibold">{a.member_name}</h2>

          <label className="block mt-2">
            <input
              type="checkbox"
              checked={a.called}
              onChange={(e) => updateField(index, "called", e.target.checked)}
            />
            Disponível
          </label>

          <label className="block mt-2">
            <input
              type="checkbox"
              checked={a.captain}
              onChange={(e) => updateField(index, "captain", e.target.checked)}
            />
            Capitão
          </label>

          <label className="block mt-2">
            Minutos:
            <input
              type="number"
              value={a.minutes ?? 0}
              onChange={(e) => updateField(index, "minutes", e.target.value)}
              className="border ml-2 p-1 w-20"
            />
          </label>

          <label className="block mt-2">
            Golos:
            <input
              type="number"
              value={a.goals ?? 0}
              onChange={(e) => updateField(index, "goals", e.target.value)}
              className="border ml-2 p-1 w-20"
            />
          </label>
        </div>
      ))}

      <button
        onClick={atualizarEstatisticas}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
      >
        Atualizar Estatísticas
      </button>
    </div>
  );
}
