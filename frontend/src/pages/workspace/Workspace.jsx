import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import ClassifierView from "../../components/ClassifierView";
import MetricView from "../../components/MetricView";
import DashboardView from "../../components/DashboardView";
import "./Workspace.css";

  function Workspace() {
    const [activeTab, setActiveTab] = useState("classificador");
    const { id } = useParams();
    const [resultado, setResultado] = useState(null);

    useEffect(() => {
    async function carregar() {
      const response = await fetch(
        `http://localhost:8000/api/models/${id}`
      );

      const data = await response.json();

      setResultado(data);
    }

    carregar();
  }, [id]);

  if (!resultado) {
    return <h1>Carregando...</h1>;
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
        return <ClassifierView />;
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