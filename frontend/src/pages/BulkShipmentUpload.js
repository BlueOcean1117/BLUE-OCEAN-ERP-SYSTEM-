import React, { useState } from "react";
import API from "../services/api";

export default function BulkShipmentUpload({ onDone }) {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");

  function upload() {
    if (!file) return alert("Please select Excel file");

    const formData = new FormData();
formData.append("file", file);

API.post("/shipments/bulk-upload", formData, {
  headers: { "Content-Type": "multipart/form-data" }
})
.then(() => alert("Upload successful"))
.catch(() => alert("Upload failed"));

  }

  return (
    <div style={{ marginBottom: 16 }}>
      <h4>Bulk Upload Shipments</h4>

      <input
        type="file"
        accept=".xlsx,.csv"
        onChange={e => setFile(e.target.files[0])}
      />

      <button onClick={upload}>Upload</button>

      {msg && <p>{msg}</p>}
    </div>
  );
}
