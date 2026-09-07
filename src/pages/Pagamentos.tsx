import { useEffect, useMemo, useState } from "react";
import {
  PageTitle,
  Card,
  Input,
  Select,
  Button,
} from "../lib/ui";
import { supabase } from "../supabaseClient";

/* ============================================================
   MESES
============================================================ */

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

/* ============================================================
   DATA ATUAL
============================================================ */

function dataHoje() {
  return new Date()
    .toISOString()
    .split("T")[0];
}

/* ============================================================
   FUNÇÕES SUPABASE
============================================================ */

async function getMembers() {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("name", {
      ascending: true,
    });

  if (error) throw error;

  return data;
}

async function getPaymentsByYear(year) {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("year", year)
    .order("month", {
      ascending: true,
    });

  if (error) throw error;

  return data;
}

async function updatePayment(id, data) {
  const { error } = await supabase
    .from("payments")
    .update(data)
    .eq("id", id);

  if (error) throw error;
}

async function deletePaymentById(id) {
  const { error } = await supabase
    .from("payments")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

/* ============================================================
   COMPONENTE
============================================================ */

export default function Pagamentos() {
  const [payments, setPayments] =
    useState([]);

  const [members, setMembers] =
    useState([]);

  const [memberId, setMemberId] =
    useState("");

  const [months, setMonths] =
    useState([]);

  const [year, setYear] =
    useState(
      new Date().getFullYear()
    );

  const [paymentDate, setPaymentDate] =
    useState(dataHoje());

  const [amount, setAmount] =
    useState("");

  const [method, setMethod] =
    useState("cash");

  const [editingId, setEditingId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [showList, setShowList] =
    useState(false);

  /* ============================================================
     CARREGAR DADOS
  ============================================================ */

  useEffect(() => {
    load();
  }, [year]);

  async function load() {
    try {
      setError("");

      const p =
        await getPaymentsByYear(year);

      const m =
        await getMembers();

      setPayments(p || []);
      setMembers(m || []);

    } catch (err) {
      setError(
        err?.message ||
        "Erro ao carregar dados."
      );
    }
  }

  /* ============================================================
     LIMPAR MESES
  ============================================================ */

  useEffect(() => {
    if (!editingId) {
      setMonths([]);
    }
  }, [
    memberId,
    year,
    editingId,
  ]);

  /* ============================================================
     MESES JÁ PAGOS
  ============================================================ */

  const mesesPagos = useMemo(() => {
    if (!memberId) {
      return [];
    }

    return payments
      .filter(
        (payment) =>
          String(payment.member_id) ===
          String(memberId)
      )
      .map(
        (payment) =>
          Number(payment.month)
      );

  }, [
    payments,
    memberId,
  ]);

  /* ============================================================
     MESES DISPONÍVEIS
  ============================================================ */

  const mesesDisponiveis = useMemo(() => {
    const lista = MESES.map(
      (nome, index) => ({
        numero: index + 1,
        nome,
      })
    );

    if (editingId) {
      const pagamentoEmEdicao =
        payments.find(
          (payment) =>
            payment.id === editingId
        );

      return lista.filter(
        (mes) =>
          !mesesPagos.includes(
            mes.numero
          ) ||
          mes.numero ===
            Number(
              pagamentoEmEdicao?.month
            )
      );
    }

    return lista.filter(
      (mes) =>
        !mesesPagos.includes(
          mes.numero
        )
    );

  }, [
    mesesPagos,
    editingId,
    payments,
  ]);

  const quantidadeMesesEmFalta =
    mesesDisponiveis.length;

  /* ============================================================
     SUBMETER
  ============================================================ */

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (!memberId) {
      setError(
        "Selecione um sócio."
      );
      return;
    }

    if (months.length === 0) {
      setError(
        "Selecione pelo menos um mês."
      );
      return;
    }

    if (!paymentDate) {
      setError(
        "Indique a data de pagamento."
      );
      return;
    }

    if (
      !amount ||
      Number(amount) <= 0
    ) {
      setError(
        "Indique um valor válido."
      );
      return;
    }

    try {

      /* ========================================================
         EDITAR
      ======================================================== */

      if (editingId) {
        const data = {
          member_id: memberId,
          month: months[0],
          year,
          payment_date: paymentDate,
          amount: Number(amount),
          method,
        };

        await updatePayment(
          editingId,
          data
        );

        setEditingId(null);
      }

      /* ========================================================
         ADICIONAR
      ======================================================== */

      else {

        const mesesParaInserir =
          months.filter(
            (mes) =>
              !mesesPagos.includes(
                Number(mes)
              )
          );

        if (
          mesesParaInserir.length === 0
        ) {
          setError(
            "Os meses selecionados já se encontram pagos."
          );
          return;
        }

        const inserts =
          mesesParaInserir.map(
            (mes) => ({
              member_id: memberId,
              month: Number(mes),
              year,
              payment_date:
                paymentDate,
              amount: Number(amount),
              method,
            })
          );

        const { error } =
          await supabase
            .from("payments")
            .insert(inserts);

        if (error) throw error;
      }

      /* ========================================================
         LIMPAR
      ======================================================== */

      setMemberId("");
      setMonths([]);
      setPaymentDate(dataHoje());
      setAmount("");
      setMethod("cash");

      await load();

    } catch (err) {
      setError(
        err?.message ||
        "Ocorreu um erro ao guardar o pagamento."
      );
    }
  }

  /* ============================================================
     EDITAR PAGAMENTO
  ============================================================ */

  function startEdit(payment) {
    setEditingId(payment.id);

    setMemberId(
      String(payment.member_id)
    );

    setMonths([
      Number(payment.month),
    ]);

    setPaymentDate(
      payment.payment_date ||
      dataHoje()
    );

    setAmount(
      String(payment.amount)
    );

    setMethod(
      payment.method || "cash"
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* ============================================================
     CANCELAR
  ============================================================ */

  function cancelEdit() {
    setEditingId(null);
    setMemberId("");
    setMonths([]);
    setPaymentDate(dataHoje());
    setAmount("");
    setMethod("cash");
    setError("");
  }

  /* ============================================================
     APAGAR
  ============================================================ */

  async function handleDelete(id) {
    const confirmar =
      window.confirm(
        "Tem a certeza que pretende apagar este pagamento?"
      );

    if (!confirmar) {
      return;
    }

    try {
      setError("");

      await deletePaymentById(id);

      if (editingId === id) {
        cancelEdit();
      }

      await load();

    } catch (err) {
      setError(
        err?.message ||
        "Erro ao apagar pagamento."
      );
    }
  }

  /* ============================================================
     ALTERAR SÓCIO
  ============================================================ */

  function handleMemberChange(e) {
    setMemberId(e.target.value);

    if (!editingId) {
      setMonths([]);
    }
  }

  /* ============================================================
     ALTERAR ANO
  ============================================================ */

  function handleYearChange(e) {
    setYear(
      Number(e.target.value)
    );

    if (!editingId) {
      setMonths([]);
    }
  }

  /* ============================================================
     FORMATAR DATA
  ============================================================ */

  function formatarData(data) {
    if (!data) {
      return "—";
    }

    const partes =
      String(data).split("-");

    if (partes.length !== 3) {
      return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <>
      <PageTitle>
        Pagamentos
      </PageTitle>

      {/* ERRO */}

      {error && (
        <div className="
          text-red-400
          text-sm
          bg-red-900/30
          border
          border-red-700
          px-3
          py-2
          rounded
          mb-4
        ">
          {error}
        </div>
      )}

      {/* FORMULÁRIO */}

      <Card>

        <div className="
          space-y-4
        ">

          {/* ANO */}

          <div>

            <label className="
              block
              font-semibold
              mb-1
            ">
              Ano:
            </label>

            <Select
              value={year}
              onChange={
                handleYearChange
              }
            >

              {Array.from(
                { length: 5 }
              ).map((_, i) => {

                const y =
                  new Date()
                    .getFullYear() - i;

                return (
                  <option
                    key={y}
                    value={y}
                  >
                    {y}
                  </option>
                );
              })}

            </Select>

          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-3"
          >

            {/* SÓCIO */}

            <div>

              <label className="
                block
                font-semibold
                mb-1
              ">
                Sócio:
              </label>

              <Select
                value={memberId}
                onChange={
                  handleMemberChange
                }
                required
              >

                <option value="">
                  Selecione o sócio
                </option>

                {members.map((m) => (

                  <option
                    key={m.id}
                    value={m.id}
                  >
                    {m.name}
                  </option>

                ))}

              </Select>

            </div>

            {/* MESES */}

            {memberId && (

              <div>

                <label className="
                  block
                  font-semibold
                  mb-1
                ">
                  {editingId
                    ? "Mês:"
                    : "Meses em falta:"}
                </label>

                {quantidadeMesesEmFalta ===
                0 ? (

                  <div className="
                    text-green-400
                    text-sm
                    bg-green-900/20
                    border
                    border-green-700/50
                    rounded
                    px-3
                    py-3
                  ">
                    Este sócio já tem todos
                    os meses de {year} pagos.
                  </div>

                ) : (

                  <>
                    <Select
                      multiple={!editingId}
                      value={months}
                      onChange={(e) =>
                        setMonths(
                          [
                            ...e.target
                              .selectedOptions,
                          ].map((o) =>
                            Number(
                              o.value
                            )
                          )
                        )
                      }
                      required
                      size={
                        editingId
                          ? 1
                          : Math.min(
                              quantidadeMesesEmFalta,
                              6
                            )
                      }
                    >

                      {!editingId && (
                        <option disabled>
                          Selecione os meses
                          em falta
                        </option>
                      )}

                      {mesesDisponiveis.map(
                        (mes) => (

                          <option
                            key={mes.numero}
                            value={mes.numero}
                          >
                            {mes.nome}
                          </option>

                        )
                      )}

                    </Select>

                    {!editingId && (

                      <p className="
                        text-xs
                        text-gray-400
                        mt-2
                      ">
                        Só aparecem os meses
                        que ainda não foram
                        pagos. Pode selecionar
                        vários meses.
                      </p>

                    )}

                  </>

                )}

              </div>

            )}

            {/* DATA DE PAGAMENTO */}

            <div>

              <label className="
                block
                font-semibold
                mb-1
              ">
                Data de pagamento:
              </label>

              <Input
                type="date"
                value={paymentDate}
                onChange={(e) =>
                  setPaymentDate(
                    e.target.value
                  )
                }
                required
              />

              <p className="
                text-xs
                text-gray-400
                mt-1
              ">
                Data em que o pagamento foi
                efetivamente recebido.
              </p>

            </div>

            {/* VALOR */}

            <div>

              <label className="
                block
                font-semibold
                mb-1
              ">
                Valor (€):
              </label>

              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Valor (€)"
                value={amount}
                onChange={(e) =>
                  setAmount(
                    e.target.value
                  )
                }
                required
              />

            </div>

            {/* MÉTODO */}

            <div>

              <label className="
                block
                font-semibold
                mb-1
              ">
                Método:
              </label>

              <Select
                value={method}
                onChange={(e) =>
                  setMethod(
                    e.target.value
                  )
                }
                required
              >

                <option value="cash">
                  Cash
                </option>

                <option value="banco">
                  Banco
                </option>

              </Select>

            </div>

            {/* BOTÕES */}

            <div className="
              flex
              gap-3
              flex-wrap
            ">

              <Button
                variant="secondary"
                disabled={
                  !editingId &&
                  memberId &&
                  quantidadeMesesEmFalta ===
                    0
                }
              >
                {editingId
                  ? "Guardar Alterações"
                  : "Adicionar Pagamentos"}
              </Button>

              {editingId && (

                <Button
                  type="button"
                  onClick={cancelEdit}
                  variant="primary"
                >
                  Cancelar
                </Button>

              )}

            </div>

          </form>

        </div>

      </Card>

      {/* BOTÃO LISTA */}

      <Button
        onClick={() =>
          setShowList(!showList)
        }
        variant="primary"
        className="mt-6"
      >
        {showList
          ? "Esconder Pagamentos"
          : "Lista de Pagamentos"}
      </Button>

      {/* LISTA */}

      {showList && (

        <Card>

          <div className="
            overflow-x-auto
          ">

            <table className="
              w-full
              border
              text-xs
              leading-tight
            ">

              <thead>

                <tr className="
                  bg-primary
                  text-white
                ">

                  <th className="
                    border
                    p-1
                  ">
                    Sócio
                  </th>

                  <th className="
                    border
                    p-1
                  ">
                    Mês
                  </th>

                  <th className="
                    border
                    p-1
                  ">
                    Ano
                  </th>

                  <th className="
                    border
                    p-1
                  ">
                    Data Pagamento
                  </th>

                  <th className="
                    border
                    p-1
                  ">
                    Valor
                  </th>

                  <th className="
                    border
                    p-1
                  ">
                    Método
                  </th>

                  <th className="
                    border
                    p-1
                  ">
                    Ações
                  </th>

                </tr>

              </thead>

              <tbody>

                {payments.length === 0 ? (

                  <tr>

                    <td
                      colSpan={7}
                      className="
                        border
                        p-4
                        text-center
                        text-gray-400
                      "
                    >
                      Não existem pagamentos
                      registados para {year}.
                    </td>

                  </tr>

                ) : (

                  payments.map((p) => {

                    const member =
                      members.find(
                        (m) =>
                          String(m.id) ===
                          String(
                            p.member_id
                          )
                      );

                    return (

                      <tr
                        key={p.id}
                        className="
                          hover:bg-gray-800/40
                        "
                      >

                        <td className="
                          border
                          p-1
                        ">
                          {member?.name || "—"}
                        </td>

                        <td className="
                          border
                          p-1
                        ">
                          {MESES[
                            Number(p.month) - 1
                          ] || p.month}
                        </td>

                        <td className="
                          border
                          p-1
                        ">
                          {p.year}
                        </td>

                        <td className="
                          border
                          p-1
                        ">
                          {formatarData(
                            p.payment_date
                          )}
                        </td>

                        <td className="
                          border
                          p-1
                        ">
                          {p.amount} €
                        </td>

                        <td className="
                          border
                          p-1
                          capitalize
                        ">
                          {p.method}
                        </td>

                        <td className="
                          border
                          p-1
                          space-x-1
                        ">

                          <Button
                            onClick={() =>
                              startEdit(p)
                            }
                            variant="secondary"
                            className="
                              text-xs
                              px-2
                              py-1
                            "
                          >
                            Editar
                          </Button>

                          <Button
                            onClick={() =>
                              handleDelete(
                                p.id
                              )
                            }
                            variant="accent"
                            className="
                              text-xs
                              px-2
                              py-1
                              bg-red-600
                              hover:bg-red-700
                            "
                          >
                            Apagar
                          </Button>

                        </td>

                      </tr>

                    );
                  })

                )}

              </tbody>

            </table>

          </div>

        </Card>

      )}

    </>
  );
}