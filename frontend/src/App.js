// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Logistics from "./pages/Logistics";
import Reports from "./pages/Reports";
import ShipmentsList from "./pages/ShipmentsList";
import "./index.css";


export default function App() {
  return (
    <Router>
      <div className="app-root">
        <aside className="sidebar">
          <div className="brand">Centralized Logistics</div>
          <nav className="nav">
            <NavLink to="/" className="nav-item" end>Dashboard</NavLink>
            <NavLink to="/logistics" className="nav-item">New Shipment</NavLink>
            <NavLink to="/shipments" className="nav-item">
              Shipments List
            </NavLink>
            <NavLink to="/reports" className="nav-item">Reports</NavLink>
          </nav>
        </aside>

        <main className="main">
          <header className="topbar">
            <h1>Centralized Logistics ERP</h1>
            <div className="actions">
              <button className="btn primary">Export</button>
              <button className="btn">User</button>
            </div>
          </header>

          <div className="content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/logistics/:id?" element={<Logistics />} />
              <Route path="/shipments" element={<ShipmentsList />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}
