import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/Table.css";

function TableView() {
  const { id } = useParams();

  const [dados, setDados] = useState(null);
  const [busca, setBusca] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [order, setOrder] = useState("asc");

  useEffect(() => {
    async function carregarTabela() {
      try {
        const params = new URLSearchParams();

        if (busca) params.append("search", busca);
        if (sortBy) params.append("sort_by", sortBy);
        params.append("order", order);

        const response = await fetch(
          `http://localhost:8000/api/table/${id}?${params.toString()}`
        );

        const data = await response.json();
        setDados(data);
      } catch (error) {
        console.error(error);
      }
    }

    carregarTabela();
  }, [id, busca, sortBy, order]);

  if (!dados) {
    return (
      <div className="loading">
        <h2>Carregando tabela...</h2>
      </div>
    );
  }

  return (
    <main className="table-page">
      <h1 className="table-title">{dados.filename}</h1>

      <div className="table-controls">
        <input
          className="table-search"
          placeholder="Filtrar tabela..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />

        <select
          className="table-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="">Ordenar por coluna</option>

          {dados.columns.map((coluna) => (
            <option key={coluna} value={coluna}>
              {coluna}
            </option>
          ))}
        </select>

        <select
          className="table-select"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
        >
          <option value="asc">Crescente</option>
          <option value="desc">Decrescente</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {dados.columns.map((coluna) => (
                <th key={coluna}>{coluna}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {dados.preview.map((linha, index) => (
              <tr key={index}>
                {dados.columns.map((coluna) => (
                  <td key={coluna}>{String(linha[coluna])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default TableView;