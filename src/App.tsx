import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import RequireAuth from "./lib/RequireAuth";

import Login from "./pages/Login";
import Socios from "./pages/Socios";
import Pagamentos from "./pages/Pagamentos";
import Dashboard from "./pages/Dashboard";
import Config from "./pages/Config";
import Relatorio from "./pages/Relatorio";
import Jantar from "./pages/Jantar";
import RelatorioJantares from "./pages/RelatorioJantares";
import Tesouraria from "./pages/Tesouraria";

// 🔵 IMPORTA AS NOVAS PÁGINAS
import Estatisticas from "./pages/Estatisticas";
import Contabilidade from "./pages/Contabilidade";

// ❌ REMOVIDO: Calendario
// ❌ REMOVIDO: Calendario2026
// ❌ REMOVIDO: ConvocatoriaNova

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
        <Route path="/contabilidade" element={<Contabilidade />} />

        {/* ❌ REMOVIDO: /calendario */}
        {/* ❌ REMOVIDO: /convocatoria/:gameId */}

        <Route path="/estatisticas" element={<Estatisticas />} />
      </Route>

      {/* ❌ REMOVIDO: /calendario-2026 */}

      {/* CATCH-ALL */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />

    </Routes>
  );
}
