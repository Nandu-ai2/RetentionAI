import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function PredictionChart({ data = [] }) {
  const chartData = Array.isArray(data) ? data : [];

  if (chartData.length === 0) {
    return (
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">📈 Prediction trend</div>
          <span className="panel-badge">live</span>
        </div>
        <div className="result-empty">No prediction history to chart yet.</div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">📈 Prediction trend</div>
        <span className="panel-badge">recent</span>
      </div>

      <div style={{ padding: "0 16px 16px" }}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} domain={[0, 100]} />
            <Tooltip
              formatter={(value) => [`${Number(value).toFixed(1)}%`, "Risk"]}
              contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)" }}
            />
            <Bar dataKey="probability" fill="#6366f1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default PredictionChart;
