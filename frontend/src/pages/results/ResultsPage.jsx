import { useParams, useNavigate } from "react-router-dom";
import "./ResultsPage.css";

function ResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <main className="results-page">
      <section className="results-card">
        <button
            className="logout-results-button"
            onClick={() => navigate("/")}
        >
            Sair
        </button>
        <h1>Classificação</h1>

        <p>
          O arquivo foi enviado e processado com sucesso.
        </p>

        <div className="result-box">
          
        </div>

        <button
          className="advanced-results-button"
          onClick={() => navigate(`/workspace/${id}/avancado`)}
        >
          Opções avançadas
        </button>
      </section>
    </main>
  );
}

export default ResultsPage;