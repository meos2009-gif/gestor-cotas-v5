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
};

export default function Convocatoria() {
  const { gameId } = useParams();
  const [members, setMembers] = useState<Member[]>([]);
  const [attendance, setAttendance] = useState<Record<string, Attendance>>({});

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
          goals: a.goals ?? 0
        };
      });
      setAttendance(map);
    }
  }

  useEffect(() => {
    loadData();
  }, [gameId]);

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

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Convocatória</h1>

      <div className="space-y-4">
        {members.map((m) => {
          const att = attendance[m.id] || {
            called: true,
            present: false,
            minutes: 0,
            goals: 0
          };

          return (
            <div
              key={m.id}
              className="p-4 bg-primary text-white rounded shadow border border-gray-700"
            >
              <h2 className="text-lg font-bold">{m.name}</h2>

              {/* Disponível / Indisponível */}
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={!att.called}
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
                  onChange={(e) =>
                    updateField(m.id, "present", e.target.checked)
                  }
                />
                Presente
              </label>

              {/* Minutos */}
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  min={0}
                  max={90}
                  value={att.minutes}
                  onChange={(e) =>
                    updateField(m.id, "minutes", Number(e.target.value))
                  }
                  className="w-20 p-1 text-black rounded"
                />
                Minutos
              </label>

              {/* Golos */}
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  min={0}
                  value={att.goals}
                  onChange={(e) =>
                    updateField(m.id, "goals", Number(e.target.value))
                  }
                  className="w-20 p-1 text-black rounded"
                />
                Golos
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
