function MetricView({ resultado }) {
  return (
    <>
      <h1>Métricas</h1>

      <div className="metric-card">
        <h2>Acurácia</h2>
        <p>{resultado.accuracy}</p>
      </div>

      <div className="metric-card">
        <h2>Precisão</h2>
        <p>{resultado.precision}</p>
      </div>

      <div className="metric-card">
        <h2>Recall</h2>
        <p>{resultado.recall}</p>
      </div>
    </>
  );
}

export default MetricView;