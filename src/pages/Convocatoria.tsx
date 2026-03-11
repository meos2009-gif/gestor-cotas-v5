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
};

export default function Convocatoria() {
  const { gameId } = useParams();
  console.log("GAME ID =", gameId); // 
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

    const map: Record<string, Attendance> = {};
    attData?.forEach((a) => {
      map[a.member_id] = {
        member_id: a.member_id,
        called: a.called,
        present: a.present ?? a.called ?? false,
      };
    });

    setAttendance(map);
  }

  useEffect(() => {
    loadData();
  }, [gameId]);

  async function ensureRow(memberId: string) {
    const { data } = await supabase
      .from("game_attendance")
      .select("id")
      .eq("game_id", gameId)
      .eq("member_id", memberId);

    if (!data || data.length === 0) {
      await supabase.from("game_attendance").insert({
        game_id: gameId,
        member_id: memberId,
        called: true,
        present: true,
      });

      await new Promise((r) => setTimeout(r, 150));
    }
  }

  async function updateCalled(memberId: string, value: boolean) {
    setAttendance((prev) => ({
      ...prev,
      [memberId]: { member_id: memberId, called: value, present: value },
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
      .update({ called: value, present: value })
      .eq("id", row.id);
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Convocatória (versão mínima)</h1>

      <div className="space-y-4">
        {members.map((m) => {
          const att = attendance[m.id] ?? {
            member_id: m.id,
            called: true,
            present: true,
          };

          return (
            <div
              key={m.id}
              className="p-4 bg-primary text-white rounded shadow border border-gray-700"
            >
              <h2 className="text-lg font-bold">{m.name}</h2>

              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={att.called}
                  onChange={(e) => updateCalled(m.id, e.target.checked)}
                />
                Disponível
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
