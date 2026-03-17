import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [paymentsOpen, setPaymentsOpen] = useState(false);

  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">

      {/* NAVBAR SUPERIOR */}
      <nav className="bg-primary text-text px-6 py-4 shadow-md border-b border-secondary flex justify-between items-center">
        
        {/* LOGO + TÍTULO */}
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
          <h1 className="text-xl font-bold text-secondary">Gestor de Cotas</h1>
        </div>

        {/* BOTÕES À DIREITA */}
        <div className="flex items-center gap-4">

          {/* LOGOUT DESKTOP */}
          <button
            onClick={handleLogout}
            className="hidden md:block bg-accent hover:bg-secondary px-4 py-2 rounded-md text-white"
          >
            Terminar Sessão
          </button>

          {/* BOTÃO MENU MOBILE */}
          <button
            className="text-3xl text-secondary md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
        </div>
      </nav>

      {/* OVERLAY MOBILE */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-[9998]"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* SIDEBAR MÓVEL */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-primary text-text shadow-xl z-[9999] transform transition-transform duration-300 md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 flex flex-col gap-6">

          {/* LOGO NO MENU */}
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-12 h-12" />
            <h2 className="text-lg font-bold text-secondary">Menu</h2>
          </div>

          {/* LINKS */}
          <NavLink to="/dashboard" className="hover:text-secondary" onClick={() => setSidebarOpen(false)}>Dashboard</NavLink>
          <NavLink to="/socios" className="hover:text-secondary" onClick={() => setSidebarOpen(false)}>Sócios</NavLink>

          {/* RELATÓRIOS */}
          <div>
            <button
              onClick={() => setReportsOpen(!reportsOpen)}
              className="w-full text-left hover:text-secondary"
            >
              Relatórios ▾
            </button>

            {reportsOpen && (
              <div className="ml-4 mt-2 flex flex-col gap-2">
                <NavLink to="/relatorio" className="hover:text-secondary" onClick={() => setSidebarOpen(false)}>Relatório de Cotas</NavLink>
                <NavLink to="/relatorio-jantares" className="hover:text-secondary" onClick={() => setSidebarOpen(false)}>Relatório Jantares</NavLink>
              </div>
            )}
          </div>

          {/* PAGAMENTOS */}
          <div>
            <button
              onClick={() => setPaymentsOpen(!paymentsOpen)}
              className="w-full text-left hover:text-secondary"
            >
              Pagamentos ▾
            </button>

            {paymentsOpen && (
              <div className="ml-4 mt-2 flex flex-col gap-2">
                <NavLink to="/pagamentos" className="hover:text-secondary" onClick={() => setSidebarOpen(false)}>Pagamento de Cotas</NavLink>
                <NavLink to="/jantar" className="hover:text-secondary" onClick={() => setSidebarOpen(false)}>Pagamento de Jantares</NavLink>
              </div>
            )}
          </div>

          <NavLink to="/jogos" className="hover:text-secondary" onClick={() => setSidebarOpen(false)}>Jogos</NavLink>
          <NavLink to="/tesouraria" className="hover:text-secondary" onClick={() => setSidebarOpen(false)}>Tesouraria</NavLink>
          <NavLink to="/contabilidade" className="hover:text-secondary" onClick={() => setSidebarOpen(false)}>Contabilidade</NavLink>
          <NavLink to="/config" className="hover:text-secondary" onClick={() => setSidebarOpen(false)}>Configurações</NavLink>
          <NavLink to="/estatisticas" className="hover:text-secondary" onClick={() => setSidebarOpen(false)}>Estatísticas da Equipa</NavLink>

          {/* LOGOUT NO FUNDO */}
          <button
            onClick={handleLogout}
            className="bg-accent hover:bg-secondary px-4 py-2 rounded-md text-white mt-6"
          >
            Terminar Sessão
          </button>
        </div>
      </aside>

      {/* LAYOUT DESKTOP */}
      <div className="hidden md:flex flex-1">

        {/* SIDEBAR DESKTOP FIXA */}
        <aside className="bg-primary border-r border-secondary w-64 min-h-screen flex-col p-6 gap-4 text-text hidden md:flex">

          <NavLink to="/dashboard" className="hover:text-secondary">Dashboard</NavLink>
          <NavLink to="/socios" className="hover:text-secondary">Sócios</NavLink>

          <NavLink to="/relatorio" className="hover:text-secondary">Relatório de Cotas</NavLink>
          <NavLink to="/relatorio-jantares" className="hover:text-secondary">Relatório Jantares</NavLink>

          <NavLink to="/pagamentos" className="hover:text-secondary">Pagamento de Cotas</NavLink>
          <NavLink to="/jantar" className="hover:text-secondary">Pagamento de Jantares</NavLink>

          <NavLink to="/jogos" className="hover:text-secondary">Jogos</NavLink>
          <NavLink to="/tesouraria" className="hover:text-secondary">Tesouraria</NavLink>
          <NavLink to="/contabilidade" className="hover:text-secondary">Contabilidade</NavLink>
          <NavLink to="/config" className="hover:text-secondary">Configurações</NavLink>

          <NavLink to="/estatisticas" className="hover:text-secondary">Estatísticas da Equipa</NavLink>

          <button
            onClick={handleLogout}
            className="bg-accent hover:bg-secondary px-4 py-2 rounded-md text-white mt-6"
          >
            Terminar Sessão
          </button>
        </aside>

        {/* CONTEÚDO */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

      {/* CONTEÚDO MOBILE (SEM TAPAR O MENU) */}
      <main className="md:hidden flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
