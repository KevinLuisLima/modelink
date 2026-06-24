import "../styles/Classifier.css";

function ClassifierView({ resultado }) {
  return (
    <section className="classifier-page">
      <h1>Seu classificador</h1>

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

      {resultado.tree_image && (
        <>
          <h2>Árvore de decisão</h2>

          <div className="tree-card">
            <img
              src={resultado.tree_image}
              alt="Árvore de decisão"
              className="tree-image"
            />
          </div>
        </>
      )}

      <h2>Variáveis usadas</h2>

      <div className="features-table-wrapper">
        <table className="features-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Variável</th>
            </tr>
          </thead>

          <tbody>
            {resultado.features?.map((feature, index) => (
              <tr key={feature}>
                <td>{index + 1}</td>
                <td>{feature}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ClassifierView;