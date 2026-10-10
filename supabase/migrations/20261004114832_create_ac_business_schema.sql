/*
# AC Business Management Dashboard Schema

1. Purpose
- Centralized client, payment, and WhatsApp communication management system for an AC installation & maintenance company.
- Single-tenant app (no auth) using anon+authenticated policies for demo/prototype use.

2. New Tables
- `clients` — client master records (name, company, phone, whatsapp, email, address, type, status, retention)
- `services` — service/contract details per client (service type, AC units, dates, contract value)
- `payments` — invoice/payment records per client (invoice number, amounts, due date, status, payment link)
- `communications` — WhatsApp/communication log (channel, message, direction, status, sent_at)
- `followups` — follow-up tasks per client (type, due date, status, notes)
- `activity_logs` — client activity timeline (activity type, description, timestamp)
- `notifications` — dashboard notifications (type, message, read, created_at)
- `ai_settings` — AI agent configuration (agent name, tone, reminder rules)

3. Security
- RLS enabled on all tables.
- CRUD policies for anon + authenticated (single-tenant demo app, intentionally shared data).
*/

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text NOT NULL,
  phone text NOT NULL,
  whatsapp_number text,
  email text,
  address text,
  client_type text DEFAULT 'Commercial',
  status text DEFAULT 'Active',
  retention_status text DEFAULT 'Healthy',
  account_manager text DEFAULT 'Nimkiran',
  date_onboarded date DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_clients" ON clients;
CREATE POLICY "anon_select_clients" ON clients FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_clients" ON clients;
CREATE POLICY "anon_insert_clients" ON clients FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_clients" ON clients;
CREATE POLICY "anon_update_clients" ON clients FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_clients" ON clients;
CREATE POLICY "anon_delete_clients" ON clients FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  service_type text DEFAULT 'AC Maintenance',
  ac_units int DEFAULT 1,
  installation_date date,
  maintenance_plan text DEFAULT 'Quarterly',
  contract_start date,
  contract_end date,
  contract_value numeric DEFAULT 0,
  next_service_date date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_services" ON services;
CREATE POLICY "anon_select_services" ON services FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_services" ON services;
CREATE POLICY "anon_insert_services" ON services FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_services" ON services;
CREATE POLICY "anon_update_services" ON services FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_services" ON services;
CREATE POLICY "anon_delete_services" ON services FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  invoice_number text NOT NULL,
  total_amount numeric DEFAULT 0,
  paid_amount numeric DEFAULT 0,
  outstanding_amount numeric DEFAULT 0,
  due_date date,
  payment_date date,
  status text DEFAULT 'Pending',
  payment_method text,
  payment_link text,
  reminder_count int DEFAULT 0,
  last_reminder_date date,
  next_reminder_date date,
  reminder_status text DEFAULT 'None',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_payments" ON payments;
CREATE POLICY "anon_select_payments" ON payments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_payments" ON payments;
CREATE POLICY "anon_insert_payments" ON payments FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_payments" ON payments;
CREATE POLICY "anon_update_payments" ON payments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_payments" ON payments;
CREATE POLICY "anon_delete_payments" ON payments FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  channel text DEFAULT 'WhatsApp',
  message text,
  direction text DEFAULT 'outbound',
  status text DEFAULT 'Sent',
  sent_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_communications" ON communications;
CREATE POLICY "anon_select_communications" ON communications FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_communications" ON communications;
CREATE POLICY "anon_insert_communications" ON communications FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_communications" ON communications;
CREATE POLICY "anon_update_communications" ON communications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_communications" ON communications;
CREATE POLICY "anon_delete_communications" ON communications FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS followups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  type text DEFAULT 'Payment Follow-up',
  due_date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'Pending',
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE followups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_followups" ON followups;
CREATE POLICY "anon_select_followups" ON followups FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_followups" ON followups;
CREATE POLICY "anon_insert_followups" ON followups FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_followups" ON followups;
CREATE POLICY "anon_update_followups" ON followups FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_followups" ON followups;
CREATE POLICY "anon_delete_followups" ON followups FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  description text,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_activity_logs" ON activity_logs;
CREATE POLICY "anon_select_activity_logs" ON activity_logs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_activity_logs" ON activity_logs;
CREATE POLICY "anon_insert_activity_logs" ON activity_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_activity_logs" ON activity_logs;
CREATE POLICY "anon_update_activity_logs" ON activity_logs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_activity_logs" ON activity_logs;
CREATE POLICY "anon_delete_activity_logs" ON activity_logs FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_notifications" ON notifications;
CREATE POLICY "anon_select_notifications" ON notifications FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_notifications" ON notifications;
CREATE POLICY "anon_insert_notifications" ON notifications FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_notifications" ON notifications;
CREATE POLICY "anon_update_notifications" ON notifications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_notifications" ON notifications;
CREATE POLICY "anon_delete_notifications" ON notifications FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS ai_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name text DEFAULT 'Nimkiran Payment Assistant',
  tone text DEFAULT 'Professional',
  reminder_frequency text DEFAULT 'Every 3 days',
  max_reminders int DEFAULT 3,
  stop_condition text DEFAULT 'Payment received',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_ai_settings" ON ai_settings;
CREATE POLICY "anon_select_ai_settings" ON ai_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_ai_settings" ON ai_settings;
CREATE POLICY "anon_insert_ai_settings" ON ai_settings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_ai_settings" ON ai_settings;
CREATE POLICY "anon_update_ai_settings" ON ai_settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_ai_settings" ON ai_settings;
CREATE POLICY "anon_delete_ai_settings" ON ai_settings FOR DELETE TO anon, authenticated USING (true);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_retention ON clients(retention_status);
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_services_client_id ON services(client_id);
CREATE INDEX IF NOT EXISTS idx_communications_client_id ON communications(client_id);
CREATE INDEX IF NOT EXISTS idx_followups_client_id ON followups(client_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_client_id ON activity_logs(client_id);
