import { NavLink, Outlet } from "react-router-dom";
import { supabase } from "../supabaseClient";
import logo from "../assets/logo.png";

export default function MainLayout() {
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

        {/* MENU HORIZONTAL */}
        <nav className="flex space-x-6 text-sm font-medium">
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

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="bg-accent hover:bg-secondary text-white px-4 py-2 rounded transition text-sm font-medium"
        >
          Terminar Sessão
        </button>
      </header>

      {/* CONTEÚDO */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
