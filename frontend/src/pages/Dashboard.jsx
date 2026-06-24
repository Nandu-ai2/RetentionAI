import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import ResultsTable from "../components/ResultsTable";
import ShapChart from "../components/ShapChart";
import PredictionChart from "../components/PredictionChart";

import { predictChurn, uploadDataset, getDatasets, getHistory } from "../api";

function Dashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    tenure: "",
    MonthlyCharges: "",
    TotalCharges: "",
    Contract: "Month-to-month",
    PaymentMethod: "Electronic check",
    InternetService: "Fiber optic",
    OnlineSecurity: "No",
    TechSupport: "No",
    PaperlessBilling: "Yes",
  });

  // Dataset import state
  const [datasets, setDatasets] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [historyTrend, setHistoryTrend] = useState([]);

  const fetchDatasets = async () => {
    try {
      const resp = await getDatasets();
      setDatasets(resp.data || resp || []);
    } catch (err) {
      console.error("Failed to list datasets", err);
    }
  };

  // load dataset list on mount
  useEffect(() => {
    fetchDatasets();
    fetchHistoryTrend();
  }, []);

  const fetchHistoryTrend = async () => {
    try {
      const resp = await getHistory();
      const rows = (resp.data || []).slice(0, 6).reverse();
      const mapped = rows.map((row, index) => ({
        label: `#${index + 1}`,
        probability: ((row.churn_probability ?? 0) * 100).toFixed(1),
      }));
      setHistoryTrend(mapped);
    } catch (err) {
      console.error("Failed to fetch history trend", err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const resp = await uploadDataset(file);
      setAnalysisResult(resp.data);
      await fetchDatasets();
    } catch (err) {
      setAnalysisResult(null);
      alert(err.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error on change
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: false });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.tenure) newErrors.tenure = true;
    if (!formData.MonthlyCharges) newErrors.MonthlyCharges = true;
    if (!formData.TotalCharges) newErrors.TotalCharges = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const response = await predictChurn(formData);
      setPrediction(response.data);
    } catch (error) {
      alert(error.response?.data?.detail || "Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const probability = prediction
    ? (prediction.churn_probability ?? prediction.probability ?? 0) * 100
    : 0;

  const isChurn = prediction?.prediction === "Yes";

  const riskLevel =
    probability >= 70 ? "High" : probability >= 40 ? "Medium" : "Low";

  return (
    <>
      <Navbar />

      <div className="cg-body">
        {/* Page header */}
        <div className="cg-header">
          <div>
            <h1 className="cg-title">Customer churn dashboard</h1>
            <p className="cg-subtitle">
              Predict attrition risk and understand key drivers
            </p>
          </div>
          <div className="live-badge">
            <span className="live-dot" />
            Model live
          </div>
        </div>

        {/* Stats row */}
        <div className="stats-row">
          <div className="stat-card blue">
            <div className="stat-label">📊 Total predictions</div>
            <div className="stat-value">{prediction ? 1 : 0}</div>
          </div>

          <div className="stat-card amber">
            <div className="stat-label">⚡ Risk score</div>
            <div className={`stat-value ${prediction ? (isChurn ? "churn" : "safe") : ""}`}>
              {prediction ? `${probability.toFixed(1)}%` : "—"}
            </div>
          </div>

          <div className="stat-card green">
            <div className="stat-label">🔄 Status</div>
            <div
              className={`stat-value ${
                !prediction
                  ? "waiting"
                  : isChurn
                  ? "churn"
                  : "safe"
              }`}
            >
              {!prediction ? "Waiting" : isChurn ? "High risk" : "Low risk"}
            </div>
          </div>
        </div>
        {/* Dataset import (prominent) */}
        <div style={{ marginBottom: 18 }}>
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">📁 Import dataset</div>
              <span className="panel-badge">Upload CSV</span>
            </div>

            <div style={{ padding: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <input type="file" accept=".csv" onChange={handleFileUpload} />
              <button className="nav-link" onClick={fetchDatasets} disabled={uploading}>{uploading ? 'Uploading…' : 'Refresh list'}</button>
              <div style={{ color: '#64748b', fontSize: 13 }}>{datasets.length} dataset(s) available</div>
            </div>

            {analysisResult && (
              <div style={{ padding: '0 16px 16px' }}>
                <div className="result-panel" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <div>
                      <div className="verdict-label">Latest dataset update</div>
                      <div style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 600 }}>
                        {analysisResult.filename || 'Uploaded dataset'}
                      </div>
                    </div>
                    <span className="panel-badge">Processed</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
                    <div className="stat-card blue" style={{ minWidth: 130, padding: 14 }}>
                      <div className="stat-label">Rows</div>
                      <div className="stat-value">{analysisResult.rows}</div>
                    </div>
                    <div className="stat-card amber" style={{ minWidth: 130, padding: 14 }}>
                      <div className="stat-label">Predicted churn</div>
                      <div className="stat-value churn">{analysisResult.predicted_churn}</div>
                    </div>
                    <div className="stat-card green" style={{ minWidth: 130, padding: 14 }}>
                      <div className="stat-label">High risk</div>
                      <div className="stat-value safe">{analysisResult.high_risk}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 12, color: '#cbd5e1', fontSize: 13 }}>
                    Average churn probability: <strong>{analysisResult.average_probability}</strong>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <div className="verdict-label">Top risk rows</div>
                    <ul style={{ paddingLeft: 16, marginTop: 6, color: '#cbd5e1', fontSize: 12 }}>
                      {analysisResult.top_risks?.map((row) => (
                        <li key={row.row}>
                          Row {row.row}: {row.prediction} ({(row.probability * 100).toFixed(1)}%)
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main grid: form + results */}
        <div className="main-grid">
          {/* Left: input form */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                🔍 Customer information
              </div>
              <span className="panel-badge">9 features</span>
            </div>

            <form className="form-grid" onSubmit={handlePredict}>
              <div className="field-wrap">
                <label className="field-label" htmlFor="tenure">
                  Tenure (months)
                </label>
                <input
                  type="number"
                  id="tenure"
                  name="tenure"
                  className={`cg-input${errors.tenure ? " error" : ""}`}
                  placeholder="e.g. 24"
                  value={formData.tenure}
                  onChange={handleChange}
                  min="0"
                  max="72"
                />
              </div>

              <div className="field-wrap">
                <label className="field-label" htmlFor="MonthlyCharges">
                  Monthly charges ($)
                </label>
                <input
                  type="number"
                  id="MonthlyCharges"
                  name="MonthlyCharges"
                  className={`cg-input${errors.MonthlyCharges ? " error" : ""}`}
                  placeholder="e.g. 65.00"
                  step="0.01"
                  value={formData.MonthlyCharges}
                  onChange={handleChange}
                />
              </div>

              <div className="field-wrap">
                <label className="field-label" htmlFor="TotalCharges">
                  Total charges ($)
                </label>
                <input
                  type="number"
                  id="TotalCharges"
                  name="TotalCharges"
                  className={`cg-input${errors.TotalCharges ? " error" : ""}`}
                  placeholder="e.g. 1560.00"
                  step="0.01"
                  value={formData.TotalCharges}
                  onChange={handleChange}
                />
              </div>

              <div className="field-wrap">
                <label className="field-label" htmlFor="Contract">
                  Contract type
                </label>
                <select
                  id="Contract"
                  name="Contract"
                  className="cg-select"
                  value={formData.Contract}
                  onChange={handleChange}
                >
                  <option>Month-to-month</option>
                  <option>One year</option>
                  <option>Two year</option>
                </select>
              </div>

              <div className="field-wrap">
                <label className="field-label" htmlFor="PaymentMethod">
                  Payment method
                </label>
                <select
                  id="PaymentMethod"
                  name="PaymentMethod"
                  className="cg-select"
                  value={formData.PaymentMethod}
                  onChange={handleChange}
                >
                  <option>Electronic check</option>
                  <option>Mailed check</option>
                  <option>Bank transfer (automatic)</option>
                  <option>Credit card (automatic)</option>
                </select>
              </div>

              <div className="field-wrap">
                <label className="field-label" htmlFor="InternetService">
                  Internet service
                </label>
                <select
                  id="InternetService"
                  name="InternetService"
                  className="cg-select"
                  value={formData.InternetService}
                  onChange={handleChange}
                >
                  <option>Fiber optic</option>
                  <option>DSL</option>
                  <option>No</option>
                </select>
              </div>

              <div className="field-wrap">
                <label className="field-label" htmlFor="OnlineSecurity">
                  Online security
                </label>
                <select
                  id="OnlineSecurity"
                  name="OnlineSecurity"
                  className="cg-select"
                  value={formData.OnlineSecurity}
                  onChange={handleChange}
                >
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </div>

              <div className="field-wrap">
                <label className="field-label" htmlFor="TechSupport">
                  Tech support
                </label>
                <select
                  id="TechSupport"
                  name="TechSupport"
                  className="cg-select"
                  value={formData.TechSupport}
                  onChange={handleChange}
                >
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </div>

              <div className="field-wrap">
                <label className="field-label" htmlFor="PaperlessBilling">
                  Paperless billing
                </label>
                <select
                  id="PaperlessBilling"
                  name="PaperlessBilling"
                  className="cg-select"
                  value={formData.PaperlessBilling}
                  onChange={handleChange}
                >
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>

              <div className="form-full">
                <div className="cg-divider" />
                <button
                  type="submit"
                  className="predict-btn"
                  disabled={loading}
                >
                  {loading ? "⏳ Predicting…" : "⚡ Predict churn"}
                </button>
              </div>
            </form>
          </div>

          {/* Right: result + shap */}
          <div className="right-col">
            {/* Dataset import panel */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">📁 Dataset import</div>
                <span className="panel-badge">ml/</span>
              </div>

              <div style={{ padding: 16 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input type="file" accept=".csv" onChange={handleFileUpload} />
                  <button className="nav-link" onClick={fetchDatasets} disabled={uploading}>{uploading ? 'Uploading…' : 'Refresh'}</button>
                </div>

                <div style={{ marginTop: 12 }}>
                  {datasets.length === 0 ? (
                    <div className="result-empty">No datasets uploaded.</div>
                  ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {datasets.map((d) => (
                        <li key={d.name} style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                            <div style={{ color: '#cbd5e1' }}>{d.name}</div>
                            <div style={{ color: '#64748b', fontSize: 12 }}>{(d.size/1024).toFixed(1)} KB</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <PredictionChart data={historyTrend} />

            {/* Result card */}
            <div
              className={`result-panel${
                prediction
                  ? ` has-result ${isChurn ? "churn" : "safe"}`
                  : ""
              }`}
            >
              {!prediction ? (
                <div className="result-empty">
                  <span className="empty-icon">🛡</span>
                  <p>
                    Enter customer details and run the prediction to see
                    churn risk.
                  </p>
                </div>
              ) : (
                <ResultsTable prediction={prediction} />
              )}
            </div>

            {/* SHAP card */}
            <div className="shap-panel">
              <div className="shap-title">📈 Feature impact (SHAP)</div>
              <div className="shap-subtitle">
                Which factors most influenced this prediction
              </div>
              {prediction?.shap_values ? (
                <ShapChart shapValues={prediction.shap_values} />
              ) : (
                <div className="shap-empty">
                  Run a prediction to see feature contributions
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;