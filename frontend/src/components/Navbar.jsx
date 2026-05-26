import "../styles/Navbar.css";
import { useNavigate } from "react-router-dom";

function Navbar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();

  const buttons = [
    { id: "tabela", label: "Tabela" },
    { id: "classificador", label: "Classificador" },
    { id: "acuracia", label: "Acurácia" },
    { id: "dashboard", label: "Dashboard" },
  ];

  function sair() {
    navigate("/");
  }

  return (
    <header className="navbar">

      <div 
      className="navbar-logo"
      onClick={() => navigate("/")}
      >
        Modelink
      </div>

      <nav className="navbar-menu">

        {buttons.map((button) => (
          <button
            key={button.id}
            className={
              activeTab === button.id
                ? "nav-button active"
                : "nav-button"
            }
            onClick={() => setActiveTab(button.id)}
          >
            {button.label}
          </button>
        ))}

      </nav>
      <button
        className="logout-button"
        onClick={sair}
      >
        Sair
      </button>
    </header>
  );
}

export default Navbar;