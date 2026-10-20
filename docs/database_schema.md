# UDYAM AI — Canonical Database Schema Specification

## Multi-Tenancy Design Principle
Every relational table and vector document strictly includes `tenant_id` (UUID) and `business_id` (UUID). Cross-tenant queries are blocked at the ORM/Data Access Layer.

---

## 1. Core Tenant & User Entities
### `users`
- `id`: UUID (PK)
- `tenant_id`: UUID (FK)
- `email`: VARCHAR(255) UNIQUE
- `phone`: VARCHAR(20)
- `full_name`: VARCHAR(255)
- `role`: ENUM('OWNER', 'ADMIN', 'ACCOUNTANT', 'EMPLOYEE', 'VIEWER')
- `created_at`: TIMESTAMP

### `organizations`
- `id`: UUID (PK)
- `name`: VARCHAR(255)
- `plan_type`: VARCHAR(50)
- `created_at`: TIMESTAMP

### `businesses`
- `id`: UUID (PK)
- `tenant_id`: UUID (FK)
- `organization_id`: UUID (FK)
- `name`: VARCHAR(255)
- `gstin`: VARCHAR(15) INDEX
- `udyam_reg_no`: VARCHAR(50) INDEX
- `pan`: VARCHAR(10) INDEX
- `industry_sector`: VARCHAR(100)
- `turnover_band`: VARCHAR(50)
- `state`: VARCHAR(100)
- `city`: VARCHAR(100)
- `created_at`: TIMESTAMP

---

## 2. Business Data Entities
### `products`
- `id`: UUID (PK)
- `tenant_id`: UUID (FK)
- `business_id`: UUID (FK) INDEX
- `sku`: VARCHAR(100) INDEX
- `name`: VARCHAR(255)
- `category`: VARCHAR(100)
- `hsn_code`: VARCHAR(20)
- `unit`: VARCHAR(20)
- `cost_price`: NUMERIC(12, 2)
- `selling_price`: NUMERIC(12, 2)
- `stock_quantity`: NUMERIC(12, 2)
- `min_reorder_level`: NUMERIC(12, 2)
- `supplier_lead_time_days`: INT

### `sales`
- `id`: UUID (PK)
- `tenant_id`: UUID (FK) INDEX
- `business_id`: UUID (FK) INDEX
- `invoice_number`: VARCHAR(100) INDEX
- `customer_id`: UUID (FK)
- `sale_date`: TIMESTAMP INDEX
- `subtotal`: NUMERIC(12, 2)
- `tax_amount`: NUMERIC(12, 2)
- `total_amount`: NUMERIC(12, 2)
- `payment_status`: ENUM('PAID', 'PARTIAL', 'UNPAID')

### `purchases`
- `id`: UUID (PK)
- `tenant_id`: UUID (FK) INDEX
- `business_id`: UUID (FK) INDEX
- `purchase_order_number`: VARCHAR(100)
- `supplier_id`: UUID (FK)
- `purchase_date`: TIMESTAMP INDEX
- `total_amount`: NUMERIC(12, 2)
- `status`: VARCHAR(50)

### `inventory_transactions`
- `id`: UUID (PK)
- `tenant_id`: UUID (FK)
- `product_id`: UUID (FK) INDEX
- `transaction_type`: ENUM('IN', 'OUT', 'ADJUSTMENT')
- `quantity`: NUMERIC(12, 2)
- `timestamp`: TIMESTAMP INDEX

### `customers` & `suppliers`
- `id`: UUID (PK)
- `tenant_id`: UUID (FK) INDEX
- `name`: VARCHAR(255)
- `gstin`: VARCHAR(15)
- `contact_email`: VARCHAR(255)
- `contact_phone`: VARCHAR(20)
- `state`: VARCHAR(100)

---

## 3. Financial & Compliance Entities
### `invoices` & `payments`
- `id`: UUID (PK)
- `tenant_id`: UUID (FK) INDEX
- `invoice_type`: ENUM('SALES', 'PURCHASE')
- `counterparty_name`: VARCHAR(255)
- `counterparty_gstin`: VARCHAR(15)
- `amount`: NUMERIC(12, 2)
- `due_date`: DATE INDEX

### `gst_records`
- `id`: UUID (PK)
- `tenant_id`: UUID (FK) INDEX
- `return_type`: ENUM('GSTR1', 'GSTR3B', 'GSTR9')
- `period`: VARCHAR(20)
- `taxable_value`: NUMERIC(12, 2)
- `igst`: NUMERIC(12, 2)
- `cgst`: NUMERIC(12, 2)
- `sgst`: NUMERIC(12, 2)
- `itc_claimed`: NUMERIC(12, 2)
- `status`: ENUM('FILED', 'PENDING', 'MISMATCH')

### `compliance_tasks`
- `id`: UUID (PK)
- `tenant_id`: UUID (FK) INDEX
- `task_name`: VARCHAR(255)
- `authority`: VARCHAR(100)
- `due_date`: DATE INDEX
- `reminder_schedule`: JSONB -- [30, 15, 7, 3, 1]
- `status`: ENUM('PENDING', 'COMPLETED', 'OVERDUE')

---

## 4. Intelligence & Procurement Entities
### `pi`, `po`, `pr`
- `id`: UUID (PK)
- `tenant_id`: UUID (FK) INDEX
- `document_type`: ENUM('PR', 'PO', 'PI')
- `reference_code`: VARCHAR(100) INDEX
- `amount`: NUMERIC(12, 2)
- `counterparty`: VARCHAR(255)
- `status`: VARCHAR(50)

### `agreements` & `agreement_clauses`
- `id`: UUID (PK)
- `tenant_id`: UUID (FK) INDEX
- `document_name`: VARCHAR(255)
- `party_a`: VARCHAR(255)
- `party_b`: VARCHAR(255)
- `clause_type`: VARCHAR(100) -- Payment, Termination, Penalty
- `risk_level`: ENUM('LOW', 'MEDIUM', 'HIGH')

### `market_signals`, `news_events`, `festivals`
- `id`: UUID (PK)
- `category`: VARCHAR(100) INDEX
- `entity_name`: VARCHAR(255)
- `signal_strength`: NUMERIC(5, 2)
- `event_date`: DATE INDEX
- `lead_days`: INT

---

## 5. RAG & Audit Entities
### `documents`, `document_chunks`, `embeddings`
- `id`: UUID (PK)
- `tenant_id`: UUID (FK)
- `title`: VARCHAR(255)
- `authority`: VARCHAR(100)
- `effective_date`: DATE
- `chunk_content`: TEXT
- `vector_embedding`: VECTOR(1536) -- pgvector / Qdrant

### `audit_logs` & `consents`
- `id`: UUID (PK)
- `tenant_id`: UUID (FK) INDEX
- `user_id`: UUID (FK)
- `action`: VARCHAR(255)
- `consent_type`: VARCHAR(100)
- `granted_at`: TIMESTAMP
- `ip_address`: VARCHAR(45)
