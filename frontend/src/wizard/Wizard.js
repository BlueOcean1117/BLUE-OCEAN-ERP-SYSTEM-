import React, { useState, useCallback } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import Step1 from "./steps/Step1";
import Step2 from "./steps/Step2";
// import Step3 from "./steps/Step3";
import Step4 from "./steps/Step4";

const STEPS = [
  { id: 1, title: "Shipment Details" },
  { id: 2, title: "Tracking" },
  { id: 3, title: "Review & Save" },
];

export default function Wizard() {
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();

  // ✅ If editing, data comes from ShipmentsList
  const editData = location.state || {};

  const [step, setStep] = useState(1);
  const [data, setData] = useState(editData);

  const update = useCallback((part) => {
    setData(prev => ({ ...prev, ...part }));
  }, []);

  /* ==========================
     SAVE SHIPMENT (CREATE / EDIT)
     ========================== */
  async function saveFinal() {
    console.log("saveFinal called with data:", data);

    // Basic validation removed to allow empty fields

    try {
      let res;

      // ✅ EDIT MODE → UPDATE
      if (id) {
        res = await axios.put(
          `http://localhost:4000/api/shipments/${id}`,
          data,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        alert("Shipment updated successfully ✔️");
        // Redirect back to shipments list
        navigate("/shipments");
      }
      // ✅ CREATE MODE → INSERT
      else {
        res = await axios.post(
          "http://localhost:4000/api/shipments",
          data,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        alert("Shipment created successfully ✔️");
        // Stay on wizard for potential additional shipments or redirect
        // navigate("/logistics");
      }

      console.log("Server response:", res.data);
    } catch (err) {
      console.error("SAVE ERROR FULL:", err);

      // Restore error alerts for debugging
      if (err.response) {
        alert(`Save failed: HTTP ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
      } else if (err.request) {
        alert("Save failed: Backend not responding");
      } else {
        alert("Save failed: " + err.message);
      }
    }
  }

  return (
    <div className="wizard">
      {/* Stepper */}
      <div
        className="stepper"
        style={{ display: "flex", gap: 8, marginBottom: 16 }}
      >
        {STEPS.map(s => (
          <div
            key={s.id}
            className={`step ${s.id === step ? "active" : ""}`}
            style={{ padding: 10, borderRadius: 8 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                }}
              >
                {s.id}
              </div>
              <div style={{ fontWeight: 600 }}>{s.title}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="card">
        {step === 1 && (
          <Step1
            initial={data}
            onNext={() => setStep(2)}
            onUpdate={update}
          />
        )}

        {step === 2 && (
          <Step2
            initial={data}
            onNext={() => setStep(3)}
            onPrev={() => setStep(1)}
            onUpdate={update}
          />
        )}

        {step === 3 && (
          <Step4
            data={data}
            onPrev={() => setStep(2)}
            onSave={saveFinal}
          />
        )}
      </div>
    </div>
  );
}
