function DashboardView({ resultado }) {
  const matrix =
    resultado.confusion_matrix || [];

  let totalAcertos = 0;

  matrix.forEach((row, i) => {
    totalAcertos += row[i] || 0;
  });

  const totalRegistros =
    matrix.flat().reduce(
      (acc, value) => acc + value,
      0
    );

  return (
    <>
      <h1>Dashboard</h1>

      <div className="dashboard-card">
        <h2>Total Avaliado</h2>
        <p>{totalRegistros}</p>
      </div>

      <div className="dashboard-card">
        <h2>Acertos</h2>
        <p>{totalAcertos}</p>
      </div>

      <div className="dashboard-card">
        <h2>Erros</h2>
        <p>
          {totalRegistros - totalAcertos}
        </p>
      </div>
    </>
  );
}

export default DashboardView;