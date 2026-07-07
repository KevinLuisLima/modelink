import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import Navbar from "../../components/Navbar";
import ClassifierView from "../../components/ClassifierView";
import MetricView from "../../components/MetricView";
import DashboardView from "../../components/DashboardView";

import "./Workspace.css";
import { API_URL } from "../../config";

function Workspace() {
  const [activeTab, setActiveTab] = useState("classificador");
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState("");

  const { id } = useParams();

  useEffect(() => {
    async function carregar() {
      try {
        const response = await fetch(`${API_URL}/api/models/${id}`);

        if (!response.ok) {
          throw new Error("Modelo não encontrado.");
        }

        const data = await response.json();
        setResultado(data);
      } catch (error) {
        console.error(error);
        setErro(error.message);
      }
    }

    carregar();
  }, [id]);

  if (erro) {
    return (
      <div className="workspace">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="workspace-content">
          <h1>{erro}</h1>
        </main>
      </div>
    );
  }

  if (!resultado) {
    return (
      <div className="workspace">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="workspace-content">
          <h1>Carregando...</h1>
        </main>
      </div>
    );
  }

  function renderTab() {
    switch (activeTab) {
      case "classificador":
        return <ClassifierView resultado={resultado} />;
      case "metricas":
        return <MetricView resultado={resultado} />;
      case "dashboard":
        return <DashboardView resultado={resultado} />;
      default:
        return <ClassifierView resultado={resultado} />;
    }
  }

  return (
    <div className="workspace">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="workspace-content">
        {renderTab()}
      </main>
    </div>
  );
}

export default Workspace;