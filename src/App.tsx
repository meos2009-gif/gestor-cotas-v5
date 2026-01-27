import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import RequireAuth from "./lib/RequireAuth";

import Login from "./pages/Login";
import Socios from "./pages/Socios";
import Pagamentos from "./pages/Pagamentos";
import Dashboard from "./pages/Dashboard";
import Config from "./pages/Config";
import Relatorio from "./pages/Relatorio";

export default function App() {
  return (
    <Routes>

      {/* LOGIN — tem de vir ANTES de tudo */}
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
      </Route>

      {/* CATCH-ALL PARA EVITAR 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />

    </Routes>
  );
}
