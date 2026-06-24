import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ResultsPage.css";

function ResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [resultado, setResultado] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [linkCopiado, setLinkCopiado] = useState(false);

  useEffect(() => {
    async function carregarResultado() {
      try {
        const response = await fetch(
          `http://localhost:8000/api/models/${id}`
        );

        if (!response.ok) {
          throw new Error("Modelo não encontrado");
        }

        const data = await response.json();
        setResultado(data);
      } catch (error) {
        console.error(error);
      } finally {
        setCarregando(false);
      }
    }

    carregarResultado();
  }, [id]);

  if (carregando) {
    return (
      <main className="results-page">
        <section className="results-card">
          <h1>Carregando resultado...</h1>
        </section>
      </main>
    );
  }

  if (!resultado) {
    return (
      <main className="results-page">
        <section className="results-card">
          <h1>Modelo não encontrado</h1>
          <button onClick={() => navigate("/")}>
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

        <h1>Resultado do modelo</h1>
        
        <div className="result-box">
          <p>
            <strong>Classificador:</strong> {resultado.classifier}
          </p>

          {resultado.target && (
            <p>
              <strong>Coluna alvo:</strong> {resultado.target}
            </p>
          )}

          <h2>Métricas</h2>

          <p>
            <strong>Acurácia:</strong> {resultado.accuracy}
          </p>

          <p>
            <strong>Precisão:</strong> {resultado.precision}
          </p>

          <p>
            <strong>Recall:</strong> {resultado.recall}
          </p>

          {resultado.tree_image && resultado.algorithm === "DecisionTree" && (
            <>
              <h2>Árvore de decisão</h2>

              <img
                className="tree-image"
                src={resultado.tree_image}
                alt="Árvore de decisão"
              />
            </>
          )}

          {resultado.confusion_matrix && resultado.class_names && (
            <>
              <h2>Matriz de confusão</h2>

              <div className="confusion-wrapper">
                <table className="confusion-table">
                  <thead>
                    <tr>
                      <th>Real / Previsto</th>

                      {resultado.class_names.map((classe) => (
                        <th key={classe}>{classe}</th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {resultado.confusion_matrix.map((linha, i) => (
                      <tr key={i}>
                        <th>{resultado.class_names[i]}</th>

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
            </>
          )}

          <div className="results-actions">
            <button
              className="advanced-results-button"
              onClick={() => navigate(`/model/${id}/avancado`)}
            >
              Opções avançadas
            </button>

            <button
              className="share-results-button"
              onClick={() => {
                navigator.clipboard.writeText(linkPublico);
                setLinkCopiado(true);

                setTimeout(() => {
                  setLinkCopiado(false);
                }, 2500);
              }}
            >
              Copiar link
            </button>
          </div>
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