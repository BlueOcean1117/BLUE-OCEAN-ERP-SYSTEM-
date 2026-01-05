// frontend/src/pages/Logistics.js
import React from "react";
import Wizard from "../wizard/Wizard";

export default function Logistics() {
  return (
    <div>
      <div className="card">
        <h2>Logistics — New / Edit Shipment</h2>
        <p className="muted">Add new shipments or edit existing shipments using the wizard.</p>
      </div>

      <div style={{height:12}} />

      <Wizard />
    </div>
  );
}
