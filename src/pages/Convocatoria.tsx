import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useParams } from "react-router-dom";

type Member = {
  id: string;
  name: string;
};

type Attendance = {
  id: string;
  member_id: string;
  called: boolean;
  present: boolean;
  minutes: number;
};

export default function Convocatoria() {
  const { gameId } = useParams();
  const [members, setMembers] = useState<Member[]>([]);
  const [attendance, setAttendance] = useState<Record<string, Attendance>>({});
  const [loading, setLoading] = useState(true);

  async function loadMembers() {
    const { data } = await supabase
      .from("members")
      .select("id, name")
      .order("name", { ascending: true });

    if (data) setMembers(data);
  }

  async function loadAttendance() {
    const { data } = await supabase
      .from("game_attendance")
      .select("*")
      .eq("game_id", gameId);

    if (!data || data.length === 0) {
      await createInitialAttendance();
      return loadAttendance();
    }

    const map: Record<string, Attendance> = {};
    data.forEach((a) => (map[a.member_id] = a));
    setAttendance(map);
  }

  async function createInitialAttendance() {
    const inserts = members.map((m) => ({
      game_id: gameId,
      member_id: m.id,
      called: true,
      present: false,
      minutes: 0,
    }));

    await supabase.from("game_attendance").insert(inserts);
  }

  async function updateField(memberId: string, field: string, value: any) {
    const att = attendance[memberId];
    if (!att) return;

    const updated = { ...att, [field]: value };
    setAttendance((prev) => ({ ...prev, [memberId]: updated }));

    await supabase
      .from("game_attendance")
      .update({ [field]: value })
      .eq("id", att.id);
  }

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      await loadMembers();
      setLoading(false);
    }
    loadAll();
  }, []);

  useEffect(() => {
    if (members.length > 0) loadAttendance();
  }, [members]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Convocatória</h1>

      {loading && <p>A carregar...</p>}

      {!loading && (
        <div className="space-y-3">
          {members.map((m) => {
            const att = attendance[m.id];

            return (
              <div
                key={m.id}
                className="p-4 bg-primary text-white rounded shadow border border-gray-700"
              >
                <p className="text-lg font-bold">{m.name}</p>

                {att && (
                  <div className="mt-3 space-y-2">
                   
<label className="flex items-center gap-2">
  <input
    type="checkbox"
    checked={!att.called}
    onChange={(e) =>
      updateField(m.id, "called", !e.target.checked)
    }
  />
  Indisponível
</label>

<label className="flex items-center gap-2">
  <input
    type="checkbox"
    checked={att.present}
    onChange={(e) =>
      updateField(m.id, "present", e.target.checked)
    }
  />
  Presente
</label>

                    <div>
                      <label className="block mb-1">Minutos jogados</label>
                      <input
                        type="number"
                        value={att.minutes}
                        onChange={(e) =>
                          updateField(m.id, "minutes", Number(e.target.value))
                        }
                        className="p-1 rounded text-black w-20"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
