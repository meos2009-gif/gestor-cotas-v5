
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
<Route path="/convocatoria/:gameId" element={<ConvocatoriaNova />} />
<Route path="/convocatoria/:gameId" element={<div style={{padding: 20}}>TESTE MARIO</div>} />

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/convocatoria/:gameId" element={<Convocatoria />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
