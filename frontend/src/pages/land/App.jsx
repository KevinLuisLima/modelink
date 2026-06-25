import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import "./App.css";

function App() {
  const navigate = useNavigate();

  const [arquivo, setArquivo] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  const [classificador, setClassificador] = useState("decisiontree");
  const [menuAberto, setMenuAberto] = useState(false);
  const [mostrarAvancado, setMostrarAvancado] = useState(false);

  const [targetColumn, setTargetColumn] = useState("");
  const [columns, setColumns] = useState([]);

  const classificadores = [
    { value: "decisiontree", label: "Decision Tree" },
    { value: "randomforest", label: "Random Forest" },
    { value: "svm", label: "SVM" },
    { value: "knn", label: "KNN" },
  ];

  async function classificarArquivo() {
    if (!arquivo) {
      setMensagem("Selecione um arquivo primeiro.");
      return;
    }

    const formData = new FormData();

    formData.append("file", arquivo);
    formData.append("classifier", classificador);
    formData.append("target_column", targetColumn);

    try {
      setCarregando(true);
      setMensagem("");

      const response = await fetch(
        "http://localhost:8000/api/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
          errorData.detail || "Erro ao enviar arquivo."
        );
      }

      const data = await response.json();

      navigate(`/model/${data.model_id}`);
      
    } catch (error) {
      console.error(error);
      setMensagem(error.message);
    } finally {
      setCarregando(false);
    }
  }

  function handleArquivoSelecionado(e) {
    const file = e.target.files[0];

    if (!file) return;

    setArquivo(file);

    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);

      const workbook = XLSX.read(data, {
        type: "array",
      });

      const firstSheet = workbook.SheetNames[0];

      const worksheet =
        workbook.Sheets[firstSheet];

      const json =
        XLSX.utils.sheet_to_json(
          worksheet,
          {
            header: 1,
          }
        );

      if (json.length > 0) {
        const headers = json[0]
          .map((col) => String(col).trim())
          .filter(Boolean);

        setColumns(headers);

        // última coluna vira alvo padrão
        setTargetColumn(headers[headers.length - 1]);
      }
    };

    reader.readAsArrayBuffer(file);
  }

  return (
    <main className="landing-page">
      <section className="hero-section">
        <h1>Modelink</h1>

        <p>
          Envie seu dataset e receba a classificação dos dados.
        </p>
      </section>

      <section className="content-section single-card">
        <div className="upload-card">

          <label className="label">
            Arquivo
          </label>

          <label className="upload-area">
            <input
              type="file"
              accept=".csv,.xlsx,.xls,.tsv"
              onChange={handleArquivoSelecionado}
            />

            <span className="upload-icon">
              ⇧
            </span>

            <span>
              {arquivo
                ? arquivo.name
                : "Clique para enviar (CSV, XLSX, XLS ou TSV)"}
            </span>
          </label>

          <button
            type="button"
            className="advanced-button"
            onClick={() =>
              setMostrarAvancado(!mostrarAvancado)
            }
          >
            {mostrarAvancado
              ? "Ocultar opções avançadas"
              : "Opções avançadas"}
          </button>

          {mostrarAvancado && (
            <div className="advanced-box">

              <h3 className="classifier-title">
                Classificador
              </h3>

              <div className="custom-select">
                <button
                  type="button"
                  className="custom-select-button"
                  onClick={() =>
                    setMenuAberto(!menuAberto)
                  }
                >
                  {
                    classificadores.find(
                      (c) =>
                        c.value === classificador
                    )?.label
                  }

                  <span>⌄</span>
                </button>

                {menuAberto && (
                  <ul className="custom-select-list">

                    {classificadores.map(
                      (item) => (
                        <li
                          key={item.value}
                          className="custom-select-item"
                          onClick={() => {
                            setClassificador(
                              item.value
                            );

                            setMenuAberto(
                              false
                            );
                          }}
                        >
                          {item.label}
                        </li>
                      )
                    )}

                  </ul>
                )}
              </div>

              <h3
                className="classifier-title"
                style={{
                  marginTop: "24px",
                }}
              >
                Coluna alvo
              </h3>

              <select
                className="target-select"
                value={targetColumn}
                onChange={(e) =>
                  setTargetColumn(
                    e.target.value
                  )
                }
              >
                {columns.map((col) => (
                  <option
                    key={col}
                    value={col}
                  >
                    {col}
                  </option>
                ))}
              </select>

              <small>
                Padrão: última coluna do dataset.
              </small>

            </div>
          )}

          <button
            className="generate-button"
            onClick={classificarArquivo}
            disabled={carregando}
          >
            ✧ {carregando
              ? "Gerando..."
              : "Gerar"}
          </button>

          {mensagem && (
            <div className="error-box">
              <strong>Não foi possível treinar o modelo</strong>
              <p>{mensagem}</p>
            </div>
          )}

        </div>
      </section>
    </main>
  );
}

export default App;