import "../styles/Metric.css";

function MetricView({ resultado }) {
  const metricas = [
    {
      nome: "Acurácia",
      valor: resultado.accuracy,
      descricao: "Percentual geral de previsões corretas.",
    },
    {
      nome: "Precisão",
      valor: resultado.precision,
      descricao: "Das previsões feitas para uma classe, quantas estavam corretas.",
    },
    {
      nome: "Recall",
      valor: resultado.recall,
      descricao: "Dos casos reais de uma classe, quantos o modelo conseguiu encontrar.",
    },
  ];

  return (
    <section className="metrics-page">
      <h1>Métricas do seu modelo</h1>

      <div className="metrics-table-wrapper">
        <table className="metrics-table">
          <thead>
            <tr>
              <th>Métrica</th>
              <th>Valor</th>
              <th>Interpretação</th>
            </tr>
          </thead>

          <tbody>
            {metricas.map((metrica) => (
              <tr key={metrica.nome}>
                <td>{metrica.nome}</td>
                <td>{Number(metrica.valor).toFixed(4)}</td>
                <td>{metrica.descricao}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {resultado.confusion_matrix && resultado.class_names && (
        <>
          <h2>Matriz de confusão</h2>

          <div className="confusion-wrapper">
            <table className="confusion-table">
              <thead>
                <tr>
                  <th className="axis-header">
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
    </section>
  );
}

export default MetricView;