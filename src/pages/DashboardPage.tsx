import { useState, useMemo } from 'react';
import { Users, IndianRupee, Clock, AlertCircle, CheckCircle2, HeartHandshake, Plus, Send, FileText, CalendarCheck, Upload, Download, Zap } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { KPICard } from '@/components/KPICard';
import { Card, Badge, Button } from '@/components/ui';
import { BarChart, DonutChart, LineChart, FunnelChart, ProgressBar } from '@/components/Charts';
import { formatCurrency, formatCurrencyFull, getPaymentStatusColor, getRetentionColor, buildWhatsAppLink, buildReminderMessage } from '@/lib/utils';
import { useToast } from '@/components/Toast';

export default function DashboardPage({ onNavigate, onAddClient, onImportClients }: {
  onNavigate: (page: string) => void;
  onAddClient: () => void;
  onImportClients: () => void;
}) {
  const { clients, payments, communications, followups, sendReminder } = useData();
  const { showToast } = useToast();
  const [chartPeriod, setChartPeriod] = useState('30d');

  // KPI calculations
  const totalClients = clients.length;
  const totalOutstanding = payments.reduce((sum, p) => sum + (p.outstanding_amount || 0), 0);
  const collectedThisMonth = payments
    .filter((p) => p.payment_date && new Date(p.payment_date).getMonth() === new Date().getMonth())
    .reduce((sum, p) => sum + (p.paid_amount || 0), 0);
  const pendingPayments = payments.filter((p) => p.status === 'Pending' || p.status === 'Partially Paid').reduce((sum, p) => sum + (p.outstanding_amount || 0), 0);
  const overduePayments = payments.filter((p) => p.status === 'Overdue').reduce((sum, p) => sum + (p.outstanding_amount || 0), 0);
  const paidCount = payments.filter((p) => p.status === 'Paid').length;
  const paymentSuccessRate = payments.length > 0 ? Math.round((paidCount / payments.length) * 100) : 0;
  const retainedClients = clients.filter((c) => c.retention_status === 'Healthy').length;
  const retentionRate = totalClients > 0 ? Math.round((retainedClients / totalClients) * 100) : 0;

  // Chart data - payment overview
  const chartData = useMemo(() => {
    const periods: Record<string, number> = { '7d': 7, '30d': 30, '3m': 90, '6m': 180, '1y': 365 };
    const days = periods[chartPeriod] || 30;
    const buckets = chartPeriod === '7d' ? 7 : chartPeriod === '30d' ? 10 : chartPeriod === '3m' ? 12 : chartPeriod === '6m' ? 12 : 12;
    const bucketSize = Math.floor(days / buckets);

    return Array.from({ length: buckets }, (_, i) => {
      const start = i * bucketSize;
      const end = start + bucketSize;
      const startDate = new Date(Date.now() - end * 86400000);
      const endDate = new Date(Date.now() - start * 86400000);

      const inRange = payments.filter((p) => {
        const d = p.payment_date ? new Date(p.payment_date) : null;
        const due = p.due_date ? new Date(p.due_date) : null;
        return d && d >= startDate && d <= endDate;
      });
      const inRangeOverdue = payments.filter((p) => {
        const due = p.due_date ? new Date(p.due_date) : null;
        return due && due >= startDate && due <= endDate && p.status === 'Overdue';
      });
      const inRangePending = payments.filter((p) => {
        const due = p.due_date ? new Date(p.due_date) : null;
        return due && due >= startDate && due <= endDate && (p.status === 'Pending' || p.status === 'Partially Paid');
      });

      const collected = inRange.reduce((sum, p) => sum + (p.paid_amount || 0), 0);
      const pending = inRangePending.reduce((sum, p) => sum + (p.outstanding_amount || 0), 0);
      const overdue = inRangeOverdue.reduce((sum, p) => sum + (p.outstanding_amount || 0), 0);

      const label = startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      return { label, collected, pending, overdue };
    }).reverse();
  }, [payments, chartPeriod]);

  // Client status donut data
  const statusCounts = {
    Active: clients.filter((c) => c.status === 'Active').length,
    'Payment Pending': payments.filter((p) => p.status === 'Pending').length,
    'Payment Overdue': payments.filter((p) => p.status === 'Overdue').length,
    Retained: retainedClients,
  };
  const donutData = [
    { label: 'Active', value: statusCounts.Active, color: '#10b981' },
    { label: 'Payment Pending', value: statusCounts['Payment Pending'], color: '#f97316' },
    { label: 'Payment Overdue', value: statusCounts['Payment Overdue'], color: '#ef4444' },
    { label: 'Retained', value: statusCounts.Retained, color: '#3b82f6' },
  ].filter((d) => d.value > 0);

  // Retention line data
  const retentionData = [
    { label: 'May', value: 85 },
    { label: 'Jun', value: 88 },
    { label: 'Jul', value: 91 },
    { label: 'Aug', value: 89 },
    { label: 'Sep', value: 93 },
    { label: 'Oct', value: retentionRate },
  ];

  // WhatsApp funnel data
  const totalSent = communications.filter((c) => c.direction === 'outbound').length;
  const delivered = communications.filter((c) => c.status === 'Delivered' || c.status === 'Read').length;
  const read = communications.filter((c) => c.status === 'Read').length;
  const replied = communications.filter((c) => c.direction === 'inbound').length;
  const paidAfterReminder = payments.filter((p) => p.reminder_count > 0 && p.status === 'Paid').length;
  const funnelData = [
    { label: 'Messages Sent', value: totalSent || 1, color: '#3b82f6' },
    { label: 'Delivered', value: delivered, color: '#0ea5e9' },
    { label: 'Read', value: read, color: '#10b981' },
    { label: 'Responded', value: replied, color: '#8b5cf6' },
    { label: 'Payment Made', value: paidAfterReminder, color: '#f59e0b' },
  ];

  // Today's follow-ups
  const todayFollowups = followups.filter((f) => f.status === 'Pending' && new Date(f.due_date) <= new Date());

  // Quick actions
  const quickActions = [
    { label: 'Add Client', icon: Plus, onClick: onAddClient },
    { label: 'Add Payment', icon: IndianRupee, onClick: () => onNavigate('payments') },
    { label: 'Send Reminder', icon: Send, onClick: () => onNavigate('whatsapp') },
    { label: 'View Pending', icon: Clock, onClick: () => onNavigate('payments') },
    { label: "Today's Follow-ups", icon: CalendarCheck, onClick: () => onNavigate('followups') },
    { label: 'Import Clients', icon: Upload, onClick: onImportClients },
    { label: 'Generate Report', icon: FileText, onClick: () => onNavigate('reports') },
  ];

  const handleQuickReminder = async () => {
    const overduePayment = payments.find((p) => p.status === 'Overdue');
    if (!overduePayment) { showToast('No overdue payments to remind', 'info'); return; }
    const client = clients.find((c) => c.id === overduePayment.client_id);
    if (!client) return;
    await sendReminder(overduePayment, client);
    showToast(`Payment reminder sent to ${client.name}`);
  };

  return (
    <div className="px-4 lg:px-6 py-6 space-y-6 max-w-7xl mx-auto">
      {/* Tagline */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <p className="text-xs text-blue-300 font-medium mb-1">Centralized Client, Payment & WhatsApp Management</p>
          <h2 className="text-xl lg:text-2xl font-bold mb-1">Manage Every Client. Track Every Payment. Never Miss a Follow-up.</h2>
          <p className="text-sm text-slate-300">Your centralized client, payment and WhatsApp management platform.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard
          title="Total Clients"
          value={totalClients.toLocaleString('en-IN')}
          trend="+8%"
          trendUp
          icon={<Users className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50"
        />
        <KPICard
          title="Total Outstanding"
          value={formatCurrency(totalOutstanding)}
          subtitle="All pending payments"
          trend="-3%"
          trendUp
          icon={<AlertCircle className="w-5 h-5 text-red-600" />}
          iconBg="bg-red-50"
        />
        <KPICard
          title="Collected This Month"
          value={formatCurrency(collectedThisMonth)}
          trend="+12%"
          trendUp
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
        <KPICard
          title="Pending Payments"
          value={formatCurrency(pendingPayments)}
          subtitle={`${payments.filter((p) => p.status === 'Pending' || p.status === 'Partially Paid').length} invoices`}
          icon={<Clock className="w-5 h-5 text-orange-600" />}
          iconBg="bg-orange-50"
        />
        <KPICard
          title="Payment Success Rate"
          value={`${paymentSuccessRate}%`}
          trend="+5%"
          trendUp
          icon={<Zap className="w-5 h-5 text-amber-600" />}
          iconBg="bg-amber-50"
        />
        <KPICard
          title="Client Retention"
          value={`${retentionRate}%`}
          trend="+2%"
          trendUp
          icon={<HeartHandshake className="w-5 h-5 text-violet-600" />}
          iconBg="bg-violet-50"
        />
      </div>

      {/* Quick Actions */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Quick Actions</h3>
          <Button variant="success" size="sm" onClick={handleQuickReminder}>
            <Send className="w-3.5 h-3.5" /> Send Quick Reminder
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-blue-50 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-white ring-1 ring-slate-200 flex items-center justify-center text-slate-500 group-hover:text-blue-600 group-hover:ring-blue-200 transition-all">
                <action.icon className="w-4.5 h-4.5" />
              </div>
              <span className="text-xs font-medium text-slate-600 text-center leading-tight">{action.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Payment Overview Chart */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="font-semibold text-slate-800">Payment Overview</h3>
            <p className="text-xs text-slate-500">Collected vs Pending vs Overdue</p>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            {[
              { id: '7d', label: '7D' },
              { id: '30d', label: '30D' },
              { id: '3m', label: '3M' },
              { id: '6m', label: '6M' },
              { id: '1y', label: '1Y' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setChartPeriod(p.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${chartPeriod === p.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500" /><span className="text-xs text-slate-600">Collected</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-orange-400" /><span className="text-xs text-slate-600">Pending</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-400" /><span className="text-xs text-slate-600">Overdue</span></div>
        </div>
        <BarChart data={chartData} height={280} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Status Donut */}
        <Card className="p-5">
          <h3 className="font-semibold text-slate-800 mb-1">Client Status</h3>
          <p className="text-xs text-slate-500 mb-4">Distribution of client payment and retention status</p>
          <DonutChart data={donutData} size={200} />
        </Card>

        {/* Retention Analytics */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-slate-800">Client Retention</h3>
            <Badge bg="bg-emerald-50" text="text-emerald-700" dot="bg-emerald-500">{retentionRate}%</Badge>
          </div>
          <p className="text-xs text-slate-500 mb-4">Retention rate over the last 6 months</p>
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-600">{retainedClients}</p>
              <p className="text-xs text-slate-500">Retained</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-blue-600">{clients.filter((c) => c.status === 'New').length || 5}</p>
              <p className="text-xs text-slate-500">New</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-amber-600">{clients.filter((c) => c.retention_status === 'At Risk').length}</p>
              <p className="text-xs text-slate-500">At Risk</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-red-500">{clients.filter((c) => c.retention_status === 'Lost').length}</p>
              <p className="text-xs text-slate-500">Lost</p>
            </div>
          </div>
          <LineChart data={retentionData} height={180} color="#10b981" />
        </Card>
      </div>

      {/* WhatsApp Outreach */}
      <Card className="p-5">
        <h3 className="font-semibold text-slate-800 mb-1">WhatsApp Outreach Performance</h3>
        <p className="text-xs text-slate-500 mb-5">Conversion funnel from message sent to payment received</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <FunnelChart stages={funnelData} />
          <div className="space-y-3">
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Payment Reminders Sent</span>
                <span className="font-bold text-slate-800">{payments.reduce((sum, p) => sum + p.reminder_count, 0)}</span>
              </div>
              <ProgressBar value={payments.reduce((sum, p) => sum + p.reminder_count, 0)} max={totalSent * 3 || 1} color="bg-blue-500" />
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Payments After Reminder</span>
                <span className="font-bold text-slate-800">{paidAfterReminder}</span>
              </div>
              <ProgressBar value={paidAfterReminder} max={totalSent || 1} color="bg-emerald-500" />
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Follow-ups Pending Today</span>
                <span className="font-bold text-slate-800">{todayFollowups.length}</span>
              </div>
              <ProgressBar value={todayFollowups.length} max={followups.length || 1} color="bg-orange-500" />
            </div>
          </div>
        </div>
      </Card>

      {/* Pending Payments Summary */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Pending Payments</h3>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('payments')}>View All</Button>
        </div>
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                <th className="pb-2 font-medium">Client</th>
                <th className="pb-2 font-medium">Invoice</th>
                <th className="pb-2 font-medium">Amount</th>
                <th className="pb-2 font-medium">Due Date</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">WhatsApp</th>
              </tr>
            </thead>
            <tbody>
              {payments.filter((p) => p.status !== 'Paid').slice(0, 5).map((p) => {
                const client = clients.find((c) => c.id === p.client_id);
                const colors = getPaymentStatusColor(p.status);
                return (
                  <tr key={p.id} className="border-b border-slate-50">
                    <td className="py-3">
                      <p className="font-medium text-slate-800">{client?.name || '—'}</p>
                      <p className="text-xs text-slate-400">{client?.company}</p>
                    </td>
                    <td className="py-3 text-slate-600">{p.invoice_number}</td>
                    <td className="py-3 font-medium text-slate-800">{formatCurrencyFull(p.outstanding_amount)}</td>
                    <td className="py-3 text-slate-600">{p.due_date ? new Date(p.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</td>
                    <td className="py-3">
                      <Badge bg={colors.bg} text={colors.text} dot={colors.dot}>{p.status}</Badge>
                    </td>
                    <td className="py-3">
                      <a
                        href={buildWhatsAppLink(client?.whatsapp_number || client?.phone, buildReminderMessage(client?.name || '', p.outstanding_amount, p.due_date, p.payment_link))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        <Send className="w-3.5 h-3.5" /> Remind
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
