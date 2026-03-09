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
    <div className="min-h-screen flex flex-col bg-bg text-text">
      {/* NAVBAR */}
      <nav className="bg-primary text-text px-6 py-4 shadow-md border-b border-secondary">
        <div className="max-w-7xl mx-auto flex justify-between items-center">

          {/* LOGO DESKTOP */}
          <div className="hidden md:flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-14 h-14 object-contain"
            />
            <h1 className="text-xl font-bold text-secondary">Gestor de Cotas</h1>
          </div>

          {/* MENU DESKTOP */}
          <div className="hidden md:flex items-center gap-6 font-medium">

            <NavLink to="/dashboard" className="hover:text-secondary">Dashboard</NavLink>
            <NavLink to="/socios" className="hover:text-secondary">Sócios</NavLink>
            <NavLink to="/pagamentos" className="hover:text-secondary">Pagamentos</NavLink>

            {/* RELATÓRIOS */}
            <div className="relative">
              <button
                onClick={() => setReportsOpen(!reportsOpen)}
                className="hover:text-secondary transition-colors"
              >
                Relatórios ▾
              </button>

              {reportsOpen && (
                <div className="absolute left-0 mt-2 bg-primary text-text shadow-lg rounded-md p-3 flex flex-col gap-2 z-50 border border-secondary">
                  <NavLink to="/relatorio" className="hover:text-secondary">Relatório Geral</NavLink>
                  <NavLink to="/relatorio-jantares" className="hover:text-secondary">Relatório Jantares</NavLink>
                </div>
              )}
            </div>

            {/* CALENDÁRIO */}
            <div className="relative">
              <button
                onClick={() => setCalendarOpen(!calendarOpen)}
                className="hover:text-secondary transition-colors"
              >
                Calendário ▾
              </button>

              {calendarOpen && (
                <div className="absolute left-0 mt-2 bg-primary text-text shadow-lg rounded-md p-3 flex flex-col gap-2 z-50 border border-secondary">
                  <NavLink to="/calendario" className="hover:text-secondary">Época 2025/2026</NavLink>
                  <NavLink to="/calendario-2026" className="hover:text-secondary">Época 2026/2027</NavLink>
                </div>
              )}
            </div>

            <NavLink to="/tesouraria" className="hover:text-secondary">Tesouraria</NavLink>
            <NavLink to="/contabilidade" className="hover:text-secondary">Contabilidade</NavLink>
            <NavLink to="/config" className="hover:text-secondary">Configurações</NavLink>
            <NavLink to="/estatisticas" className="hover:text-secondary">Equipa</NavLink>

            {/* LOGOUT */}
            <button
              onClick={handleLogout}
              className="bg-accent hover:bg-secondary px-4 py-2 rounded-md text-white"
            >
              Terminar Sessão
            </button>
          </div>

          {/* MOBILE BUTTON */}
          <button
            className="md:hidden text-2xl text-secondary"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
        </div>

        {/* MENU MOBILE */}
        {menuOpen && (
          <div className="md:hidden mt-4 flex flex-col gap-4 bg-primary p-4 rounded-md text-text font-medium">

            {/* LOGO MOBILE */}
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-14 h-14 object-contain"
              />
              <h1 className="text-xl font-bold text-secondary">Gestor de Cotas</h1>
            </div>

            <NavLink to="/dashboard" className="hover:text-secondary">Dashboard</NavLink>
            <NavLink to="/socios" className="hover:text-secondary">Sócios</NavLink>
            <NavLink to="/pagamentos" className="hover:text-secondary">Pagamentos</NavLink>

            {/* RELATÓRIOS MOBILE */}
            <div>
              <button
                onClick={() => setReportsMobileOpen(!reportsMobileOpen)}
                className="w-full text-left hover:text-secondary"
              >
                Relatórios ▾
              </button>

              {reportsMobileOpen && (
                <div className="ml-4 flex flex-col gap-2 mt-2">
                  <NavLink to="/relatorio" className="hover:text-secondary">Relatório Geral</NavLink>
                  <NavLink to="/relatorio-jantares" className="hover:text-secondary">Relatório Jantares</NavLink>
                </div>
              )}
            </div>

            {/* CALENDÁRIO MOBILE */}
            <div>
              <button
                onClick={() => setCalendarMobileOpen(!calendarMobileOpen)}
                className="w-full text-left hover:text-secondary"
              >
                Calendário ▾
              </button>

              {calendarMobileOpen && (
                <div className="ml-4 flex flex-col gap-2 mt-2">
                  <NavLink to="/calendario" className="hover:text-secondary">Época 2025/2026</NavLink>
                  <NavLink to="/calendario-2026" className="hover:text-secondary">Época 2026/2027</NavLink>
                </div>
              )}
            </div>

            <NavLink to="/tesouraria" className="hover:text-secondary">Tesouraria</NavLink>
            <NavLink to="/contabilidade" className="hover:text-secondary">Contabilidade</NavLink>
            <NavLink to="/config" className="hover:text-secondary">Configurações</NavLink>
            <NavLink to="/estatisticas" className="hover:text-secondary">Equipa</NavLink>

            <button
              onClick={handleLogout}
              className="bg-accent hover:bg-secondary px-4 py-2 rounded-md text-white mt-2"
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
