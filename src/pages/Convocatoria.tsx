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

  async function loadGame() {
    const { data } = await supabase
      .from("games")
      .select("*")
      .eq("id", gameId)
      .single();

    if (data) setGame(data);
  }

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

  async function ensureRow(memberId: string) {
    const { data: rows } = await supabase
      .from("game_attendance")
      .select("id")
      .eq("game_id", gameId)
      .eq("member_id", memberId);

    if (!rows || rows.length === 0) {
      await supabase.from("game_attendance").insert({
        game_id: gameId,
        member_id: memberId,
        called: true, // DISPONÍVEL POR DEFEITO
        present: false,
        minutes: 0,
        goals: 0,
        captain: false
      });

      await new Promise((r) => setTimeout(r, 150));
    }
  }

  async function updateField(memberId: string, field: string, value: any) {
    setAttendance((prev) => {
      const current = prev[memberId] ?? {
        member_id: memberId,
        called: true,
        present: false,
        minutes: 0,
        goals: 0,
        captain: false
      };

      return {
        ...prev,
        [memberId]: { ...current, [field]: value }
      };
    });

    await ensureRow(memberId);

    const { data: row } = await supabase
      .from("game_attendance")
      .select("id")
      .eq("game_id", gameId)
      .eq("member_id", memberId)
      .maybeSingle();

    if (!row) return;

    await supabase
      .from("game_attendance")
      .update({ [field]: value })
      .eq("id", row.id);

    await supabase.rpc("update_member_stats_v30");
  }

  async function setCaptain(memberId: string) {
    await supabase
      .from("game_attendance")
      .update({ captain: false })
      .eq("game_id", gameId);

    await ensureRow(memberId);

    const { data: row } = await supabase
      .from("game_attendance")
      .select("id")
      .eq("game_id", gameId)
      .eq("member_id", memberId)
      .maybeSingle();

    if (!row) return;

    await supabase
      .from("game_attendance")
      .update({ captain: true })
      .eq("id", row.id);

    await supabase.rpc("update_member_stats_v30");

    setAttendance((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((id) => {
        updated[id].captain = id === memberId;
      });
      return updated;
    });
  }

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

      {game && (
        <div className="flex gap-6 mb-6 bg-secondary text-primary p-4 rounded shadow">
          <label className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={game.goals_home ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                updateGame("goals_home", v === "" ? null : Number(v));
              }}
              className="w-20 p-1 text-black rounded"
            />
            Golos Fafe
          </label>

          <label className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={game.goals_away ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                updateGame("goals_away", v === "" ? null : Number(v));
              }}
              className="w-20 p-1 text-black rounded"
            />
            Golos Adversário
          </label>
        </div>
      )}

      <div className="space-y-4">
        {members.map((m) => {
          const att = attendance[m.id] ?? {
            member_id: m.id,
            called: true,
            present: false,
            minutes: 0,
            goals: 0,
            captain: false
          };

          return (
            <div
              key={m.id}
              className="p-4 bg-primary text-white rounded shadow border border-gray-700"
            >
              <h2 className="text-lg font-bold flex items-center gap-2">
                {m.name}

                {att.captain && (
                  <span className="px-2 py-1 bg-yellow-500 text-black rounded text-sm">
                    Capitão
                  </span>
                )}

                {!att.captain && att.called && (
                  <button
                    onClick={() => setCaptain(m.id)}
                    className="ml-2 px-2 py-1 bg-yellow-600 rounded text-black hover:bg-yellow-500"
                  >
                    Tornar Capitão
                  </button>
                )}
              </h2>

              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={att.called}
                  onChange={(e) =>
                    updateField(m.id, "called", e.target.checked)
                  }
                />
                Disponível
              </label>

              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={att.present}
                  disabled={!att.called}
                  onChange={(e) =>
                    updateField(m.id, "present", e.target.checked)
                  }
                />
                Presente
              </label>

              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() =>
                    updateField(m.id, "minutes", Math.max(0, att.minutes - 1))
                  }
                  disabled={!att.called}
                  className="px-2 bg-gray-600 rounded disabled:opacity-40"
                >
                  -
                </button>

                <input
                  type="number"
                  min={0}
                  max={90}
                  value={att.minutes}
                  disabled={!att.called}
                  onChange={(e) =>
                    updateField(m.id, "minutes", Number(e.target.value))
                  }
                  className="w-20 p-1 text-black rounded text-center disabled:opacity-40"
                />

                <button
                  onClick={() =>
                    updateField(m.id, "minutes", att.minutes + 1)
                  }
                  disabled={!att.called}
                  className="px-2 bg-gray-600 rounded disabled:opacity-40"
                >
                  +
                </button>

                <span>Minutos</span>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() =>
                    updateField(m.id, "goals", Math.max(0, att.goals - 1))
                  }
                  disabled={!att.called}
                  className="px-2 bg-gray-600 rounded disabled:opacity-40"
                >
                  -
                </button>

                <input
                  type="number"
                  min={0}
                  value={att.goals}
                  disabled={!att.called}
                  onChange={(e) =>
                    updateField(m.id, "goals", Number(e.target.value))
                  }
                  className="w-20 p-1 text-black rounded text-center disabled:opacity-40"
                />

                <button
                  onClick={() =>
                    updateField(m.id, "goals", att.goals + 1)
                  }
                  disabled={!att.called}
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
