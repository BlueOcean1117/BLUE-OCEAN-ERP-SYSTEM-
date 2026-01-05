import React, { useEffect, useState } from "react";
import API from "../services/api";

import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

/* chart.js registration */
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/shipments/dashboard/summary")
      .then(res => {
        setSummary(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load dashboard data");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  /* ---------- CHART DATA ---------- */

  const modeChartData = {
    labels: summary.modeWise.map(m => m.mode),
    datasets: [
      {
        label: "Shipments by Mode",
        data: summary.modeWise.map(m => Number(m.count)),
        backgroundColor: ["#4CAF50", "#2196F3", "#FF9800"],
      },
    ],
  };

  const statusChartData = {
    labels: summary.statusWise.map(s => s.status),
    datasets: [
      {
        label: "Shipments by Status",
        data: summary.statusWise.map(s => Number(s.count)),
        backgroundColor: ["#673AB7", "#009688", "#E91E63"],
      },
    ],
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📊 Logistics Dashboard</h2>

      <p><b>Total Shipments:</b> {summary.totalShipments}</p>

      <h4>Mode Wise</h4>
      <ul>
        {summary.modeWise.map(m => (
          <li key={m.mode}>
            {m.mode}: {m.count}
          </li>
        ))}
      </ul>

      {/* BAR CHART */}
      <div style={{ maxWidth: 500, marginBottom: 40 }}>
        <Bar data={modeChartData} />
      </div>

      <h4>Status Wise</h4>
      <ul>
        {summary.statusWise.map(s => (
          <li key={s.status}>
            {s.status}: {s.count}
          </li>
        ))}
      </ul>

      {/* PIE CHART */}
      <div style={{ maxWidth: 400 }}>
        <Pie data={statusChartData} />
      </div>
    </div>
  );
}

