import axios from "axios";
import { useState } from "react";

const API_URL = process.env.REACT_APP_API_URL;

export default function DbTestButton() {
  const [status, setStatus] = useState("");

  const testDB = async () => {
    setStatus("Checking...");

    try {
      const res = await axios.get(`${API_URL}/db-test`);
      setStatus(res.data.message);
    } catch (err) {
      setStatus("❌ Backend not responding / DB failed");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <button
        onClick={testDB}
        style={{
          padding: "10px 16px",
          background: "#2563eb",
          color: "#fff",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Test MongoDB Connection
      </button>

      {status && (
        <p style={{ marginTop: 12, fontWeight: 600 }}>
          {status}
        </p>
      )}
    </div>
  );
}
