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
import Stats2025_26 from "./pages/Stats2025_26";
import Stats2026_27 from "./pages/Stats2026_27";

// NOVOS
import Calendario2025_26 from "./pages/Calendario2025_26";
import Calendario2026_27 from "./pages/Calendario2026_27";
import Convocatoria from "./pages/Convocatoria";
import Resultado from "./pages/Resultado";

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

        {/* Páginas principais */}
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
        <Route path="/stats/25-26" element={<Stats2025_26 />} />
        <Route path="/stats/26-27" element={<Stats2026_27 />} />


        {/* CALENDÁRIOS POR ÉPOCA */}
        <Route path="/calendario-25-26" element={<Calendario2025_26 />} />
        <Route path="/calendario-26-27" element={<Calendario2026_27 />} />

        {/* CONVOCATÓRIA E RESULTADO */}
        <Route path="/convocatoria/:gameId" element={<Convocatoria />} />
        <Route path="/resultado/:gameId" element={<Resultado />} />

        {/* REDIRECIONAR /jogos → época atual */}
        <Route path="/jogos" element={<Navigate to="/calendario-26-27" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
