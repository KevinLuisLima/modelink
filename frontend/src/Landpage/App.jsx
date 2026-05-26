import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

function App() {
  const navigate = useNavigate();
  const [arquivo, setArquivo] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

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

      navigate(`/tabela/${data.dataset_id}`);
    } catch (error) {
      console.error(error);
      setMensagem("Erro ao conectar com o backend.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="page">
      <section className="hero">
        <h1>Classificador Automático de Planilhas</h1>
        <p>
          Envie um arquivo, e receba
          a sua classificação.
        </p>
      </section>

      <section className="card">
        <label className="label">Arquivo</label>

        <label className="upload-area">
          <input
            type="file"
            accept=".csv,.xlsx,.xls,.tsv"
            onChange={(e) => setArquivo(e.target.files[0])}
          />
          <span className="upload-icon">⇧</span>
          <span>
            {arquivo
              ? arquivo.name
              : "Clique para enviar (CSV, XLSX, XLS ou TSV)"}
          </span>
        </label>
        <button
          className="button"
          onClick={classificarArquivo}
          disabled={carregando}
        >
          ✧ {carregando ? "Gerando..." : "Gerar"}
        </button>

        {mensagem && <p className="message">{mensagem}</p>}
      </section>
    </main>
  );
}

export default App;