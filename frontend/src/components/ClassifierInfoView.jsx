import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/ClassifierInfoView.css";
import { API_URL } from "../../config";

function ClassifierInfoView() {
  const { id } = useParams();
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [info, setInfo] = useState(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
  fetch(`${API_URL}/api/info/${id}`)
    .then((res) => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then((data) => setInfo(data))
    .catch(() => setErro(true));
}, [id]);

  function compartilhar() {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopiado(true);
    setTimeout(() => setLinkCopiado(false), 2500);
  }

  if (erro) {
    return (
      <div className="info-page">
        <div className="info-header">
          <h1 className="info-title">Informações do Classificador</h1>
          <p className="info-subtitle" style={{ color: "#dc2626" }}>
            Não foi possível carregar as informações. Tente reenviar o arquivo.
          </p>
        </div>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="info-page">
        <div className="info-header">
          <h1 className="info-title">Informações do Classificador</h1>
          <p className="info-subtitle">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="info-page">
      <div className="info-header">
        <h1 className="info-title">Informações do Classificador</h1>
        <p className="info-subtitle">
          Detalhes sobre o modelo utilizado para classificação dos dados enviados.
        </p>
      </div>

      <div className="info-grid">
        <div className="info-card">
          <span className="info-card-label">Modelo</span>
          <span className="info-card-value">{info.classifier}</span>
        </div>

        <div className="info-card">
          <span className="info-card-label">ID do Workspace</span>
          <span className="info-card-value info-card-mono">{info.dataset_id}</span>
        </div>

        <div className="info-card">
          <span className="info-card-label">Status</span>
          <span className="info-card-value">
            <span className="info-badge info-badge-success">{info.status}</span>
          </span>
        </div>

        <div className="info-card">
          <span className="info-card-label">Arquivo</span>
          <span className="info-card-value">{info.filename}</span>
        </div>

        <div className="info-card">
          <span className="info-card-label">Linhas × Colunas</span>
          <span className="info-card-value">{info.rows} × {info.columns}</span>
        </div>

        <div className="info-card">
          <span className="info-card-label">Tipo de tarefa</span>
          <span className="info-card-value">{info.task_type}</span>
        </div>

        <div className="info-card">
          <span className="info-card-label">Formato de entrada</span>
          <span className="info-card-value">{info.input_format}</span>
        </div>

        <div className="info-card">
          <span className="info-card-label">Plataforma</span>
          <span className="info-card-value">{info.platform}</span>
        </div>
      </div>

      <div className="info-actions">
        <button
          className="info-btn info-btn-share"
          onClick={compartilhar}
        >
          Compartilhar
        </button>
      </div>

      {linkCopiado && (
        <div className="copy-toast">
          Link copiado com sucesso!
        </div>
      )}
    </div>
  );
}

export default ClassifierInfoView;
