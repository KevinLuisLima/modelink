import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ResultsPage.css";
import { API_URL } from "../../config";

function ResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [resultado, setResultado] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [linkCopiado, setLinkCopiado] = useState(false);

  const [predictValues, setPredictValues] = useState({});
  const [prediction, setPrediction] = useState(null);
  const [predictLoading, setPredictLoading] = useState(false);
  const [predictError, setPredictError] = useState("");

  useEffect(() => {
    async function carregarResultado() {
      try {
        const response = await fetch(`${API_URL}/api/models/${id}`);

        if (!response.ok) {
          throw new Error("Modelo não encontrado");
        }

        const data = await response.json();

        setResultado(data);

        const initialValues = {};

        (data.features || []).forEach((feature) => {
          initialValues[feature] = "";
        });

        setPredictValues(initialValues);
      } catch (error) {
        console.error(error);
      } finally {
        setCarregando(false);
      }
    }

    carregarResultado();
  }, [id]);

  const linkPublico = `${window.location.origin}/model/${id}`;

  function copiarLink() {
    navigator.clipboard.writeText(linkPublico);
    setLinkCopiado(true);
    setTimeout(() => setLinkCopiado(false), 2500);
  }

  function alterarCampo(campo, valor) {
    setPredictValues((old) => ({
      ...old,
      [campo]: valor,
    }));
  }

  async function classificarNovoRegistro() {
    try {
      setPredictLoading(true);
      setPrediction(null);
      setPredictError("");

      const valuesToSend = {};

      (resultado.features || []).forEach((feature) => {
        valuesToSend[feature] = predictValues[feature] ?? "";
      });

      console.log("Enviando para predição:", valuesToSend);

      const response = await fetch(`${API_URL}/api/models/${id}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: valuesToSend,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Erro ao realizar classificação.");
      }

      setPrediction(data);
    } catch (error) {
      console.error(error);
      setPredictError(error.message);
    } finally {
      setPredictLoading(false);
    }
  }

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

          <button
            className="share-results-button"
            onClick={() => navigate("/")}
          >
            Voltar
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="results-page">
      <section className="results-card">
        <button
          className="logout-results-button"
          onClick={() => navigate("/")}
        >
          Sair
        </button>

        <h1>{"Resultado do seu modelo"}</h1>

        <div className="result-box">
          <div className="classifier-card">
            <table className="classifier-info-table">
              <tbody>
                <tr>
                  <th>Modelo</th>
                  <td>{resultado.classifier}</td>
                </tr>

                <tr>
                  <th>Coluna alvo</th>
                  <td>{resultado.target || "Não se aplica"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Métricas</h2>

          <div className="metrics-table-wrapper">
            <table className="metrics-table">
              <thead>
                <tr>
                  <th>Métrica</th>
                  <th>Valor</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>Acurácia</td>
                  <td>{Number(resultado.accuracy).toFixed(4)}</td>
                </tr>

                <tr>
                  <td>Precisão</td>
                  <td>{Number(resultado.precision).toFixed(4)}</td>
                </tr>

                <tr>
                  <td>Recall</td>
                  <td>{Number(resultado.recall).toFixed(4)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {resultado.tree_image && resultado.algorithm === "DecisionTree" && (
            <>
              <h2>Árvore de decisão</h2>

              <div className="tree-card">
                <img
                  className="tree-image"
                  src={resultado.tree_image}
                  alt="Árvore de decisão"
                />
              </div>
            </>
          )}

          {resultado.confusion_matrix && resultado.class_names && (
            <>
              <h2>Matriz de confusão</h2>

              <div className="confusion-wrapper">
                <table className="confusion-table">
                  <thead>
                    <tr>
                      <th>
                        Real ↓
                        <br />
                        Previsto →
                      </th>

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
                            className={
                              i === j ? "correct-cell" : "error-cell"
                            }
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

          <h2>Usar o classificador</h2>

          <div className="predict-card">
            <div className="predict-grid">
              {resultado.features?.map((feature) => (
                <div className="predict-field" key={feature}>
                  <label>{feature}</label>

                  <input
                    type="text"
                    value={predictValues[feature] ?? ""}
                    onChange={(e) =>
                      alterarCampo(feature, e.target.value)
                    }
                    placeholder={`Informe ${feature}`}
                  />
                </div>
              ))}
            </div>

            <button
              className="predict-button"
              onClick={classificarNovoRegistro}
              disabled={predictLoading}
            >
              {predictLoading ? "Classificando..." : "Classificar"}
            </button>

            {predictError && (
              <div className="error-box">
                <strong>Não foi possível classificar</strong>
                <p>{predictError}</p>
              </div>
            )}

            {prediction && (
              <div className="prediction-result">
                <h3>Resultado da classificação</h3>

                <table className="prediction-table">
                  <tbody>
                    <tr>
                      <th>Classe prevista</th>
                      <td className="prediction-value">
                        {prediction.prediction}
                      </td>
                    </tr>

                    <tr>
                      <th>Confiança</th>
                      <td>
                        {prediction.confidence !== undefined
                          ? `${(prediction.confidence * 100).toFixed(1)}%`
                          : "Não disponível"}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <p className="prediction-description">
                  O modelo considera que este registro pertence à classe{" "}
                  <strong>"{prediction.prediction}"</strong>{" "}
                  {prediction.confidence !== undefined && (
                    <>
                      com{" "}
                      <strong>
                        {(prediction.confidence * 100).toFixed(1)}%
                      </strong>{" "}
                      de confiança.
                    </>
                  )}
                </p>
              </div>
            )}
          </div>

          <div className="results-actions">
            <button
              className="advanced-results-button"
              onClick={() => navigate(`/model/${id}/avancado`)}
            >
              Opções avançadas
            </button>
          </div>

          <div className="share-link-box bottom-share-link">
            <span className="share-link-label">Link público</span>

            <div className="share-link-row">
              <input
                className="share-link-input"
                type="text"
                readOnly
                value={linkPublico}
                onFocus={(e) => e.target.select()}
              />

              <button
                className="share-link-copy-btn"
                onClick={copiarLink}
              >
                {linkCopiado ? "✓ Copiado" : "Copiar link"}
              </button>
            </div>

            <p className="share-link-hint">
              Qualquer pessoa com este link pode visualizar os resultados e usar este classificador.
            </p>
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