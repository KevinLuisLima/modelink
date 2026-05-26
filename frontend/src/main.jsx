import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import App from "./pages/land/App";
import Workspace from "./pages/workspace/workspace";

import "./pages/land/App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/workspace/:id" element={<Workspace />} />
    </Routes>
  </BrowserRouter>
);