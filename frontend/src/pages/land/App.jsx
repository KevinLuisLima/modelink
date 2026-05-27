import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

function App() {
  const navigate = useNavigate();
  const [arquivo, setArquivo] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [classificador, setClassificador] = useState("randomforest")
  const [menuAberto, setMenuAberto] = useState(false);
  const classificadores = [
    { value: "randomforest", label: "Random Forest" },
    { value: "svm", label: "SVM" },
    { value: "knn", label: "KNN" },
    { value: "decisiontree", label: "Decision Tree" },
  ];

  async function classificarArquivo() {
    if (!arquivo) {
      setMensagem("Selecione um arquivo primeiro.");
      return;
    }

    const formData = new FormData();
    formData.append("file", arquivo);

    try {
      setCarregando(true);
      setMensagem("");

      const response = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar arquivo.");
      }

      const data = await response.json();
      console.log(data);

      navigate(`/workspace/${data.dataset_id}`);
    } catch (error) {
      console.error(error);
      setMensagem("Erro ao conectar com o backend.");
    } finally {
      setCarregando(false);
    }
  }

  return (
  <main className="landing-page">

    <section className="hero-section">

      <h1>Modelink</h1>

      <p>
        Envie seu dataset e escolha qual modelo
        de classificação utilizar.
      </p>

    </section>

    <section className="content-section">
      <div className="upload-card classifier-card">
        <label className="label">Classificador</label>
        <p>
          Escolha o classificador:
        </p>
        <div className="custom-select">
          <button
            type="button"
            className="custom-select-button"
            onClick={() => setMenuAberto(!menuAberto)}
          >
            {classificadores.find((c) => c.value === classificador)?.label}
            <span>⌄</span>
          </button>

          {menuAberto && (
            <ul className="custom-select-list">
              {classificadores.map((item) => (
                <li
                  key={item.value}
                  className="custom-select-item"
                  onClick={() => {
                    setClassificador(item.value);
                    setMenuAberto(false);
                  }}
                >
                  {item.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="upload-card">

        <label className="label">
          Arquivo
        </label>

        <label className="upload-area">

          <input
            type="file"
            accept=".csv,.xlsx,.xls,.tsv"
            onChange={(e) =>
              setArquivo(e.target.files[0])
            }
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
          className="generate-button"
          onClick={classificarArquivo}
          disabled={carregando}
        >
          ✧ {carregando ? "Gerando..." : "Gerar"}
        </button>

        {mensagem && (
          <p className="message">
            {mensagem}
          </p>
        )}

      </div>

    </section>

  </main>
);
}

export default App;