import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Client, Service, Payment, Communication, Followup, ActivityLog, Notification, AISettings, ClientWithDetails } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

type DataContextType = {
  clients: Client[];
  services: Service[];
  payments: Payment[];
  communications: Communication[];
  followups: Followup[];
  activityLogs: ActivityLog[];
  notifications: Notification[];
  aiSettings: AISettings | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addClient: (data: Partial<Client> & { service?: Partial<Service>; payment?: Partial<Payment> }) => Promise<void>;
  updateClient: (id: string, data: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  updatePayment: (id: string, data: Partial<Payment>) => Promise<void>;
  addCommunication: (data: Partial<Communication>) => Promise<void>;
  updateFollowup: (id: string, data: Partial<Followup>) => Promise<void>;
  addFollowup: (data: Partial<Followup>) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  updateAISettings: (data: Partial<AISettings>) => Promise<void>;
  getClientWithDetails: (clientId: string) => ClientWithDetails | null;
  sendReminder: (payment: Payment, client: Client) => Promise<void>;
  markPaymentPaid: (payment: Payment) => Promise<void>;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [aiSettings, setAISettings] = useState<AISettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [clientsRes, servicesRes, paymentsRes, commsRes, followupsRes, logsRes, notifsRes, aiRes] = await Promise.all([
        supabase.from('clients').select('*').order('created_at', { ascending: true }),
        supabase.from('services').select('*'),
        supabase.from('payments').select('*').order('due_date', { ascending: false }),
        supabase.from('communications').select('*').order('sent_at', { ascending: false }),
        supabase.from('followups').select('*').order('due_date', { ascending: true }),
        supabase.from('activity_logs').select('*').order('timestamp', { ascending: false }),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }),
        supabase.from('ai_settings').select('*').limit(1).maybeSingle(),
      ]);

      if (clientsRes.error) throw clientsRes.error;
      setClients(clientsRes.data || []);
      setServices(servicesRes.data || []);
      setPayments(paymentsRes.data || []);
      setCommunications(commsRes.data || []);
      setFollowups(followupsRes.data || []);
      setActivityLogs(logsRes.data || []);
      setNotifications(notifsRes.data || []);
      setAISettings(aiRes.data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addClient = useCallback(async (data: Partial<Client> & { service?: Partial<Service>; payment?: Partial<Payment> }) => {
    const { service, payment, ...clientData } = data;
    const { data: newClient, error: clientErr } = await supabase.from('clients').insert(clientData).select().single();
    if (clientErr) throw clientErr;

    if (service && newClient) {
      await supabase.from('services').insert({ ...service, client_id: newClient.id });
    }
    if (payment && newClient) {
      await supabase.from('payments').insert({ ...payment, client_id: newClient.id });
    }
    if (newClient) {
      await supabase.from('activity_logs').insert({
        client_id: newClient.id,
        activity_type: 'Client Onboarded',
        description: `Client ${newClient.name} added to system`,
      });
    }
    await refresh();
  }, [refresh]);

  const updateClient = useCallback(async (id: string, data: Partial<Client>) => {
    const { error } = await supabase.from('clients').update(data).eq('id', id);
    if (error) throw error;
    await refresh();
  }, [refresh]);

  const deleteClient = useCallback(async (id: string) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw error;
    await refresh();
  }, [refresh]);

  const updatePayment = useCallback(async (id: string, data: Partial<Payment>) => {
    const { error } = await supabase.from('payments').update(data).eq('id', id);
    if (error) throw error;
    await refresh();
  }, [refresh]);

  const addCommunication = useCallback(async (data: Partial<Communication>) => {
    const { error } = await supabase.from('communications').insert(data);
    if (error) throw error;
    await refresh();
  }, [refresh]);

  const updateFollowup = useCallback(async (id: string, data: Partial<Followup>) => {
    const { error } = await supabase.from('followups').update(data).eq('id', id);
    if (error) throw error;
    await refresh();
  }, [refresh]);

  const addFollowup = useCallback(async (data: Partial<Followup>) => {
    const { error } = await supabase.from('followups').insert(data);
    if (error) throw error;
    await refresh();
  }, [refresh]);

  const markNotificationRead = useCallback(async (id: string) => {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
    if (error) throw error;
    await refresh();
  }, [refresh]);

  const updateAISettings = useCallback(async (data: Partial<AISettings>) => {
    if (!aiSettings) {
      await supabase.from('ai_settings').insert(data);
    } else {
      await supabase.from('ai_settings').update({ ...data, updated_at: new Date().toISOString() }).eq('id', aiSettings.id);
    }
    await refresh();
  }, [aiSettings, refresh]);

  const getClientWithDetails = useCallback((clientId: string): ClientWithDetails | null => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return null;
    return {
      ...client,
      service: services.find((s) => s.client_id === clientId),
      payments: payments.filter((p) => p.client_id === clientId),
      communications: communications.filter((c) => c.client_id === clientId),
      followups: followups.filter((f) => f.client_id === clientId),
      activities: activityLogs.filter((a) => a.client_id === clientId),
    };
  }, [clients, services, payments, communications, followups, activityLogs]);

  const sendReminder = useCallback(async (payment: Payment, client: Client) => {
    const newCount = payment.reminder_count + 1;
    const message = `Hi ${client.name}, this is a reminder regarding your pending payment of ₹${payment.outstanding_amount.toLocaleString('en-IN')} for AC maintenance services.${payment.payment_link ? `\nPayment Link:\n${payment.payment_link}` : ''}\n\nPlease complete the payment at your convenience.\n\nThank you,\nNimkiran AC Services`;

    await supabase.from('payments').update({
      reminder_count: newCount,
      last_reminder_date: new Date().toISOString().split('T')[0],
      next_reminder_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      reminder_status: newCount >= 3 ? 'Needs Human Follow-up' : 'Reminder Sent',
    }).eq('id', payment.id);

    await supabase.from('communications').insert({
      client_id: client.id,
      channel: 'WhatsApp',
      message,
      direction: 'outbound',
      status: 'Sent',
      sent_at: new Date().toISOString(),
    });

    await supabase.from('activity_logs').insert({
      client_id: client.id,
      activity_type: 'Payment Reminder Sent',
      description: `AI payment reminder sent (Reminder #${newCount})`,
    });

    await supabase.from('notifications').insert({
      type: 'reminder',
      message: `Payment reminder sent to ${client.name}`,
      read: false,
    });

    await refresh();
  }, [refresh]);

  const markPaymentPaid = useCallback(async (payment: Payment) => {
    const client = clients.find((c) => c.id === payment.client_id);
    await supabase.from('payments').update({
      status: 'Paid',
      paid_amount: payment.total_amount,
      outstanding_amount: 0,
      payment_date: new Date().toISOString().split('T')[0],
      reminder_status: 'Payment Received',
      next_reminder_date: null,
    }).eq('id', payment.id);

    if (client) {
      await supabase.from('activity_logs').insert({
        client_id: client.id,
        activity_type: 'Payment Received',
        description: `Payment of ₹${payment.total_amount.toLocaleString('en-IN')} received`,
      });
      await supabase.from('notifications').insert({
        type: 'payment',
        message: `₹${payment.total_amount.toLocaleString('en-IN')} payment received from ${client.company}`,
        read: false,
      });
    }
    await refresh();
  }, [clients, refresh]);

  return (
    <DataContext.Provider value={{
      clients, services, payments, communications, followups, activityLogs, notifications, aiSettings,
      loading, error, refresh, addClient, updateClient, deleteClient, updatePayment, addCommunication,
      updateFollowup, addFollowup, markNotificationRead, updateAISettings, getClientWithDetails, sendReminder, markPaymentPaid,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
