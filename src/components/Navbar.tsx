import './styles/Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <div className="navbar__left">
          <img className="navbar__logo" src="/logo.png" alt="Sofia" />
          <span className="navbar__title">Sofia — Season 1</span>
        </div>
        <div className="navbar__right">
          <span className="navbar__hex">#0a0a0c</span>
          <span className="navbar__badge">Candle</span>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
