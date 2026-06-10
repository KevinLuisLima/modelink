import { useState } from "react";
import Navbar from "../../components/Navbar";
import TableView from "../../components/TableView";
import ClassifierView from "../../components/ClassifierView";
import AccuracyView from "../../components/AccuracyView";
import DashboardView from "../../components/DashboardView";
import ClassifierInfoView from "../../components/ClassifierInfoView";
import "./Workspace.css";

function Workspace() {
  const [activeTab, setActiveTab] = useState("tabela");

  function renderTab() {
    switch (activeTab) {
      case "tabela":
        return <TableView />;
      case "classificador":
        return <ClassifierView />;
      case "acuracia":
        return <AccuracyView />;
      case "dashboard":
        return <DashboardView />;
      case "informacoes":
        return <ClassifierInfoView />;
      default:
        return <TableView />;
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