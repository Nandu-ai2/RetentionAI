import { useEffect, useState, useMemo, useCallback } from "react";

import Navbar from "../components/Navbar";
import { getHistory } from "../api";

function formatDate(dt) {
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return dt;
  }
}

function downloadCSV(rows, filename = "history.csv") {
  if (!rows || rows.length === 0) return;

  const keys = Object.keys(rows[0]);
  const csv = [keys.join(",")].concat(
    rows.map((r) => keys.map((k) => JSON.stringify(r[k] ?? "")).join(","))
  ).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function History() {

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [query, setQuery] = useState("");
  const [filterPrediction, setFilterPrediction] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const resp = await getHistory();
      setHistory(resp.data || []);
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setLoading(false);
    }
  };

  const onSearch = useCallback((e) => {
    setQuery(e.target.value);
    setPage(1);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return history.filter((r) => {
      if (filterPrediction !== "all") {
        if (filterPrediction === "churn" && r.churn_prediction !== "Yes") return false;
        if (filterPrediction === "safe" && r.churn_prediction !== "No") return false;
      }

      if (!q) return true;

      return (
        String(r.id).includes(q) ||
        String(r.contract || "").toLowerCase().includes(q) ||
        String(r.payment_method || "").toLowerCase().includes(q) ||
        String(r.churn_prediction || "").toLowerCase().includes(q) ||
        String(r.created_at || "").toLowerCase().includes(q)
      );
    });
  }, [history, query, filterPrediction]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let av = a[sortBy];
      let bv = b[sortBy];

      // normalize
      if (sortBy === "created_at") {
        av = new Date(av).getTime() || 0;
        bv = new Date(bv).getTime() || 0;
      } else if (sortBy === "churn_probability" || sortBy === "monthly_charges") {
        av = Number(av) || 0;
        bv = Number(bv) || 0;
      } else {
        av = String(av || "").toLowerCase();
        bv = String(bv || "").toLowerCase();
      }

      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortBy, sortDir]);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const toggleSort = (key) => {
    if (sortBy === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("desc");
    }
  };

  const handleExport = () => {
    // export current filtered & sorted dataset
    const rows = sorted.map((r) => ({
      id: r.id,
      prediction: r.churn_prediction,
      probability: (r.churn_probability * 100).toFixed(2) + "%",
      contract: r.contract,
      monthly_charges: r.monthly_charges,
      date: formatDate(r.created_at),
    }));

    downloadCSV(rows, "prediction_history.csv");
  };

  if (loading) return <div className="cg-body"><div className="panel" style={{ padding: 24 }}>Loading history...</div></div>;

  return (
    <div>
      <Navbar />

      <div className="cg-body">
        <div className="cg-header">
          <div>
            <div className="cg-title">Prediction History</div>
            <div className="cg-subtitle">Review recent churn predictions and export results</div>
          </div>
          <button className="predict-btn" style={{ width: 'auto', padding: '10px 16px' }} onClick={handleExport}>Export CSV</button>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">History</div>
            <div className="panel-badge">{total} records</div>
          </div>

          <div style={{ padding: 16 }}>
            <div className="history-toolbar">
              <input
                className="cg-input"
                placeholder="Search by id, contract, prediction, date..."
                value={query}
                onChange={onSearch}
                style={{ maxWidth: 420 }}
              />

              <select className="cg-select" value={filterPrediction} onChange={(e) => { setFilterPrediction(e.target.value); setPage(1); }}>
                <option value="all">All outcomes</option>
                <option value="churn">Will churn</option>
                <option value="safe">Will stay</option>
              </select>

              <select className="cg-select" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
                <option value={5}>5 / page</option>
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
              </select>
            </div>

            {history.length === 0 ? (
              <div className="result-empty" style={{ padding: 24 }}>No prediction history yet.</div>
            ) : (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table className="history-table" style={{ width: "100%" }}>
                    <thead>
                      <tr>
                        <th className="sortable" onClick={() => toggleSort("id")}>ID {sortBy === "id" ? (sortDir === "asc" ? "↑" : "↓") : ""}</th>
                        <th className="sortable" onClick={() => toggleSort("churn_prediction")}>Prediction</th>
                        <th className="sortable" onClick={() => toggleSort("churn_probability")}>Probability {sortBy === "churn_probability" ? (sortDir === "asc" ? "↑" : "↓") : ""}</th>
                        <th className="sortable" onClick={() => toggleSort("contract")}>Contract</th>
                        <th className="sortable" onClick={() => toggleSort("monthly_charges")}>Monthly Charges {sortBy === "monthly_charges" ? (sortDir === "asc" ? "↑" : "↓") : ""}</th>
                        <th className="sortable" onClick={() => toggleSort("created_at")}>Date {sortBy === "created_at" ? (sortDir === "asc" ? "↑" : "↓") : ""}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageData.map((item) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td>
                            <span className={`history-pill ${item.churn_prediction === "Yes" ? "churn" : "safe"}`}>
                              {item.churn_prediction === "Yes" ? "Will churn" : "Will stay"}
                            </span>
                          </td>
                          <td>{((item.churn_probability ?? 0) * 100).toFixed(2)}%</td>
                          <td>{item.contract}</td>
                          <td>${Number(item.monthly_charges).toFixed(2)}</td>
                          <td>{formatDate(item.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 13, color: "#64748b" }}>
                    Showing {Math.min((page - 1) * pageSize + 1, total)} - {Math.min(page * pageSize, total)} of {total}
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="nav-link" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Prev</button>
                    <div style={{ alignSelf: "center" }}>{page} / {totalPages}</div>
                    <button className="nav-link" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default History;