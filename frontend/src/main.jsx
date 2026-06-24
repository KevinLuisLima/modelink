import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./pages/land/App";
import ResultsPage from "./pages/results/ResultsPage";
import Workspace from "./pages/workspace/Workspace";

import "./pages/land/App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/model/:id" element={<ResultsPage />} />
      <Route path="/model/:id/avancado" element={<Workspace />} />
    </Routes>
  </BrowserRouter>
);