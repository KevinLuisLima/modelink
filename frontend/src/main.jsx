import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import App from "./Landpage/App";
import Tabela from "./Tabelapage/Tabela";

import "./Landpage/App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/tabela/:id" element={<Tabela />} />
    </Routes>
  </BrowserRouter>
);