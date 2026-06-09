import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./ResultsPage.css";

function ResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [linkCopiado, setLinkCopiado] = useState(false);

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
        <button
          className="share-results-button"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            setLinkCopiado(true);

            setTimeout(() => {
              setLinkCopiado(false);
            }, 2500);
          }}
        >
          Compartilhar
        </button>
      </section>
      {linkCopiado && (
        <div className="copy-toast">
          Link copiado com sucesso!
        </div>
      )}
    </main>
  );
}

export default ResultsPage;