import axios from "axios";
import { useState } from "react";

export default function DbCheckButton() {
  const [status, setStatus] = useState("");

  const checkDB = async () => {
    try {
      const res = await axios.get(
        "https://your-backend.onrender.com/api/db-check"
      );
      setStatus(res.data.message);
    } catch (err) {
      setStatus("❌ Server not reachable");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={checkDB}>
        Check MongoDB Connection
      </button>

      {status && <p>{status}</p>}
    </div>
  );
}
