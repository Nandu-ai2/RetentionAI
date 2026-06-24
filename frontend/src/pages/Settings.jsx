import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";

function Settings() {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState({
    alerts: true,
    compactView: false,
    autoRefresh: true,
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("settings");
    if (stored) {
      try {
        setPrefs(JSON.parse(stored));
      } catch {
        // ignore malformed storage
      }
    }
  }, []);

  const togglePref = (key) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const saveSettings = () => {
    localStorage.setItem("settings", JSON.stringify(prefs));
    setMessage("Settings saved");
  };

  const resetSettings = () => {
    const defaults = { alerts: true, compactView: false, autoRefresh: true };
    setPrefs(defaults);
    localStorage.setItem("settings", JSON.stringify(defaults));
    setMessage("Settings reset to defaults");
  };

  return (
    <div>
      <Navbar />

      <div className="cg-body">
        <div className="cg-header">
          <div>
            <h1 className="cg-title">Settings</h1>
            <p className="cg-subtitle">Customize your churn dashboard experience</p>
          </div>
          <button className="predict-btn" style={{ width: "auto", padding: "10px 16px" }} onClick={() => navigate("/dashboard")}>Back to dashboard</button>
        </div>

        <div className="main-grid">
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">⚙ Preferences</div>
              <span className="panel-badge">Local save</span>
            </div>

            <div style={{ padding: 16 }}>
              <div className="result-panel" style={{ padding: 16, marginBottom: 12 }}>
                <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span>Enable alerts</span>
                  <input type="checkbox" checked={prefs.alerts} onChange={() => togglePref("alerts")} />
                </label>

                <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span>Compact view</span>
                  <input type="checkbox" checked={prefs.compactView} onChange={() => togglePref("compactView")} />
                </label>

                <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Auto refresh</span>
                  <input type="checkbox" checked={prefs.autoRefresh} onChange={() => togglePref("autoRefresh")} />
                </label>
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button className="predict-btn" onClick={saveSettings}>Save settings</button>
                <button className="nav-link" onClick={resetSettings}>Reset</button>
              </div>

              {message && <p style={{ marginTop: 12, color: "#34d399" }}>{message}</p>}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">👤 Account</div>
              <span className="panel-badge">Signed in</span>
            </div>

            <div style={{ padding: 16, color: "#cbd5e1" }}>
              <p><strong>Email:</strong> {localStorage.getItem("userEmail") || "Not available"}</p>
              <p><strong>Status:</strong> Active</p>
              <p><strong>Model:</strong> XGBoost churn classifier</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
