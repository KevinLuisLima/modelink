import { useEffect, useState } from "react";
import { useNavigate , useParams } from "react-router-dom";
import "./Tabela.css";

function Tabela() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dados, setDados] = useState(null);

  useEffect(() => {
    async function carregarTabela() {
      try {
        const response = await fetch(
          `http://localhost:8000/api/dataset/${id}`
        );

        const data = await response.json();

        setDados(data);
      } catch (error) {
        console.error(error);
      }
    }

    carregarTabela();
  }, [id]);

  if (!dados) {
    return (
      <div className="loading">
        <h2>Carregando tabela...</h2>
      </div>
    );
  }

  return (
    <main className="table-page">
      <button className="back-button"
        onClick={() => navigate("/")}
      >
        ← Voltar
      </button>
      <h1 className="table-title">
        {dados.filename}
      </h1>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {dados.columns.map((coluna) => (
                <th key={coluna}>
                  {coluna}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {dados.preview.map((linha, index) => (
              <tr key={index}>
                {dados.columns.map((coluna) => (
                  <td key={coluna}>
                    {String(linha[coluna])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default Tabela;