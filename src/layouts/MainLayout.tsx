import { NavLink, Outlet } from "react-router-dom";
import { supabase } from "../supabaseClient";
import logo from "../assets/logo.png";
import { useState } from "react";

export default function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="flex flex-col h-screen bg-bg text-text">

      {/* BARRA SUPERIOR */}
      <header className="w-full bg-primary text-white px-6 py-3 flex items-center justify-between shadow-md">

        {/* LOGO + TÍTULO */}
        <div className="flex items-center space-x-3">
          <img
            src={logo}
            alt="Logo"
            className="w-12 h-12 rounded-full object-cover border-2 border-secondary"
          />

          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold text-secondary">Gestor de Cotas</span>
            <span className="text-xs text-gray-200">U.D. FAFE A60</span>
          </div>
        </div>

        {/* BOTÃO HAMBÚRGUER (mobile) */}
        <button
          className="md:hidden text-white text-3xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        {/* MENU HORIZONTAL (desktop) */}
        <nav className="hidden md:flex space-x-6 text-sm font-medium">
          {[
            ["Sócios", "/socios"],
            ["Pagamentos", "/pagamentos"],
            ["Relatório", "/relatorio"],
            ["Dashboard", "/dashboard"],
            ["Configurações", "/config"],
          ].map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `px-2 py-1 rounded transition ${
                  isActive
                    ? "text-secondary font-semibold"
                    : "hover:text-gray-300"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* LOGOUT (desktop) */}
        <button
          onClick={handleLogout}
          className="hidden md:block bg-accent hover:bg-secondary text-white px-4 py-2 rounded transition text-sm font-medium"
        >
          Terminar Sessão
        </button>
      </header>

      {/* MENU MOBILE */}
      {menuOpen && (
        <div className="md:hidden bg-primary text-white flex flex-col px-6 py-4 space-y-4 shadow-lg">
          {[
            ["Sócios", "/socios"],
            ["Pagamentos", "/pagamentos"],
            ["Relatório", "/relatorio"],
            ["Dashboard", "/dashboard"],
            ["Configurações", "/config"],
          ].map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `py-2 rounded transition ${
                  isActive
                    ? "text-secondary font-semibold"
                    : "hover:text-gray-300"
                }`
              }
            >
              {label}
            </NavLink>
          ))}

          <button
            onClick={handleLogout}
            className="bg-accent hover:bg-secondary text-white px-4 py-2 rounded transition text-sm font-medium"
          >
            Terminar Sessão
          </button>
        </div>
      )}

      {/* CONTEÚDO */}
      <main className="flex-1 p-6 overflow-auto pt-24 md:pt-6">
        <Outlet />
      </main>
    </div>
  );
}
