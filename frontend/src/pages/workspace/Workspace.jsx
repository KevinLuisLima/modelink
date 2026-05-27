import { useState } from "react";
import { useParams } from "react-router-dom";

import Navbar from "../../components/Navbar";
import TableView from "../../components/TableView";
import ClassifierView from "../../components/ClassifierView";
import AccuracyView from "../../components/AccuracyView";
import DashboardView from "../../components/DashboardView";

import "./Workspace.css";

function Workspace() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("tabela");

  function renderContent() {
    if (activeTab === "tabela") {
      return <TableView datasetId={id} />;
    }

    if (activeTab === "classificador") {
      return <ClassifierView datasetId={id} />;
    }

    if (activeTab === "acuracia") {
      return <AccuracyView datasetId={id} />;
    }

    if (activeTab === "dashboard") {
      return <DashboardView datasetId={id} />;
    }

    return <TableView datasetId={id} />;
  }

  return (
    <main className="workspace-page">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <section className="workspace-content">
        {renderContent()}
      </section>
    </main>
  );
}

export default Workspace;