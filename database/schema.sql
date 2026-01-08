-- PostgreSQL schema for Centralized Logistics ERP

-- Create database (run this manually if needed)
-- CREATE DATABASE erpdb;

-- Connect to erpdb
-- \c erpdb;

-- Parts Master Table
CREATE TABLE IF NOT EXISTS parts_master (
  part_no VARCHAR(50) PRIMARY KEY,
  part_desc TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Shipments Table
CREATE TABLE IF NOT EXISTS shipments (
  id SERIAL PRIMARY KEY,
  enquiry_no VARCHAR(50) UNIQUE,
  ff VARCHAR(100),
  customer VARCHAR(100),
  invoice_no VARCHAR(50),
  invoice_date DATE,
  part_desc TEXT,
  part_no VARCHAR(50),
  part_qty INTEGER,
  box_size VARCHAR(50),
  net_wt DECIMAL(10,2),
  gross_wt DECIMAL(10,2),
  package_type VARCHAR(50),
  mode VARCHAR(20) DEFAULT 'Sea',
  dispatch_date DATE,
  incoterm VARCHAR(10),
  sb_no VARCHAR(50),
  sb_date DATE,
  etd DATE,
  bl_no VARCHAR(50),
  container_no VARCHAR(50),
  eta DATE,
  final_delivery DATE,
  total_cost DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  delivery_status VARCHAR(20) DEFAULT 'IN_PROCESS',
  manual_desc TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample parts
INSERT INTO parts_master (part_no, part_desc) VALUES
('PART001', 'Engine Component A'),
('PART002', 'Transmission Gear B')
ON CONFLICT (part_no) DO NOTHING;

-- Insert sample shipment
INSERT INTO shipments (enquiry_no, customer, part_no, part_desc, part_qty, mode, status, delivery_status) VALUES
('QMRel-2024-0001', 'Sample Customer', 'PART001', 'Engine Component A', 10, 'Sea', 'ACTIVE', 'IN_PROCESS')
ON CONFLICT (enquiry_no) DO NOTHING;
