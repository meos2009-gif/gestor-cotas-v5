import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import RequireAuth from "./lib/RequireAuth";

import Calendario2026 from "./pages/Calendario2026";
import Login from "./pages/Login";
import Socios from "./pages/Socios";
import Pagamentos from "./pages/Pagamentos";
import Dashboard from "./pages/Dashboard";
import Config from "./pages/Config";
import Relatorio from "./pages/Relatorio";

import Jantar from "./pages/Jantar";
import RelatorioJantares from "./pages/RelatorioJantares";
import Tesouraria from "./pages/Tesouraria";

import Calendario from "./pages/Calendario";

// 🔵 IMPORTA AS NOVAS PÁGINAS (FALTAVAM ESTES!)
import Convocatoria from "./pages/Convocatoria";
import Estatisticas from "./pages/Estatisticas";

export default function App() {
  return (
    <Routes>

      {/* LOGIN */}
      <Route path="/login" element={<Login />} />

      {/* ROTAS PROTEGIDAS */}
      <Route
        element={
          <RequireAuth>
            <MainLayout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/socios" element={<Socios />} />
        <Route path="/pagamentos" element={<Pagamentos />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/config" element={<Config />} />
        <Route path="/relatorio" element={<Relatorio />} />

        {/* NOVAS ROTAS */}
        <Route path="/jantar" element={<Jantar />} />
        <Route path="/relatorio-jantares" element={<RelatorioJantares />} />
        <Route path="/tesouraria" element={<Tesouraria />} />

        {/* CALENDÁRIO */}
        <Route path="/calendario" element={<Calendario />} />

        {/* CONVOCATÓRIA */}
        <Route path="/convocatoria/:gameId" element={<Convocatoria />} />

        {/* ESTATÍSTICAS */}
        <Route path="/estatisticas" element={<Estatisticas />} />
      </Route>

      {/* CALENDÁRIO 2026 (fora do layout) */}
      <Route path="/calendario-2026" element={<Calendario2026 />} />

      {/* CATCH-ALL */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />

    </Routes>
  );
}
