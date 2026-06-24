function ClassifierView({ resultado }) {
  return (
    <>
      <h1>Classificador</h1>

      <p>
        <strong>Modelo:</strong>{" "}
        {resultado.classifier}
      </p>

      <p>
        <strong>Target:</strong>{" "}
        {resultado.target}
      </p>

      {resultado.tree_image && (
        <img
          src={resultado.tree_image}
          alt="Árvore"
          className="tree-image"
        />
      )}
    </>
  );
}

export default ClassifierView;