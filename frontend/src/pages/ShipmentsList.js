import React, { useEffect, useState, useRef } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import API from "../services/api";
import "./ShipmentsList.css";
import { useNavigate, useLocation } from "react-router-dom";
import BulkShipmentUpload from "./BulkShipmentUpload";


export default function ShipmentsList() {
  const [descValues, setDescValues] = useState({});
const [savingId, setSavingId] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const isFirstLoad = useRef(true);

  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]); // ✅ NEW
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showStatusAction, setShowStatusAction] = useState(false);
  const [backendStatus, setBackendStatus] = useState("checking");

  useEffect(() => {
    // Check backend connection first
    API.get("/api/test")
  .then(res => {
    setBackendStatus(res.data.status === "OK" ? "connected" : "offline");
  })
      .catch(() => {
        setBackendStatus("disconnected");
      })
      .finally(() => {
        fetchAll();
      });
  }, []);

  // Refresh data when navigating back to this page
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    fetchAll();
  }, [location.pathname]);

  /* ===== FETCH ALL SHIPMENTS ===== */
  function fetchAll() {
    setLoading(true);
    setError("");
   API.get("/api/shipments")
      .then(res => {
       const data = Array.isArray(res.data) ? res.data : res.data.data;
setRows(data);
setFilteredRows(data);

      })
      .catch(err => {
        console.error("Failed to load shipments:", err);
        if (err.code === 'ERR_NETWORK') {
          setError("Cannot connect to backend server. Please ensure the backend is running on port 4000.");
        } else {
          setError("Failed to load shipments. Please try again.");
        }
        setRows([]);
        setFilteredRows([]);
      })
      .finally(() => setLoading(false));
  }

  /* ==========================
     LIVE SEARCH (LETTER BY LETTER)
     ========================== */
  useEffect(() => {
    if (!search.trim()) {
      setFilteredRows(rows);
      return;
    }

    const q = search.toLowerCase();

    const filtered = rows.filter(r =>
      (r.enquiry_no && r.enquiry_no.toLowerCase().includes(q)) ||
      (r.part_no && r.part_no.toLowerCase().includes(q)) ||
      (r.bl_no && r.bl_no.toLowerCase().includes(q))
    );

    setFilteredRows(filtered);
  }, [search, rows]);
  
  


  /* ===== STATUS UPDATE ===== */
  function updateStatus(id, status) {
    API.patch(`/api/shipments/${id}/status`, { status })
      .then(fetchAll)
      .catch(() => alert("Status update failed"));
  }


  /* ===== EXPORT EXCEL ===== */
  function exportExcel() {
    const ws = XLSX.utils.json_to_sheet(filteredRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Shipments");
    XLSX.writeFile(wb, "shipments.xlsx");
  }

  /*===== EXPORT PDF ===== */
  function exportPDF() {
    const doc = new jsPDF("l", "mm", "a4");
    doc.autoTable({
      head: [[
        "QMRel No","Customer","FF","Invoice","Part No",
        "Part Description","Qty","Net Wt","Gross Wt",
        "Mode","BL No","Container No","Status"
      ]],
      body: filteredRows.map(r => [
        r.enquiry_no,
        r.customer,
        r.ff,
        r.invoice_no,
        r.part_no,
        r.part_desc,
        r.part_qty,
        r.net_wt,
        r.gross_wt,
        r.mode,
        r.bl_no,
        r.container_no,
        r.status
      ])
    });
    doc.save("shipments.pdf");
  }

  return (
    <div className="shipments-page">
      <div className="shipments-header">
        <div>
          <h2>Shipments List</h2>
          <div className="backend-status">
            Backend Status: 
            <span className={`status-${backendStatus}`}>
              {backendStatus === "connected" && "🟢 Connected"}
              {backendStatus === "offline" && "🟡 Offline Mode"}
              {backendStatus === "disconnected" && "🔴 Disconnected"}
              {backendStatus === "checking" && "🔵 Checking..."}
            </span>
          </div>
        </div>
        <div className="actions">
          <button className="btn excel" onClick={exportExcel}>Export Excel</button>
          <button className="btn pdf" onClick={exportPDF}>Export PDF</button>
        </div>
      </div>
      <BulkShipmentUpload onDone={fetchAll} />


      {/* LIVE SEARCH */}
      <div className="search-bar">
        <input
          placeholder="Search by QMRel / Part No / BL No"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="reset" onClick={fetchAll}>Reset</button>
      </div>

      {loading && <p className="info">Loading…</p>}
      {error && <p className="error">{error}</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>QMRel No</th>
              <th>Customer</th>
              <th>FF</th>
              <th>Invoice</th>
              <th>Part No</th>
              <th>Part Description</th>
              <th>Qty</th>
              <th>Net Wt</th>
              <th>Gross Wt</th>
              <th>Mode</th>
              <th>BL No</th>
              <th>Container No</th>
              <th>Action</th>
              <th>Delivery Status</th>
              <th
                onClick={() => setShowStatusAction(p => !p)}
                style={{ cursor: "pointer" }}
              >
                Invalid {showStatusAction ? "▲" : "▼"}
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredRows.map(r => (
              <tr
                key={r.id}
                style={{
                  backgroundColor: r.status === "CANCELLED" ? "#ffe5e5" : "white",
                  color: r.status === "CANCELLED" ? "red" : "black"
                }}
              >
                <td>{r.enquiry_no}</td>
                <td>{r.customer}</td>
                <td>{r.ff}</td>
                <td>{r.invoice_no}</td>
                <td>{r.part_no}</td>
                <td className="desc">{r.part_desc}</td>
                <td>{r.part_qty}</td>
                <td>{r.net_wt}</td>
                <td>{r.gross_wt}</td>
                <td>
                  <span className={`badge ${r.mode?.toLowerCase()}`}>
                    {r.mode}
                  </span>
                </td>
                <td>{r.bl_no}</td>
                <td>{r.container_no}</td>

                <td>
                  <button
                    className="edit-btn"
                    disabled={r.status === "CANCELLED"}
                    onClick={() =>
                      navigate(`/logistics/${r.id}`, { state: r })
                    }
                  >
                    ✏️ Edit
                  </button>
                </td>
<td>
  <div className="delivery-wrapper">
   <select
    className={`delivery-select ${r.delivery_status || "IN_PROCESS"}`}
    value={r.delivery_status || "IN_PROCESS"}
    onChange={async (e) => {
      try {
        await API.patch(`/api/shipments/${r.id}/delivery-status`, {
          delivery_status: e.target.value
        });
        fetchAll();
      } catch (err) {
        alert("Failed to update delivery status");
      }
    }}
  >
    <option value="IN_PROCESS">In Process</option>
    <option value="IN_TRANSIT">In Transit</option>
    <option value="DELIVERED">Final Delivered</option>
  </select>
  </div>
</td>




                <td>
                  {showStatusAction && (
                    r.status === "CANCELLED" ? (
                      <button
                        style={{ background: "green", color: "white" }}
                        onClick={() => updateStatus(r.id, "ACTIVE")}
                      >
                        Undo
                      </button>
                    ) : (
                      <button
                        style={{ background: "red", color: "white" }}
                        onClick={() => updateStatus(r.id, "CANCELLED")}
                      >
                        Cancel
                      </button>
                      
                    )
                  )}
                </td>
                 <td>
  <input
    type="text"
    className="desc-input"
    placeholder="Add description"
    value={descValues[r.id] ?? r.manual_desc ?? ""}
    onChange={(e) =>
      setDescValues(prev => ({
        ...prev,
        [r.id]: e.target.value
      }))
    }
  />

  <button
    className="btn small"
    disabled={savingId === r.id}
    onClick={async () => {
      try {
        setSavingId(r.id);
        await API.put(`/api/shipments/${r.id}/manual-desc`, {
          manual_desc: descValues[r.id]
        });
        alert("Description saved ✅");
        fetchAll(); // reload data
      } catch {
        alert("Failed to save description ❌");
      } finally {
        setSavingId(null);
      }
    }}
  >
    {savingId === r.id ? "Saving..." : "Save"}
  </button>
</td>

                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
