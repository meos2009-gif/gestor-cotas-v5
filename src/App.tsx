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
import Estatisticas from "./pages/Estatisticas";
import Contabilidade from "./pages/Contabilidade";

// NOVOS
import Jogos from "./pages/Jogos";               // 25/26
import Calendario2026 from "./pages/Calendario2026"; // 26/27
import Convocatoria from "./pages/Convocatoria";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <RequireAuth>
            <MainLayout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/socios" element={<Socios />} />
        <Route path="/pagamentos" element={<Pagamentos />} />
        <Route path="/config" element={<Config />} />
        <Route path="/relatorio" element={<Relatorio />} />
        <Route path="/jantar" element={<Jantar />} />
        <Route path="/relatorio-jantares" element={<RelatorioJantares />} />
        <Route path="/tesouraria" element={<Tesouraria />} />
        <Route path="/contabilidade" element={<Contabilidade />} />
        <Route path="/estatisticas" element={<Estatisticas />} />
        <Route path="/resultado/:gameId" element={<Convocatoria />} />
        <Route path="/jogos/:gameId" element={<Convocatoria />} />
        <Route path="/resultado/:gameId" element={<Resultado />} />

        {/* JOGOS — DIVIDIDOS POR ÉPOCA */}
        <Route path="/jogos-25-26" element={<Jogos />} />
        <Route path="/jogos-26-27" element={<Calendario2026 />} />

        {/* PÁGINA ANTIGA /jogos → redireciona para a época atual */}
        <Route path="/jogos" element={<Navigate to="/jogos-26-27" replace />} />

        {/* CONVOCATÓRIA */}
        <Route path="/jogos/:gameId" element={<Convocatoria />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
