import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [calendarMobileOpen, setCalendarMobileOpen] = useState(false);
  const [reportsMobileOpen, setReportsMobileOpen] = useState(false);

  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* NAVBAR */}
      <nav className="bg-primary text-white px-6 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* LOGO */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-10 h-10 rounded-full border border-white"
            />
            <h1 className="text-xl font-bold">Gestor de Cotas</h1>
          </div>

          {/* MENU DESKTOP */}
          <div className="hidden md:flex items-center gap-6">

            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/socios">Sócios</NavLink>
            <NavLink to="/pagamentos">Pagamentos</NavLink>

            {/* RELATÓRIOS DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setReportsOpen(!reportsOpen)}
                className="hover:text-gray-300 transition-colors"
              >
                Relatórios ▾
              </button>

              {reportsOpen && (
                <div className="absolute left-0 mt-2 bg-primary text-white shadow-lg rounded-md p-3 flex flex-col gap-2 z-50">
                  <NavLink to="/relatorio">Relatório Geral</NavLink>
                  <NavLink to="/relatorio-jantares">Relatório Jantares</NavLink>
                </div>
              )}
            </div>

            {/* CALENDÁRIO DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setCalendarOpen(!calendarOpen)}
                className="hover:text-gray-300 transition-colors"
              >
                Calendário ▾
              </button>

              {calendarOpen && (
                <div className="absolute left-0 mt-2 bg-primary text-white shadow-lg rounded-md p-3 flex flex-col gap-2 z-50">
                  <NavLink to="/calendario">Época 2025/2026</NavLink>
                  <NavLink to="/calendario-2026">Época 2026/2027</NavLink>
                </div>
              )}
            </div>

            <NavLink to="/tesouraria">Tesouraria</NavLink>
            <NavLink to="/contabilidade">Contabilidade</NavLink>
            <NavLink to="/config">Configurações</NavLink>

            {/* EQUIPA (NOVO) */}
            <NavLink to="/estatisticas">Equipa</NavLink>

            {/* LOGOUT */}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-white"
            >
              Terminar Sessão
            </button>
          </div>

          {/* MENU MOBILE BUTTON */}
          <button
            className="md:hidden text-2xl"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
        </div>

        {/* MENU MOBILE */}
        {menuOpen && (
          <div className="md:hidden mt-4 flex flex-col gap-4 bg-primary p-4 rounded-md">

            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/socios">Sócios</NavLink>
            <NavLink to="/pagamentos">Pagamentos</NavLink>

            {/* RELATÓRIOS MOBILE */}
            <div>
              <button
                onClick={() => setReportsMobileOpen(!reportsMobileOpen)}
                className="w-full text-left"
              >
                Relatórios ▾
              </button>

              {reportsMobileOpen && (
                <div className="ml-4 flex flex-col gap-2 mt-2">
                  <NavLink to="/relatorio">Relatório Geral</NavLink>
                  <NavLink to="/relatorio-jantares">Relatório Jantares</NavLink>
                </div>
              )}
            </div>

            {/* CALENDÁRIO MOBILE */}
            <div>
              <button
                onClick={() => setCalendarMobileOpen(!calendarMobileOpen)}
                className="w-full text-left"
              >
                Calendário ▾
              </button>

              {calendarMobileOpen && (
                <div className="ml-4 flex flex-col gap-2 mt-2">
                  <NavLink to="/calendario">Época 2025/2026</NavLink>
                  <NavLink to="/calendario-2026">Época 2026/2027</NavLink>
                </div>
              )}
            </div>

            <NavLink to="/tesouraria">Tesouraria</NavLink>
            <NavLink to="/contabilidade">Contabilidade</NavLink>
            <NavLink to="/config">Configurações</NavLink>
            <NavLink to="/estatisticas">Equipa</NavLink>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-white mt-2"
            >
              Terminar Sessão
            </button>
          </div>
        )}
      </nav>

      {/* CONTEÚDO */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
