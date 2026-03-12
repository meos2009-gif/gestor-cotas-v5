import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Convocatoria from "./pages/Convocatoria";

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
