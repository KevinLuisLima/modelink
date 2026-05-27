import { useState } from "react";

import Navbar from "../../components/Navbar";
import TableView from "../../components/TableView";
import ClassifierView from "../../components/ClassifierView";
import AccuracyView from "../../components/AccuracyView";
import DashboardView from "../../components/DashboardView";

import "../../styles/Workspace.css";

function Workspace() {
  const [activeTab, setActiveTab] = useState("tabela");

  function renderContent() {
    switch (activeTab) {
      case "tabela":
        return <TableView />;

      case "classificador":
        return <ClassifierView />;

      case "acuracia":
        return <AccuracyView />;

      case "dashboard":
        return <DashboardView />;

      default:
        return <TableView />;
    }
  }

  return (
    <main className="workspace-page">

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <section className="workspace-content">
        {renderContent()}
      </section>

    </main>
  );
}

export default Workspace;