import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useParams } from "react-router-dom";

type Member = {
  id: string;
  name: string;
};

type Attendance = {
  member_id: string;
  called: boolean;
  present: boolean;
  minutes: number;
  goals: number;
  captain: boolean;
};

export default function Convocatoria() {
  const { gameId } = useParams();

  const [members, setMembers] = useState<Member[]>([]);
  const [attendance, setAttendance] = useState<Record<string, Attendance>>({});
  const [game, setGame] = useState<any>(null);

  // Carregar jogo
  async function loadGame() {
    const { data } = await supabase
      .from("games")
      .select("*")
      .eq("id", gameId)
      .single();

    if (data) setGame(data);
  }

  // Carregar membros e convocatória
  async function loadData() {
    const { data: membersData } = await supabase
      .from("members")
      .select("*")
      .order("name", { ascending: true });

    const { data: attData } = await supabase
      .from("game_attendance")
      .select("*")
      .eq("game_id", gameId);

    if (membersData) setMembers(membersData);

    if (attData) {
      const map: Record<string, Attendance> = {};
      attData.forEach((a) => {
        map[a.member_id] = {
          member_id: a.member_id,
          called: a.called,
          present: a.present,
          minutes: a.minutes,
          goals: a.goals ?? 0,
          captain: a.captain ?? false
        };
      });
      setAttendance(map);
    }
  }

  useEffect(() => {
    loadGame();
    loadData();
  }, [gameId]);

  // Atualizar campos normais
  async function updateField(memberId: string, field: string, value: any) {
    setAttendance((prev) => ({
      ...prev,
      [memberId]: { ...prev[memberId], [field]: value }
    }));

    await supabase
      .from("game_attendance")
      .update({ [field]: value })
      .eq("game_id", gameId)
      .eq("member_id", memberId);
  }

  // Garantir que só existe 1 capitão
  async function setCaptain(memberId: string) {
    // 1. remover capitão de todos
    await supabase
      .from("game_attendance")
      .update({ captain: false })
      .eq("game_id", gameId);

    // 2. definir o novo capitão
    await supabase
      .from("game_attendance")
      .update({ captain: true })
      .eq("game_id", gameId)
      .eq("member_id", memberId);

    // 3. atualizar estado local
    setAttendance((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((id) => {
        updated[id].captain = id === memberId;
      });
      return updated;
    });
  }

  // Atualizar resultado
  async function updateGame(field: string, value: number) {
    await supabase
      .from("games")
      .update({ [field]: value })
      .eq("id", gameId);

    setGame((prev: any) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Convocatória</h1>

      {/* Resultado */}
      {game && (
        <div className="flex gap-6 mb-6 bg-secondary text-primary p-4 rounded shadow">
          <label className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={game.goals_home ?? 0}
              onChange={(e) => updateGame("goals_home", Number(e.target.value))}
              className="w-20 p-1 text-black rounded"
            />
            Golos Fafe
          </label>

          <label className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={game.goals_away ?? 0}
              onChange={(e) => updateGame("goals_away", Number(e.target.value))}
              className="w-20 p-1 text-black rounded"
            />
            Golos Adversário
          </label>
        </div>
      )}

      {/* Lista */}
      <div className="space-y-4">
        {members.map((m) => {
          const att = attendance[m.id] || {
            called: true,
            present: false,
            minutes: 0,
            goals: 0,
            captain: false
          };

          const indisponivel = !att.called;

          return (
            <div
              key={m.id}
              className="p-4 bg-primary text-white rounded shadow border border-gray-700"
            >
              {/* Nome + Capitão + Botão */}
              <h2 className="text-lg font-bold flex items-center gap-2">
                {m.name}

                {att.captain && (
                  <span className="px-2 py-1 bg-yellow-500 text-black rounded text-sm">
                    Capitão
                  </span>
                )}

                {!att.captain && !indisponivel && (
                  <button
                    onClick={() => setCaptain(m.id)}
                    className="ml-2 px-2 py-1 bg-yellow-600 rounded text-black hover:bg-yellow-500"
                  >
                    Tornar Capitão
                  </button>
                )}
              </h2>

              {/* Indisponível */}
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={indisponivel}
                  onChange={(e) =>
                    updateField(m.id, "called", !e.target.checked)
                  }
                />
                Indisponível
              </label>

              {/* Presente */}
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={att.present}
                  disabled={indisponivel}
                  onChange={(e) =>
                    updateField(m.id, "present", e.target.checked)
                  }
                />
                Presente
              </label>

              {/* Minutos */}
              <div className="flex items-center gap-2 mt-2 opacity-100">
                <button
                  onClick={() =>
                    updateField(m.id, "minutes", Math.max(0, att.minutes - 1))
                  }
                  disabled={indisponivel}
                  className="px-2 bg-gray-600 rounded disabled:opacity-40"
                >
                  -
                </button>

                <input
                  type="number"
                  min={0}
                  max={90}
                  value={att.minutes}
                  disabled={indisponivel}
                  onChange={(e) =>
                    updateField(m.id, "minutes", Number(e.target.value))
                  }
                  className="w-20 p-1 text-black rounded text-center disabled:opacity-40"
                />

                <button
                  onClick={() =>
                    updateField(m.id, "minutes", att.minutes + 1)
                  }
                  disabled={indisponivel}
                  className="px-2 bg-gray-600 rounded disabled:opacity-40"
                >
                  +
                </button>

                <span>Minutos</span>
              </div>

              {/* Golos */}
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() =>
                    updateField(m.id, "goals", Math.max(0, att.goals - 1))
                  }
                  disabled={indisponivel}
                  className="px-2 bg-gray-600 rounded disabled:opacity-40"
                >
                  -
                </button>

                <input
                  type="number"
                  min={0}
                  value={att.goals}
                  disabled={indisponivel}
                  onChange={(e) =>
                    updateField(m.id, "goals", Number(e.target.value))
                  }
                  className="w-20 p-1 text-black rounded text-center disabled:opacity-40"
                />

                <button
                  onClick={() =>
                    updateField(m.id, "goals", att.goals + 1)
                  }
                  disabled={indisponivel}
                  className="px-2 bg-gray-600 rounded disabled:opacity-40"
                >
                  +
                </button>

                <span>Golos</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
