import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="cg-nav">
      <div className="cg-logo">
        <button className="icon-btn" onClick={() => navigate(-1)} title="Back">←</button>
        <div className="cg-logo-icon">🛡</div>
        <span>ChurnGuard AI</span>
      </div>

      <div className="nav-links">
        <NavLink to="/dashboard" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>Dashboard</NavLink>
        <NavLink to="/history" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>History</NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>Home</NavLink>
      </div>

      <div className="nav-actions">
        <button className="icon-btn" onClick={() => setMenuOpen((v) => !v)} title="Menu">☰</button>
        <button className="icon-btn" onClick={() => navigate("/settings")} title="Settings">⚙</button>
        <button className="logout-btn" onClick={logout}>⎋ Logout</button>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
          <NavLink to="/history" onClick={() => setMenuOpen(false)}>History</NavLink>
          <NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>Home</NavLink>
        </div>
      )}
    </nav>
  );
}

export default Navbar;