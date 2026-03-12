import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

type Member = {
  id: string;
  name: string;
};

type Attendance = {
  member_id: string;
  called: boolean;
  present: boolean;
  captain: boolean;
  minutes: number | null;
  goals: number | null;
};

export default function Convocatoria() {
  const { gameId } = useParams();
  const [members, setMembers] = useState<Member[]>([]);
  const [attendance, setAttendance] = useState<Record<string, Attendance>>({});

  console.log("GAME ID =", gameId);

  useEffect(() => {
    loadMembers();
    loadAttendance();
  }, [gameId]);

  async function loadMembers() {
    const { data } = await supabase.from("members").select("*").order("name");
    if (data) setMembers(data);
  }

  async function loadAttendance() {
    const { data } = await supabase
      .from("game_attendance")
      .select("*")
      .eq("game_id", gameId);

    const map: Record<string, Attendance> = {};

    data?.forEach((a) => {
      map[a.member_id] = {
        member_id: a.member_id,
        called: a.called ?? false,
        present: a.present ?? a.called ?? false,
        captain: a.captain ?? false,
        minutes: a.minutes ?? null,
        goals: a.goals ?? null,
      };
    });

    setAttendance(map);
  }

  async function ensureRow(memberId: string) {
    const { data: existing } = await supabase
      .from("game_attendance")
      .select("id")
      .eq("game_id", gameId)
      .eq("member_id", memberId)
      .maybeSingle();

    if (!existing) {
      await supabase.from("game_attendance").insert({
        game_id: gameId,
        member_id: memberId,
        called: false,
        present: false,
        captain: false,
        minutes: null,
        goals: null,
      });
    }
  }

  async function updateField(memberId: string, field: string, value: any) {
    setAttendance((prev) => ({
      ...prev,
      [memberId]: { ...prev[memberId], [field]: value },
    }));

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
  }

  async function toggleCalled(memberId: string, value: boolean) {
    updateField(memberId, "called", value);
    updateField(memberId, "present", value);

    if (value) {
      updateField(memberId, "minutes", 80); // minutos por defeito
    } else {
      updateField(memberId, "minutes", null); // limpa minutos
    }
  }

  async function setCaptain(memberId: string) {
    await ensureRow(memberId);

    await supabase
      .from("game_attendance")
      .update({ captain: false })
      .eq("game_id", gameId);

    await supabase
      .from("game_attendance")
      .update({ captain: true })
      .eq("game_id", gameId)
      .eq("member_id", memberId);

    setAttendance((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((id) => {
        updated[id].captain = id === memberId;
      });
      return updated;
    });
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Convocatória (versão completa)</h1>

      {members.map((m) => {
        const att = attendance[m.id] ?? {
          member_id: m.id,
          called: false,
          present: false,
          captain: false,
          minutes: null,
          goals: null,
        };

        return (
          <div key={m.id} className="border p-3 mb-3 rounded bg-white text-black">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{m.name}</span>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={att.called}
                  onChange={(e) => toggleCalled(m.id, e.target.checked)}
                />
                Disponível
              </label>
            </div>

            <div className="mt-2 flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={att.captain}
                  onChange={() => setCaptain(m.id)}
                />
                Capitão
              </label>

              <label className="flex items-center gap-2">
                Minutos:
                <input
                  type="number"
                  value={att.minutes ? att.minutes : ""}
                  onChange={(e) =>
                    updateField(
                      m.id,
                      "minutes",
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                  className="w-20 text-black border px-1"
                />
              </label>

              <label className="flex items-center gap-2">
                Golos:
                <input
                  type="number"
                  value={att.goals ? att.goals : ""}
                  onChange={(e) =>
                    updateField(
                      m.id,
                      "goals",
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                  className="w-20 text-black border px-1"
                />
              </label>
            </div>
          </div>
        );
      })}
    </div>
  );
}
