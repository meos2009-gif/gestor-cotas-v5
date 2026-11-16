import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Tesouraria() {
  const [allMovements, setAllMovements] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState(null);

  const [type, setType] = useState("entrada");
  const [category, setCategory] = useState("jantar");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [date, setDate] = useState("");

  // FILTROS
  const [mes, setMes] = useState(String(new Date().getMonth() + 1).padStart(2, "0"));
  const [ano, setAno] = useState(new Date().getFullYear());
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("");

  // CARREGAR TODOS OS MOVIMENTOS
  async function loadMovements() {
    setLoading(true);

    const { data, error } = await supabase
      .from("treasury_movements")
      .select("*")
      .order("date", { ascending: true });

    if (!error && data) {
      setAllMovements(data);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadMovements();
  }, []);

  // FILTRAGEM NO FRONTEND
  useEffect(() => {
    let filtered = [...allMovements];

    // FILTRO MÊS/ANO
    if (mes) {
      filtered = filtered.filter((m) => String(m.date || "").slice(0, 7) === `${ano}-${mes}`);
    }

    // FILTRO CATEGORIA
    if (categoriaFiltro) {
      filtered = filtered.filter((m) => m.category === categoriaFiltro);
    }

    // FILTRO TIPO (entrada/saida)
    if (tipoFiltro) {
      filtered = filtered.filter((m) => m.type === tipoFiltro);
    }

    setMovements(filtered);
  }, [mes, ano, categoriaFiltro, tipoFiltro, allMovements]);

  // Saldo acumulado de caixa após cada movimento, incluindo os meses anteriores.
  // É calculado antes dos filtros para que estes não alterem o saldo real.
  const saldosPorMovimento = new Map();
  let saldoCorrente = 0;
  [...allMovements]
    .sort((a, b) => {
      const porData = String(a.date || "").localeCompare(String(b.date || ""));
      return porData || String(a.id).localeCompare(String(b.id));
    })
    .forEach((m) => {
      saldoCorrente += (m.type === "entrada" ? 1 : -1) * Number(m.value || 0);
      saldosPorMovimento.set(m.id, saldoCorrente);
    });

  // SALDO TOTAL
  const saldo = allMovements.reduce((acc, m) => {
    return m.type === "entrada" ? acc + Number(m.value) : acc - Number(m.value);
  }, 0);

  // TOTAIS DO MÊS
  const totalEntradasMes = movements
    .filter((m) => m.type === "entrada")
    .reduce((acc, m) => acc + Number(m.value), 0);

  const totalSaidasMes = movements
    .filter((m) => m.type === "saida")
    .reduce((acc, m) => acc + Number(m.value), 0);

  const saldoMensal = totalEntradasMes - totalSaidasMes;

  // Saldos históricos: consideram todos os movimentos, independentemente
  // dos filtros de categoria e tipo aplicados à tabela.
  const movimentosDoMesSelecionado = mes
    ? allMovements.filter((m) => String(m.date || "").slice(0, 7) === `${ano}-${mes}`)
    : [];

  const entradasMesSelecionado = movimentosDoMesSelecionado
    .filter((m) => m.type === "entrada")
    .reduce((acc, m) => acc + Number(m.value || 0), 0);

  const saidasMesSelecionado = movimentosDoMesSelecionado
    .filter((m) => m.type === "saida")
    .reduce((acc, m) => acc + Number(m.value || 0), 0);

  const saldoAteMesSelecionado = mes
    ? allMovements
        .filter((m) => String(m.date || "").slice(0, 7) <= `${ano}-${mes}`)
        .reduce((acc, m) => acc + (m.type === "entrada" ? 1 : -1) * Number(m.value || 0), 0)
    : null;

  const saldoInicioMes = saldoAteMesSelecionado === null ? null : saldoAteMesSelecionado - entradasMesSelecionado + saidasMesSelecionado;

  const nomesMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const nomeMesSelecionado = mes ? nomesMeses[Number(mes) - 1] : "";

  async function saveMovement() {
    if (!value || !date) return;

    const { error } = await supabase.from("treasury_movements").insert([
      {
        type,
        category,
        description,
        value: Number(value),
        date,
      },
    ]);

    if (!error) {
      setModalOpen(false);
      resetForm();
      loadMovements();
    }
  }

  async function updateMovement() {
    if (!editingMovement) return;

    const { error } = await supabase
      .from("treasury_movements")
      .update({
        type,
        category,
        description,
        value: Number(value),
        date,
      })
      .eq("id", editingMovement.id);

    if (!error) {
      setModalOpen(false);
      resetForm();
      loadMovements();
    }
  }

  function resetForm() {
    setEditingMovement(null);
    setType("entrada");
    setCategory("jantar");
    setDescription("");
    setValue("");
    setDate("");
  }

  function openEditModal(m) {
    setEditingMovement(m);
    setType(m.type);
    setCategory(m.category);
    setDescription(m.description || "");
    setValue(m.value);
    setDate(m.date);
    setModalOpen(true);
  }

  return (
    <div className="p-6">

      {/* SALDO TOTAL */}
      <div className="bg-primary text-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold">Saldo Atual</h2>
        <p className="text-3xl font-bold mt-2 text-secondary">
          {saldo.toFixed(2)} €
        </p>
      </div>

      {/* SALDO ACUMULADO NO FINAL DO MÊS SELECIONADO */}
      <div className="bg-primary text-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold">Saldo de Caixa no Final do Mês</h2>
        {mes ? (
          <>
            <p className="text-sm mt-2 text-gray-200">{nomeMesSelecionado} de {ano} · todos os movimentos até ao último dia do mês</p>
            <p className="text-3xl font-bold mt-2 text-secondary">{saldoAteMesSelecionado.toFixed(2)} €</p>
            <div className="mt-3 space-y-1 text-sm">
              <p>Saldo inicial do mês: <span className="font-semibold">{saldoInicioMes.toFixed(2)} €</span></p>
              <p>Entradas no mês: <span className="text-green-400 font-semibold">{entradasMesSelecionado.toFixed(2)} €</span></p>
              <p>Saídas no mês: <span className="text-red-400 font-semibold">{saidasMesSelecionado.toFixed(2)} €</span></p>
              <p>Movimento líquido do mês: <span className="font-semibold">{(entradasMesSelecionado - saidasMesSelecionado).toFixed(2)} €</span></p>
            </div>
          </>
        ) : (
          <p className="mt-2 text-gray-200">Seleciona um mês e um ano nos filtros abaixo para consultar o saldo histórico.</p>
        )}
      </div>

      {/* TOTAIS DO MÊS */}
      <div className="bg-primary text-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold">Totais do Mês</h2>

        <div className="mt-4 space-y-2">
          <p className="text-lg">
            <span className="font-semibold text-green-400">Entradas:</span>{" "}
            {totalEntradasMes.toFixed(2)} €
          </p>

          <p className="text-lg">
            <span className="font-semibold text-red-400">Saídas:</span>{" "}
            {totalSaidasMes.toFixed(2)} €
          </p>

          <p className="text-xl font-bold mt-2">
            <span className="text-secondary">Saldo Mensal:</span>{" "}
            {saldoMensal.toFixed(2)} €
          </p>
        </div>
      </div>

      {/* FILTROS */}
      <div className="flex space-x-4 mb-6">

        {/* MÊS */}
        <select
          value={mes}
          onChange={(e) => setMes(e.target.value)}
          className="border p-2 rounded bg-white text-black"
        >
          <option value="">Todos os meses</option>
          <option value="01">Janeiro</option>
          <option value="02">Fevereiro</option>
          <option value="03">Março</option>
          <option value="04">Abril</option>
          <option value="05">Maio</option>
          <option value="06">Junho</option>
          <option value="07">Julho</option>
          <option value="08">Agosto</option>
          <option value="09">Setembro</option>
          <option value="10">Outubro</option>
          <option value="11">Novembro</option>
          <option value="12">Dezembro</option>
        </select>

        {/* ANO */}
        <select
          value={ano}
          onChange={(e) => setAno(e.target.value)}
          className="border p-2 rounded bg-white text-black"
        >
          <option value={2024}>2024</option>
          <option value={2025}>2025</option>
          <option value={2026}>2026</option>
        </select>

        {/* CATEGORIA */}
        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          className="border p-2 rounded bg-white text-black"
        >
          <option value="">Todas as categorias</option>
          <option value="jantar">Jantar</option>
          <option value="cotas">Cotas</option>
          <option value="combustivel">Combustível</option>
          <option value="material">Material</option>
          <option value="outros">Outros</option>
        </select>

        {/* TIPO */}
        <select
          value={tipoFiltro}
          onChange={(e) => setTipoFiltro(e.target.value)}
          className="border p-2 rounded bg-white text-black"
        >
          <option value="">Entradas + Saídas</option>
          <option value="entrada">Só Entradas</option>
          <option value="saida">Só Saídas</option>
        </select>
      </div>

      {/* BOTÕES */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => {
            resetForm();
            setType("entrada");
            setModalOpen(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Adicionar Entrada
        </button>

        <button
          onClick={() => {
            resetForm();
            setType("saida");
            setModalOpen(true);
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Adicionar Saída
        </button>
      </div>

      {/* TABELA */}
      <div className="bg-primary text-white rounded-lg shadow-md overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-secondary text-primary">
            <tr>
              <th className="p-3 text-left">Data</th>
              <th className="p-3 text-left">Tipo</th>
              <th className="p-3 text-left">Categoria</th>
              <th className="p-3 text-left">Descrição</th>
              <th className="p-3 text-right">Valor</th>
              <th className="p-3 text-right">Saldo Acumulado</th>
              <th className="p-3 text-right">Ações</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="p-4 text-center text-white">
                  A carregar...
                </td>
              </tr>
            ) : movements.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-4 text-center text-white">
                  Sem movimentos registados.
                </td>
              </tr>
            ) : (
              movements.map((m) => (
                <tr key={m.id} className="border-t border-gray-700">
                  <td className="p-3 text-white">{m.date}</td>
                  <td className="p-3 text-white capitalize">
                    {m.type === "entrada" ? "Entrada" : "Saída"}
                  </td>
                  <td className="p-3 text-white capitalize">{m.category}</td>
                  <td className="p-3 text-white">{m.description || "-"}</td>
                  <td
                    className={`p-3 text-right font-semibold ${
                      m.type === "entrada" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {m.type === "entrada" ? "+" : "-"}
                    {Number(m.value).toFixed(2)} €
                  </td>

                  <td className="p-3 text-right font-bold text-secondary whitespace-nowrap">
                    {Number(saldosPorMovimento.get(m.id) ?? 0).toFixed(2)} €
                  </td>

                  <td className="p-3 text-right">
                    <button
                      onClick={() => openEditModal(m)}
                      className="bg-secondary text-primary px-3 py-1 rounded hover:bg-white hover:text-primary transition"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">

            <h2 className="text-lg font-bold mb-4">
              {editingMovement ? "Editar Movimento" : type === "entrada" ? "Adicionar Entrada" : "Adicionar Saída"}
            </h2>

            <label className="block mb-2 text-sm font-medium">Data</label>
            <input
              type="date"
              className="w-full border p-2 rounded mb-4"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <label className="block mb-2 text-sm font-medium">Categoria</label>
            <select
              className="w-full border p-2 rounded mb-4"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="jantar">Jantar</option>
              <option value="cotas">Cotas</option>
              <option value="combustivel">Combustível</option>
              <option value="material">Material</option>
              <option value="outros">Outros</option>
            </select>

            <label className="block mb-2 text-sm font-medium">Descrição</label>
            <input
              type="text"
              className="w-full border p-2 rounded mb-4"
              placeholder="Opcional"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <label className="block mb-2 text-sm font-medium">Valor (€)</label>
            <input
              type="number"
              className="w-full border p-2 rounded mb-4"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />

            <div className="flex justify-between mt-4">
              <button
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>

              <button
                onClick={editingMovement ? updateMovement : saveMovement}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary"
              >
                {editingMovement ? "Guardar Alterações" : "Guardar"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
