import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "../supabaseClient";

type Member = {
  id: string;
  name: string;
};

type Payment = {
  id?: string;
  member_id: string;
  year: number;
  month: number;
};

export default function Relatorio() {
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    load();
  }, [year]);

  async function load() {
    setError("");
    setSuccess("");

    try {
      const { data: membersData, error: membersError } = await supabase
        .from("members")
        .select("*")
        .order("name", { ascending: true });

      if (membersError) throw membersError;

      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .eq("year", year);

      if (paymentsError) throw paymentsError;

      setMembers(membersData || []);
      setPayments(paymentsData || []);
    } catch (err: any) {
      console.error("Erro no relatório:", err);
      setError(err.message || "Erro ao carregar dados.");
    }
  }

  function normalizeName(name: string): string {
    if (!name) return "";
    let n = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    n = n.replace(/[.\-_,]/g, " ");
    n = n.replace(/\s+/g, " ");
    n = n.trim().toLowerCase();
    return n;
  }

  function handleFileUpload(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setSuccess("");

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setError("O ficheiro deve ser .xlsx ou .xls");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      const workbook = XLSX.read(data as string, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

      const header = json[0];
      const expectedNorm = [
        "nome", "jan", "fev", "mar", "abr", "mai", "jun",
        "jul", "ago", "set", "out", "nov", "dez",
      ];

      if (!header || header.length < expectedNorm.length) {
        setError("O ficheiro não tem as colunas necessárias (Nome, Jan, Fev, ..., Dez).");
        return;
      }

      const normalizeHeader = (v: any) =>
        v ? v.toString().trim().replace(".", "").toLowerCase() : "";

      for (let i = 0; i < expectedNorm.length; i++) {
        const got = normalizeHeader(header[i]);
        if (got !== expectedNorm[i]) {
          setError(
            `Coluna inválida na posição ${i + 1}: esperado "${expectedNorm[i]}", encontrado "${header[i]}".`
          );
          return;
        }
      }

      for (let i = 1; i < json.length; i++) {
        const row = json[i];
        if (!row || !row[0]) {
          setError(`Linha ${i + 1} não tem nome.`);
          return;
        }

        for (let m = 1; m <= 12; m++) {
          const cell = row[m]?.toString().toLowerCase();
          if (cell && cell !== "pago" && cell !== "-" && cell !== "—") {
            setError(
              `Valor inválido na linha ${i + 1}, coluna ${header[m]}: "${row[m]}".`
            );
            return;
          }
        }
      }

      (async () => {
        try {
          await syncExcelToSupabase(json);
          setSuccess("Importação concluída e guardada no sistema.");
          setYear(2025);
          await load();
        } catch (err: any) {
          console.error("Erro ao importar:", err);
          setError(err.message || "Erro ao importar ficheiro.");
        }
      })();
    };

    reader.readAsBinaryString(file);
  }

  async function syncExcelToSupabase(rows: any[][]) {
    const yearToImport = 2025;

    const { data: existingMembers, error: membersError } = await supabase
      .from("members")
      .select("*");

    if (membersError) throw membersError;

    const memberMap = new Map<string, Member>();
    (existingMembers || []).forEach((m: any) => {
      memberMap.set(normalizeName(m.name), m);
    });

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rawName = row[0];
      if (!rawName) continue;

      const norm = normalizeName(rawName.toString());
      if (!norm) continue;

      let member = memberMap.get(norm);

      if (!member) {
        const { data: inserted, error: insertError } = await supabase
          .from("members")
          .insert({ name: rawName.toString().trim() })
          .select()
          .single();

        if (insertError) throw insertError;
        member = inserted as Member;
        memberMap.set(norm, member);
      } else {
        if (member.name !== rawName.toString().trim()) {
          const { data: updated, error: updateError } = await supabase
            .from("members")
            .update({ name: rawName.toString().trim() })
            .eq("id", member.id)
            .select()
            .single();

          if (updateError) throw updateError;
          member = updated as Member;
          memberMap.set(norm, member);
        }
      }

      for (let m = 1; m <= 12; m++) {
        const cell = row[m]?.toString().toLowerCase();
        if (cell === "pago") {
          await ensurePayment(member.id, yearToImport, m);
        }
      }
    }
  }

  async function ensurePayment(memberId: string, year: number, month: number) {
    const { data: existing, error: selectError } = await supabase
      .from("payments")
      .select("id")
      .eq("member_id", memberId)
      .eq("year", year)
      .eq("month", month)
      .maybeSingle();

    if (selectError) throw selectError;
    if (existing) return;

    const { error: insertError } = await supabase.from("payments").insert({
      member_id: memberId,
      year,
      month,
    });

    if (insertError) throw insertError;
  }

  function hasPayment(memberId: string, month: number) {
    return payments.some(
      (p: any) => p.member_id === memberId && p.month === month
    );
  }

  // DEBUG
  console.log("Membros:", members);
  console.log("Pagamentos:", payments);

  return (
    <div className="p-6">

      {/* TESTE MARIO — para confirmar se este ficheiro é o certo */}
      <h1 style={{ color: "red", fontSize: "32px" }}>TESTE MARIO</h1>

      <h1 className="text-xl font-bold mb-4">Relatório de Pagamentos (versão nova)</h1>

      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}

      <button
        onClick={() => setShowReport(!showReport)}
        className="bg-gray-700 text-white px-4 py-2 rounded mb-4"
      >
        {showReport ? "Esconder Relatório" : "Visualizar Relatório"}
      </button>

      <div className="mb-4 space-y-2">
        <label className="block font-semibold">Importar Excel:</label>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="border border-gray-600 p-2 bg-gray-800 text-white rounded w-full cursor-pointer"
        />

        <label className="block font-semibold mt-4">Ano:</label>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border p-2 bg-bg text-text rounded appearance-none"
        >
          {Array.from({ length: 5 }).map((_, i) => {
            const y = new Date().getFullYear() - i;
            return (
              <option key={y} value={y}>
                {y}
              </option>
            );
          })}
        </select>
      </div>

      {showReport && (
        <div className="overflow-x-auto rounded border border-gray-700 mt-6">
          <table className="min-w-[900px] w-full text-center text-xs leading-tight">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="border p-1 text-left">Sócio</th>
                {[
                  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
                  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
                ].map((m, i) => (
                  <th key={i} className="border p-1">
                    {m}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="border p-1 text-left">{member.name}</td>
                  {Array.from({ length: 12 }).map((_, monthIndex) => (
                    <td key={monthIndex} className="border p-1">
                      {hasPayment(member.id, monthIndex + 1) ? "✔" : "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
