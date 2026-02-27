import { NavLink, Outlet, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useState } from "react";
import AppShell from "./AppShell";

export default function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [paymentsOpen, setPaymentsOpen] = useState(false);
  const [paymentsMobileOpen, setPaymentsMobileOpen] = useState(false);

  const [reportsOpen, setReportsOpen] = useState(false);
  const [reportsMobileOpen, setReportsMobileOpen] = useState(false);

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMobileOpen, setCalendarMobileOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="flex flex-col h-screen bg-bg text-text">

      {/* BARRA SUPERIOR */}
      <header className="w-full bg-primary text-white px-6 py-3 flex items-center justify-between shadow-md fixed top-0 left-0 z-20">

        {/* LOGO + TÍTULO */}
        <div className="flex items-center space-x-3">
          <img
            src="/logo192.png"
            alt="Logo"
            className="w-12 h-12 rounded-full object-cover border-2 border-secondary"
          />

          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold text-secondary">Gestor de Cotas</span>
            <span className="text-xs text-gray-200">U.D. FAFE A60</span>
          </div>
        </div>

        {/* BOTÃO HAMBÚRGUER */}
        <button
          className="md:hidden text-white text-3xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        {/* MENU DESKTOP */}
        <nav className="hidden md:flex space-x-6 text-sm font-medium items-center">

          <NavLink
            to="/socios"
            className={({ isActive }) =>
              `px-2 py-1 rounded transition ${
                isActive ? "text-secondary font-semibold" : "hover:text-gray-300"
              }`
            }
          >
            Sócios
          </NavLink>

          {/* PAGAMENTOS */}
          <div className="relative">
            <button
              onClick={() => setPaymentsOpen(!paymentsOpen)}
              className="px-2 py-1 rounded hover:text-gray-300 transition flex items-center space-x-1"
            >
              <span className="font-medium">Pagamentos</span>
              <span className="text-xs">{paymentsOpen ? "▲" : "▼"}</span>
            </button>

            {paymentsOpen && (
              <div className="absolute left-0 mt-2 bg-primary border border-gray-700 rounded shadow-lg flex flex-col w-40 z-30">
                <NavLink to="/pagamentos" className="px-4 py-2 hover:bg-secondary hover:text-primary transition">Cotas</NavLink>
                <NavLink to="/jantar" className="px-4 py-2 hover:bg-secondary hover:text-primary transition">Jantar</NavLink>
              </div>
            )}
          </div>

          {/* RELATÓRIOS */}
          <div className="relative">
            <button
              onClick={() => setReportsOpen(!reportsOpen)}
              className="px-2 py-1 rounded hover:text-gray-300 transition flex items-center space-x-1"
            >
              <span className="font-medium">Relatórios</span>
              <span className="text-xs">{reportsOpen ? "▲" : "▼"}</span>
            </button>

            {reportsOpen && (
              <div className="absolute left-0 mt-2 bg-primary border border-gray-700 rounded shadow-lg flex flex-col w-48 z-30">
                <NavLink to="/relatorio" className="px-4 py-2 hover:bg-secondary hover:text-primary transition">Relatório de Cotas</NavLink>
                <NavLink to="/relatorio-jantares" className="px-4 py-2 hover:bg-secondary hover:text-primary transition">Relatório de Jantares</NavLink>
              </div>
            )}
          </div>

          {/* CALENDÁRIO (DESKTOP) */}
          <div className="relative">
            <button
              onClick={() => setCalendarOpen(!calendarOpen)}
              className="px-2 py-1 rounded hover:text-gray-300 transition flex items-center space-x-1"
            >
              <span className="font-medium">Calendário</span>
              <span className="text-xs">{calendarOpen ? "▲" : "▼"}</span>
            </button>

            {calendarOpen && (
              <div className="absolute left-0 mt-2 bg-primary border border-gray-700 rounded shadow-lg flex flex-col w-48 z-30">
                <NavLink to="/calendario" className="px-4 py-2 hover:bg-secondary hover:text-primary transition">
                  Época 2025/2026
                </NavLink>

                <NavLink to="/calendario-2026" className="px-4 py-2 hover:bg-secondary hover:text-primary transition">
                  Época 2026/2027
                </NavLink>

                <div className="px-4 py-2 text-gray-400 text-sm">Épocas futuras…</div>
              </div>
            )}
          </div>

          <NavLink to="/tesouraria" className={({ isActive }) => `px-2 py-1 rounded transition ${isActive ? "text-secondary font-semibold" : "hover:text-gray-300"}`}>Tesouraria</NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => `px-2 py-1 rounded transition ${isActive ? "text-secondary font-semibold" : "hover:text-gray-300"}`}>Dashboard</NavLink>
          <NavLink to="/config" className={({ isActive }) => `px-2 py-1 rounded transition ${isActive ? "text-secondary font-semibold" : "hover:text-gray-300"}`}>Configurações</NavLink>
        </nav>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="hidden md:block bg-accent hover:bg-secondary text-white px-4 py-2 rounded transition text-sm font-medium"
        >
          Terminar Sessão
        </button>
      </header>

      {/* MENU MOBILE */}
      {menuOpen && (
        <div className="md:hidden bg-primary text-white flex flex-col px-6 py-4 space-y-4 shadow-lg fixed top-[72px] left-0 w-full z-10">

          <NavLink to="/socios" onClick={() => setMenuOpen(false)} className="py-2 hover:text-secondary">Sócios</NavLink>

          {/* PAGAMENTOS MOBILE */}
          <button onClick={() => setPaymentsMobileOpen(!paymentsMobileOpen)} className="py-2 flex justify-between items-center">
            <span>Pagamentos</span>
            <span>{paymentsMobileOpen ? "▲" : "▼"}</span>
          </button>

          {paymentsMobileOpen && (
            <div className="ml-4 flex flex-col space-y-2">
              <NavLink to="/pagamentos" onClick={() => setMenuOpen(false)} className="py-1 hover:text-secondary">Cotas</NavLink>
              <NavLink to="/jantar" onClick={() => setMenuOpen(false)} className="py-1 hover:text-secondary">Jantar</NavLink>
            </div>
          )}

          {/* RELATÓRIOS MOBILE */}
          <button onClick={() => setReportsMobileOpen(!reportsMobileOpen)} className="py-2 flex justify-between items-center">
            <span>Relatórios</span>
            <span>{reportsMobileOpen ? "▲" : "▼"}</span>
          </button>

          {reportsMobileOpen && (
            <div className="ml-4 flex flex-col space-y-2">
              <NavLink to="/relatorio" onClick={() => setMenuOpen(false)} className="py-1 hover:text-secondary">Relatório de Cotas</NavLink>
              <NavLink to="/relatorio-jantares" onClick={() => setMenuOpen(false)} className="py-1 hover:text-secondary">Relatório de Jantares</NavLink>
            </div>
          )}

          {/* CALENDÁRIO MOBILE */}
          <button onClick={() => setCalendarMobileOpen(!calendarMobileOpen)} className="py-2 flex justify-between items-center">
            <span>Calendário</span>
            <span>{calendarMobileOpen ? "▲" : "▼"}</span>
          </button>

          {calendarMobileOpen && (
            <div className="ml-4 flex flex-col space-y-2">
              <NavLink to="/calendario" onClick={() => setMenuOpen(false)} className="py-1 hover:text-secondary">Época 2025/2026</NavLink>
              <NavLink to="/calendario-2026" onClick={() => setMenuOpen(false)} className="py-1 hover:text-secondary">Época 2026/2027</NavLink>
              <div className="py-1 text-gray-400 text-sm">Épocas futuras…</div>
            </div>
          )}

          <NavLink to="/tesouraria" onClick={() => setMenuOpen(false)} className="py-2 hover:text-secondary">Tesouraria</NavLink>
          <NavLink to="/dashboard" onClick={() => setMenuOpen(false)} className="py-2 hover:text-secondary">Dashboard</NavLink>
          <NavLink to="/config" onClick={() => setMenuOpen(false)} className="py-2 hover:text-secondary">Configurações</NavLink>

          <button
            onClick={handleLogout}
            className="bg-accent hover:bg-secondary text-white px-4 py-2 rounded transition text-sm font-medium"
          >
            Terminar Sessão
          </button>
        </div>
      )}

      {/* CONTEÚDO */}
      <main className="flex-1 overflow-x-visible overflow-y-auto pt-24 md:pt-24">
        <AppShell>
          <Outlet />
        </AppShell>
      </main>
    </div>
  );
}
