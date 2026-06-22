import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./ResultsPage.css";

function ResultsPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const resultado = location.state;

  if (!resultado) {
    return (
      <main className="results-page">
        <section className="results-card">
          <h1>Resultado não encontrado</h1>
          <p>
            Envie um dataset novamente para gerar um novo modelo.
          </p>

          <button
            className="advanced-results-button"
            onClick={() => navigate("/")}
          >
            Voltar
          </button>
        </section>
      </main>
    );
  }

  const linkPublico = `${window.location.origin}/model/${id}`;

  return (
    <main className="results-page">
      <section className="results-card">
        <button
          className="logout-results-button"
          onClick={() => navigate("/")}
        >
          Sair
        </button>

        <h1>{resultado.filename}</h1>

        <div className="result-box">
          <h2>Modelo treinado</h2>

          <p>
            <strong>Classificador:</strong> {resultado.classifier}
          </p>

          {resultado.target && (
            <p>
              <strong>Coluna alvo:</strong> {resultado.target}
            </p>
          )}

          {resultado.accuracy !== null && resultado.accuracy !== undefined && (
            <p>
              <strong>Acurácia:</strong> {resultado.accuracy}
            </p>
          )}

          <p>
            <strong>ID do modelo:</strong> {resultado.model_id}
          </p>

          <h2>Link gerado</h2>

          <p>{linkPublico}</p>

          <button
            className="share-results-button"
            onClick={() => {
              navigator.clipboard.writeText(linkPublico);
            }}
          >
            Copiar link
          </button>
        </div>

        <div className="results-actions">
          <button
            className="advanced-results-button"
            onClick={() =>
              navigate(`/workspace/${id}/avancado`, {
                state: resultado,
              })
            }
          >
            Opções avançadas
          </button>
        </div>
      </section>
    </main>
  );
}

export default ResultsPage;