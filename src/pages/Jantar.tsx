import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Jantar() {
  const [members, setMembers] = useState<any[]>([]);
  const [dinners, setDinners] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [opponent, setOpponent] = useState("");
  const [value, setValue] = useState("");
  const [editId, setEditId] = useState<any>(null);
  const [editMemberId, setEditMemberId] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editOpponent, setEditOpponent] = useState("");
  const [editValue, setEditValue] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterOpponent, setFilterOpponent] = useState("");
  const [filterMinValue, setFilterMinValue] = useState("");
  const [filterMaxValue, setFilterMaxValue] = useState("");
  const [search, setSearch] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { void Promise.all([loadMembers(), loadDinners(), loadGames()]); }, []);
  async function loadMembers() {
    const { data, error } = await supabase.from("members").select("*").order("name", { ascending: true });
    if (error) setError(error.message); else setMembers(data || []);
  }
  async function loadDinners() {
    const { data, error } = await supabase.from("dinner_payments").select("*").order("date", { ascending: false });
    if (error) setError(error.message); else setDinners(data || []);
  }
  async function loadGames() {
    const { data, error } = await supabase.from("games").select("id, opponent").order("id", { ascending: false });
    if (error) setError(error.message); else setGames(data || []);
  }
  const opponentOptions = [...new Set([...games.map(g => g.opponent), ...dinners.map(d => d.opponent)].filter(Boolean))];
  const existing = useMemo(() => new Set(dinners.filter(d => d.date === date && d.opponent === opponent).map(d => String(d.member_id))), [dinners, date, opponent]);
  const visibleMembers = members.filter(m => String(m.name || "").toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  const available = visibleMembers.filter(m => !existing.has(String(m.id)));
  const filteredDinners = dinners.filter(d =>
    (!filterDate || d.date === filterDate) && (!filterOpponent || d.opponent === filterOpponent) &&
    (filterMinValue === "" || Number(d.value) >= Number(filterMinValue)) &&
    (filterMaxValue === "" || Number(d.value) <= Number(filterMaxValue))
  );
  const totalPago = dinners.reduce((a, d) => a + Number(d.value || 0), 0);
  const totalPorAdversario = filteredDinners.reduce((a: Record<string, number>, d) => {
    a[d.opponent] = (a[d.opponent] || 0) + Number(d.value || 0); return a;
  }, {});
  const money = (n: number) => n.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
  const getMemberName = (id: any) => members.find(m => String(m.id) === String(id))?.name || "—";
  const toggle = (id: any) => setSelected(s => s.includes(String(id)) ? s.filter(x => x !== String(id)) : [...s, String(id)]);
  const resetMessages = () => { setError(""); setSuccess(""); };

  async function saveBatch() {
    resetMessages();
    const amount = Number(value);
    if (!date || !opponent || value.trim() === "" || !Number.isFinite(amount) || amount <= 0) {
      setError("Preenche a data, o adversário e um valor superior a zero."); return;
    }
    const ids = selected.filter(id => !existing.has(id));
    if (!ids.length) { setError("Seleciona pelo menos um sócio ainda sem pagamento neste jantar."); return; }
    setSaving(true);
    try {
      // Verificação adicional antes da inserção; uma restrição UNIQUE na BD é recomendada para concorrência.
      const { data: already, error: checkError } = await supabase.from("dinner_payments")
        .select("member_id").eq("date", date).eq("opponent", opponent).in("member_id", ids);
      if (checkError) throw checkError;
      const paid = new Set((already || []).map(d => String(d.member_id)));
      const pending = ids.filter(id => !paid.has(id));
      if (!pending.length) { setError("Os sócios selecionados já têm pagamento neste jantar."); await loadDinners(); return; }
      const { error: insertError } = await supabase.from("dinner_payments").insert(
        pending.map(member_id => ({ member_id, date, opponent, value: amount }))
      );
      if (insertError) throw insertError;
      setSuccess(`${pending.length} pagamento(s) registado(s): ${money(pending.length * amount)}.${paid.size ? ` ${paid.size} já existia(m) e foi(ram) ignorado(s).` : ""}`);
      setSelected([]);
      await loadDinners();
    } catch (e: any) { setError(e.message || "Não foi possível guardar os pagamentos."); }
    finally { setSaving(false); }
  }
  function startEdit(d: any) {
    resetMessages(); setEditId(d.id); setEditMemberId(String(d.member_id));
    setEditDate(d.date); setEditOpponent(d.opponent); setEditValue(String(d.value));
  }
  async function saveEdit() {
    resetMessages();
    if (!editMemberId || !editDate || !editOpponent || editValue.trim() === "" || !Number.isFinite(Number(editValue)) || Number(editValue) <= 0) {
      setError("Preenche todos os campos da edição com um valor superior a zero."); return;
    }
    if (dinners.some(d => d.id !== editId && String(d.member_id) === editMemberId && d.date === editDate && d.opponent === editOpponent)) {
      setError("Este sócio já tem um pagamento neste jantar."); return;
    }
    setSaving(true);
    const { error: updateError } = await supabase.from("dinner_payments").update({ member_id: editMemberId, date: editDate, opponent: editOpponent, value: Number(editValue) }).eq("id", editId);
    setSaving(false);
    if (updateError) { setError(updateError.message); return; }
    setEditId(null); setSuccess("Pagamento atualizado."); await loadDinners();
  }
  async function deleteDinner(id: any) {
    if (!window.confirm("Eliminar este pagamento?")) return;
    resetMessages();
    const { error: deleteError } = await supabase.from("dinner_payments").delete().eq("id", id);
    if (deleteError) setError(deleteError.message);
    else { setSuccess("Pagamento eliminado."); await loadDinners(); }
  }
  const field = "border border-gray-500/40 p-2 bg-bg text-text rounded w-full";
  const primaryButton = "bg-secondary text-primary font-semibold px-4 py-2 rounded shadow disabled:opacity-50";

  return (
    <div className="p-4 md:p-6 bg-bg text-text min-h-screen space-y-6">
      <h1 className="text-2xl font-bold">Pagamentos de Jantar</h1>
      {error && <div role="alert" className="text-red-500">{error}</div>}
      {success && <div role="status" className="text-green-500">{success}</div>}

      <section className="rounded-lg border border-gray-500/30 p-4 space-y-4">
        <h2 className="text-lg font-bold">Registar vários pagamentos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="block">Data do jantar<input type="date" className={`${field} mt-1`} value={date} onChange={e => { setDate(e.target.value); setSelected([]); }} /></label>
          <label className="block">Adversário<select className={`${field} mt-1`} value={opponent} onChange={e => { setOpponent(e.target.value); setSelected([]); }}><option value="">Selecionar adversário</option>{opponentOptions.map(o => <option key={o} value={o}>{o}</option>)}</select></label>
          <label className="block">Valor por sócio (€)<input type="number" min="0.01" step="0.01" className={`${field} mt-1`} value={value} onChange={e => setValue(e.target.value)} placeholder="Ex.: 15" /></label>
        </div>
        <div className="flex flex-wrap justify-between items-center gap-3">
          <h3 className="font-semibold">Selecionar sócios ({selected.length})</h3>
          <div className="flex gap-2">
            <button type="button" className="border rounded px-3 py-1" onClick={() => setSelected(s => [...new Set([...s, ...available.map(m => String(m.id))])])}>Selecionar visíveis</button>
            <button type="button" className="border rounded px-3 py-1" onClick={() => setSelected([])}>Limpar seleção</button>
          </div>
        </div>
        <input className={field} value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar sócio pelo nome..." aria-label="Pesquisar sócio" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-80 overflow-y-auto">
          {visibleMembers.map(m => {
            const paid = existing.has(String(m.id));
            return <label key={m.id} className={`flex items-center gap-3 p-3 rounded border border-gray-500/30 ${paid ? "opacity-60" : "cursor-pointer"}`}>
              <input type="checkbox" className="w-5 h-5" disabled={paid} checked={!paid && selected.includes(String(m.id))} onChange={() => toggle(m.id)} />
              <span className="flex-1">{m.name}</span>{paid && <span className="text-xs text-green-500">Já pago</span>}
            </label>;
          })}
          {!visibleMembers.length && <p>Nenhum sócio encontrado.</p>}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div><strong>{selected.length}</strong> sócios · Total a registar: <strong>{money(selected.length * (Number(value) || 0))}</strong></div>
          <button type="button" disabled={saving || selected.length === 0} className={primaryButton} onClick={saveBatch}>{saving ? "A guardar..." : `Registar ${selected.length} pagamento(s)`}</button>
        </div>
      </section>

      {editId !== null && <section className="rounded-lg border border-secondary p-4 space-y-3">
        <h2 className="font-bold text-lg">Editar pagamento</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <label>Sócio<select className={field} value={editMemberId} onChange={e => setEditMemberId(e.target.value)}>{members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
          <label>Data<input className={field} type="date" value={editDate} onChange={e => setEditDate(e.target.value)} /></label>
          <label>Adversário<select className={field} value={editOpponent} onChange={e => setEditOpponent(e.target.value)}>{opponentOptions.map(o => <option key={o} value={o}>{o}</option>)}</select></label>
          <label>Valor (€)<input className={field} type="number" min="0.01" step="0.01" value={editValue} onChange={e => setEditValue(e.target.value)} /></label>
        </div>
        <div className="flex gap-2"><button className={primaryButton} disabled={saving} onClick={saveEdit}>Guardar alterações</button><button className="border rounded px-4 py-2" onClick={() => setEditId(null)}>Cancelar</button></div>
      </section>}

      <div className="text-lg font-bold text-secondary">Total pago por todos os sócios: {money(totalPago)}</div>
      <section className="space-y-3">
        <h2 className="text-lg font-bold">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input aria-label="Filtrar por data" type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className={field} />
          <select aria-label="Filtrar por adversário" value={filterOpponent} onChange={e => setFilterOpponent(e.target.value)} className={field}><option value="">Todos os adversários</option>{opponentOptions.map(o => <option key={o} value={o}>{o}</option>)}</select>
          <input aria-label="Valor mínimo" type="number" placeholder="Valor mínimo" value={filterMinValue} onChange={e => setFilterMinValue(e.target.value)} className={field} />
          <input aria-label="Valor máximo" type="number" placeholder="Valor máximo" value={filterMaxValue} onChange={e => setFilterMaxValue(e.target.value)} className={field} />
        </div>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-bold">Total por adversário</h2>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm border-collapse"><thead><tr><th className="border p-2">Adversário</th><th className="border p-2">Total (€)</th></tr></thead><tbody>{Object.entries(totalPorAdversario).map(([adv, total]) => <tr key={adv}><td className="border p-2">{adv}</td><td className="border p-2">{money(total)}</td></tr>)}</tbody></table></div>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-bold">Pagamentos registados ({filteredDinners.length})</h2>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm border-collapse"><thead><tr><th className="border p-2">Sócio</th><th className="border p-2">Data</th><th className="border p-2">Adversário</th><th className="border p-2">Valor</th><th className="border p-2">Ações</th></tr></thead><tbody>
          {filteredDinners.map(d => <tr key={d.id}><td className="border p-2">{getMemberName(d.member_id)}</td><td className="border p-2">{d.date}</td><td className="border p-2">{d.opponent}</td><td className="border p-2">{money(Number(d.value))}</td><td className="border p-2"><div className="flex gap-2"><button className="bg-secondary text-primary px-2 py-1 rounded" onClick={() => startEdit(d)}>Editar</button><button className="bg-red-600 text-white px-2 py-1 rounded" onClick={() => deleteDinner(d.id)}>Eliminar</button></div></td></tr>)}
          {!filteredDinners.length && <tr><td className="border p-2 text-center" colSpan={5}>Nenhum pagamento encontrado.</td></tr>}
        </tbody></table></div>
      </section>
    </div>
  );
}
