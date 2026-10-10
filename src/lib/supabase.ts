import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Client = {
  id: string;
  name: string;
  company: string;
  phone: string;
  whatsapp_number: string | null;
  email: string | null;
  address: string | null;
  client_type: string;
  status: string;
  retention_status: string;
  account_manager: string | null;
  date_onboarded: string | null;
  notes: string | null;
  created_at: string;
};

export type Service = {
  id: string;
  client_id: string;
  service_type: string;
  ac_units: number;
  installation_date: string | null;
  maintenance_plan: string;
  contract_start: string | null;
  contract_end: string | null;
  contract_value: number;
  next_service_date: string | null;
};

export type Payment = {
  id: string;
  client_id: string;
  invoice_number: string;
  total_amount: number;
  paid_amount: number;
  outstanding_amount: number;
  due_date: string | null;
  payment_date: string | null;
  status: string;
  payment_method: string | null;
  payment_link: string | null;
  reminder_count: number;
  last_reminder_date: string | null;
  next_reminder_date: string | null;
  reminder_status: string;
};

export type Communication = {
  id: string;
  client_id: string;
  channel: string;
  message: string | null;
  direction: string;
  status: string;
  sent_at: string;
};

export type Followup = {
  id: string;
  client_id: string;
  type: string;
  due_date: string;
  status: string;
  notes: string | null;
};

export type ActivityLog = {
  id: string;
  client_id: string;
  activity_type: string;
  description: string | null;
  timestamp: string;
};

export type Notification = {
  id: string;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
};

export type AISettings = {
  id: string;
  agent_name: string;
  tone: string;
  reminder_frequency: string;
  max_reminders: number;
  stop_condition: string;
};

export type ClientWithDetails = Client & {
  service?: Service;
  payment?: Payment;
  payments?: Payment[];
  communications?: Communication[];
  followups?: Followup[];
  activities?: ActivityLog[];
};
