function ResultsTable({ prediction }) {
  if (!prediction) return null;

  const probability = (prediction.churn_probability ?? prediction.probability ?? 0) * 100;

  let riskLevel = "low";
  if (probability >= 70) riskLevel = "high";
  else if (probability >= 40) riskLevel = "medium";

  const riskLabel = riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);
  const isChurn = prediction.prediction === "Yes";

  return (
    <div>
      <div className="result-verdict">
        <div>
          <div className="verdict-label">Churn prediction</div>
          <div className={`verdict-text ${isChurn ? "churn" : "safe"}`}>
            {isChurn ? "Will churn" : "Will stay"}
          </div>
        </div>
        <div className={`verdict-icon ${isChurn ? "churn" : "safe"}`}>
          {isChurn ? "⚠" : "✓"}
        </div>
      </div>

      <div className="prob-bar-wrap">
        <div className="prob-bar-top">
          <span>Risk probability</span>
          <span>{probability.toFixed(1)}%</span>
        </div>
        <div className="prob-bar-bg">
          <div
            className={`prob-bar-fill ${isChurn ? "churn" : "safe"}`}
            style={{ width: `${Math.min(probability, 100)}%` }}
          />
        </div>
      </div>

      <div className="result-pill-row">
        <span className={`risk-tag ${riskLevel}`}>● {riskLabel}</span>
        <span className="risk-caption">risk level</span>
      </div>

      <div className="result-grid">
        <div className="result-metric">
          <div className="detail-key">Probability</div>
          <div className="detail-val">{probability.toFixed(2)}%</div>
        </div>
        <div className="result-metric">
          <div className="detail-key">Prediction</div>
          <div className="detail-val" style={{ color: isChurn ? "#f87171" : "#4ade80" }}>
            {prediction.prediction}
          </div>
        </div>
        <div className="result-metric">
          <div className="detail-key">Risk category</div>
          <div className="detail-val">{riskLabel}</div>
        </div>
        <div className="result-metric">
          <div className="detail-key">Model</div>
          <div className="detail-val">XGBoost v2</div>
        </div>
      </div>
    </div>
  );
}

export default ResultsTable;