function ShapChart({ shapValues }) {
  const normalizeShapValues = (values) => {
    if (!values || typeof values !== "object") {
      return [];
    }

    if (values.error) {
      return [];
    }

    return Object.entries(values)
      .map(([feature, value]) => {
        const numericValue = Number(value);
        return {
          feature: String(feature)
            .replace(/__/g, " · ")
            .replace(/_/g, " ")
            .replace(/\s+/g, " ")
            .trim(),
          value: Number.isFinite(numericValue) ? numericValue : 0,
          importance: Math.abs(Number.isFinite(numericValue) ? numericValue : 0),
        };
      })
      .filter((item) => item.feature)
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 10);
  };

  const chartData = normalizeShapValues(shapValues);

  if (chartData.length === 0) {
    return (
      <div className="shap-empty">
        Feature impact is unavailable for this prediction yet.
      </div>
    );
  }

  return (
    <div style={{ marginTop: 16 }}>
      <div className="shap-legend">
        <span>
          <span className="shap-legend-dot" style={{ background: "#6366f1" }} />
          Increasing churn risk
        </span>
        <span>
          <span className="shap-legend-dot" style={{ background: "#38bdf8" }} />
          Decreasing churn risk
        </span>
      </div>

      {chartData.map((item) => (
        <div key={item.feature} className="shap-bar-row">
          <div className="shap-feat">{item.feature}</div>
          <div className="shap-bar-bg">
            <div
              className={`shap-bar-fill ${item.value >= 0 ? "pos" : "neg"}`}
              style={{ width: `${Math.min(100, Math.max(8, Math.abs(item.importance) * 100))}%` }}
            />
          </div>
          <div className="shap-val">{item.value.toFixed(2)}</div>
        </div>
      ))}
    </div>
  );
}

export default ShapChart;