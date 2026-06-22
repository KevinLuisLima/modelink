import { useState } from "react";
import Navbar from "../../components/Navbar";
import ClassifierView from "../../components/ClassifierView";
import AccuracyView from "../../components/AccuracyView";
import DashboardView from "../../components/DashboardView";
import "./Workspace.css";

function Workspace() {
  const [activeTab, setActiveTab] = useState("classificador");

  function renderTab() {
    switch (activeTab) {
      case "classificador":
        return <ClassifierView />;
      case "acuracia":
        return <AccuracyView />;
      case "dashboard":
        return <DashboardView />;
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