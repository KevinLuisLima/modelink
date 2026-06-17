import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ResultsPage.css";

function ResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [resultado, setResultado] = useState(null);
  const [linkCopiado, setLinkCopiado] = useState(false);

  useEffect(() => {
    async function carregarResultado() {
      try {
        const response = await fetch(
          `http://localhost:8000/api/result/${id}`
        );

        const data = await response.json();
        setResultado(data);
      } catch (error) {
        console.error(error);
      }
    }

    carregarResultado();
  }, [id]);

  if (!resultado) {
    return (
      <main className="results-page">
        <section className="results-card">
          <h1>Carregando resultado...</h1>
        </section>
      </main>
    );
  }

  const result = resultado.classification_result;

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

        {result ? (
          <div className="result-box">
            <img
              className="tree-image"
              src={result.tree_image}
              alt="Árvore de decisão"
            />

            <h2>Métricas</h2>
            <p>{result.translated_metrics.accuracy}</p>
            <p>{result.translated_metrics.precision}</p>
            <p>{result.translated_metrics.recall}</p>

            <h2>Importância das variáveis</h2>
            {result.feature_importance.map((item) => (
              <p key={item.feature}>
                <strong>{item.feature}</strong>: {item.importance}
              </p>
            ))}

            <h2>Matriz de confusão</h2>
              <div className="confusion-wrapper">
                <table className="confusion-table">
                  <thead>
                    <tr>
                      <th>Real / Previsto </th>

                      {result.class_names.map((classe) => (
                        <th key={classe}>{classe}</th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {result.confusion_matrix.map((linha, i) => (
                      <tr key={i}>
                        <th>{result.class_names[i]}</th>

                        {linha.map((valor, j) => (
                          <td
                            key={j}
                            className={i === j ? "correct-cell" : "error-cell"}
                          >
                            {valor}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            <p>{result.human_confusion.explanation}</p>

            <h2>Regras extraídas da árvore</h2>
            <pre>{result.rules}</pre>   
          </div>
        ) : (
          <p>Nenhum resultado de classificação encontrado.</p>
        )}

        <div className="results-actions">
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
        </div>
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