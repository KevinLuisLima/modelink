import "../styles/Dashboard.css";

function DashboardView({ resultado }) {
  const matrix = resultado.confusion_matrix || [];
  const classes = resultado.class_names || [];

  const total = matrix.flat().reduce((acc, value) => acc + value, 0);

  const acertos = matrix.reduce((acc, linha, i) => {
    return acc + (linha[i] || 0);
  }, 0);

  const erros = total - acertos;

  const desempenhoPorClasse = classes.map((classe, i) => {
    const totalClasse = matrix[i]?.reduce((a, b) => a + b, 0) || 0;
    const acertosClasse = matrix[i]?.[i] || 0;

    return {
      classe,
      totalClasse,
      acertosClasse,
      errosClasse: totalClasse - acertosClasse,
      taxa:
        totalClasse > 0
          ? Number(((acertosClasse / totalClasse) * 100).toFixed(1))
          : 0,
    };
  });

  return (
    <section className="dashboard-page">
      <h1>Dashboard do seu modelo</h1>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <span>Total testado</span>
          <strong>{total}</strong>
        </div>

        <div className="dashboard-card">
          <span>Acertos</span>
          <strong>{acertos}</strong>
        </div>

        <div className="dashboard-card">
          <span>Erros</span>
          <strong>{erros}</strong>
        </div>

        <div className="dashboard-card">
          <span>Acurácia</span>
          <strong>{Number(resultado.accuracy * 100).toFixed(1)}%</strong>
        </div>
      </div>

      <h2>Acertos x Erros</h2>

      <div className="chart-card">
        <div className="horizontal-bar-row">
          <span>Acertos</span>
          <div className="bar-bg">
            <div
              className="bar-fill success"
              style={{ width: `${total ? (acertos / total) * 100 : 0}%` }}
            />
          </div>
          <strong>{acertos}</strong>
        </div>

        <div className="horizontal-bar-row">
          <span>Erros</span>
          <div className="bar-bg">
            <div
              className="bar-fill error"
              style={{ width: `${total ? (erros / total) * 100 : 0}%` }}
            />
          </div>
          <strong>{erros}</strong>
        </div>
      </div>

      <h2>Desempenho por classe</h2>

      <div className="chart-card">
        {desempenhoPorClasse.map((item) => (
          <div className="class-row" key={item.classe}>
            <span>{item.classe}</span>

            <div className="bar-bg">
              <div
                className="bar-fill"
                style={{ width: `${item.taxa}%` }}
              />
            </div>

            <strong>{item.taxa}%</strong>
          </div>
        ))}
      </div>

      <h2>Distribuição real das classes no teste</h2>

      <div className="vertical-chart">
        {desempenhoPorClasse.map((item) => {
          const height = total ? (item.totalClasse / total) * 180 : 0;

          return (
            <div className="vertical-item" key={item.classe}>
              <div className="vertical-bar-wrapper">
                <div
                  className="vertical-bar"
                  style={{ height: `${height}px` }}
                />
              </div>

              <span>{item.classe}</span>
              <strong>{item.totalClasse}</strong>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default DashboardView;