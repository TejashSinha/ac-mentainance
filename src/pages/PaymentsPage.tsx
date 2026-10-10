import { useState, useMemo } from 'react';
import { Search, Send, Copy, CheckCircle2, IndianRupee, AlertCircle, Clock, FileText } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, Badge, Button, EmptyState, Select } from '@/components/ui';
import { KPICard } from '@/components/KPICard';
import { useToast } from '@/components/Toast';
import { formatCurrencyFull, formatDate, daysOverdue, getPaymentStatusColor, buildWhatsAppLink, buildReminderMessage } from '@/lib/utils';

export default function PaymentsPage() {
  const { payments, clients, sendReminder, markPaymentPaid } = useData();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const totalOutstanding = payments.reduce((s, p) => s + (p.outstanding_amount || 0), 0);
  const totalCollected = payments.reduce((s, p) => s + (p.paid_amount || 0), 0);
  const overdueAmount = payments.filter((p) => p.status === 'Overdue').reduce((s, p) => s + (p.outstanding_amount || 0), 0);
  const pendingAmount = payments.filter((p) => p.status === 'Pending' || p.status === 'Partially Paid').reduce((s, p) => s + (p.outstanding_amount || 0), 0);

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      const client = clients.find((c) => c.id === p.client_id);
      const matchSearch = !search ||
        p.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
        (client?.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (client?.company || '').toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === 'All' || p.status === filter;
      return matchSearch && matchFilter;
    });
  }, [payments, clients, search, filter]);

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    showToast('Payment link copied');
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleReminder = async (payment: typeof payments[0]) => {
    const client = clients.find((c) => c.id === payment.client_id);
    if (!client) return;
    await sendReminder(payment, client);
    showToast(`Reminder sent to ${client.name}`);
  };

  const handleMarkPaid = async (payment: typeof payments[0]) => {
    await markPaymentPaid(payment);
    const client = clients.find((c) => c.id === payment.client_id);
    showToast(`Payment marked as paid${client ? ` for ${client.name}` : ''}`);
  };

  return (
    <div className="px-4 lg:px-6 py-6 space-y-5 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Payments</h2>
        <p className="text-sm text-slate-500">Track all invoices, payments, and outstanding amounts</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Outstanding" value={formatCurrencyFull(totalOutstanding)} icon={<AlertCircle className="w-5 h-5 text-red-600" />} iconBg="bg-red-50" />
        <KPICard title="Collected" value={formatCurrencyFull(totalCollected)} icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-50" />
        <KPICard title="Pending" value={formatCurrencyFull(pendingAmount)} icon={<Clock className="w-5 h-5 text-orange-600" />} iconBg="bg-orange-50" />
        <KPICard title="Overdue" value={formatCurrencyFull(overdueAmount)} icon={<IndianRupee className="w-5 h-5 text-red-600" />} iconBg="bg-red-50" />
      </div>

      {/* Search & Filter */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice, client, company..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
          </div>
          <div className="w-48">
            <Select label="" value={filter} onChange={setFilter} options={['All', 'Paid', 'Pending', 'Overdue', 'Partially Paid']} />
          </div>
        </div>
      </Card>

      {/* Payments Table */}
      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={<FileText className="w-7 h-7" />} title="No payments found" subtitle="No pending payments match your search." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-xs text-slate-500 font-medium">
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Invoice</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Outstanding</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Days Overdue</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Reminders</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((p) => {
                  const client = clients.find((c) => c.id === p.client_id);
                  const colors = getPaymentStatusColor(p.status);
                  const dOverdue = daysOverdue(p.due_date);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{client?.name || '—'}</p>
                        <p className="text-xs text-slate-400">{client?.company}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium">{p.invoice_number}</td>
                      <td className="px-4 py-3 text-slate-800">{formatCurrencyFull(p.total_amount)}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{formatCurrencyFull(p.outstanding_amount)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(p.due_date)}</td>
                      <td className="px-4 py-3">
                        {dOverdue > 0 ? <span className="text-red-600 font-medium">{dOverdue} days</span> : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-4 py-3"><Badge bg={colors.bg} text={colors.text} dot={colors.dot}>{p.status}</Badge></td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-slate-600">{p.reminder_count}</span>
                        {p.reminder_status === 'Needs Human Follow-up' && <p className="text-xs text-red-500">Escalated</p>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {p.payment_link && (
                            <button onClick={() => copyLink(p.payment_link!)} className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Copy payment link">
                              {copiedLink === p.payment_link ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                          )}
                          {p.status !== 'Paid' && (
                            <>
                              <a
                                href={buildWhatsAppLink(client?.whatsapp_number || client?.phone, buildReminderMessage(client?.name || '', p.outstanding_amount, p.due_date, p.payment_link))}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                title="Send on WhatsApp"
                              >
                                <Send className="w-4 h-4" />
                              </a>
                              <button
                                onClick={() => handleMarkPaid(p)}
                                className="p-1.5 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                title="Mark as Paid"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
