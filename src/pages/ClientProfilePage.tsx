import { ArrowLeft, MessageCircle, Pencil, Send, Copy, CheckCircle2, Phone, Mail, MapPin, Building2, Calendar, Snowflake, IndianRupee, FileText, Clock } from 'lucide-react';
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Card, Badge, Button, EmptyState } from '@/components/ui';
import { useToast } from '@/components/Toast';
import { formatCurrencyFull, formatDate, formatDateTime, getPaymentStatusColor, getRetentionColor, getClientStatusColor, buildWhatsAppLink, buildReminderMessage, timeAgo } from '@/lib/utils';

export default function ClientProfilePage({ clientId, onBack, onEditClient }: {
  clientId: string;
  onBack: () => void;
  onEditClient: (id: string) => void;
}) {
  const { getClientWithDetails, sendReminder, markPaymentPaid } = useData();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'communications' | 'timeline'>('overview');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const client = getClientWithDetails(clientId);
  if (!client) {
    return (
      <div className="px-4 lg:px-6 py-6">
        <EmptyState icon={<Building2 className="w-7 h-7" />} title="Client not found" subtitle="This client may have been deleted." action={<Button onClick={onBack}>Back to Clients</Button>} />
      </div>
    );
  }

  const payColors = client.payments?.[0] ? getPaymentStatusColor(client.payments[0].status) : null;
  const retColors = getRetentionColor(client.retention_status);
  const statusColors = getClientStatusColor(client.status);
  const totalPaid = client.payments?.reduce((sum, p) => sum + (p.paid_amount || 0), 0) || 0;
  const totalOutstanding = client.payments?.reduce((sum, p) => sum + (p.outstanding_amount || 0), 0) || 0;
  const totalContract = client.service?.contract_value || 0;

  const copyPaymentLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    showToast('Payment link copied to clipboard');
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleSendReminder = async () => {
    const payment = client.payments?.find((p) => p.status !== 'Paid');
    if (!payment) { showToast('No pending payments for this client', 'info'); return; }
    await sendReminder(payment, client);
    showToast(`Payment reminder sent to ${client.name}`);
  };

  const handleMarkPaid = async () => {
    const payment = client.payments?.find((p) => p.status !== 'Paid');
    if (!payment) return;
    await markPaymentPaid(payment);
    showToast(`Payment marked as paid for ${client.name}`);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'payments', label: 'Payments', icon: IndianRupee },
    { id: 'communications', label: 'Communications', icon: MessageCircle },
    { id: 'timeline', label: 'Timeline', icon: Clock },
  ] as const;

  return (
    <div className="px-4 lg:px-6 py-6 space-y-5 max-w-5xl mx-auto">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Clients
      </button>

      {/* Header Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              {client.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{client.name}</h2>
              <p className="text-sm text-slate-500">{client.company}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge bg={statusColors.bg} text={statusColors.text}>{client.status}</Badge>
                {payColors && client.payments?.[0] && <Badge bg={payColors.bg} text={payColors.text} dot={payColors.dot}>{client.payments[0].status}</Badge>}
                <Badge bg={retColors.bg} text={retColors.text} dot={retColors.dot}>{client.retention_status}</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={buildWhatsAppLink(client.whatsapp_number || client.phone, client.payments?.[0] ? buildReminderMessage(client.name, client.payments[0].outstanding_amount, client.payments[0].due_date, client.payments[0].payment_link) : undefined)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="success" size="md"><MessageCircle className="w-4 h-4" /> WhatsApp</Button>
            </a>
            <Button variant="secondary" size="md" onClick={() => onEditClient(client.id)}><Pencil className="w-4 h-4" /> Edit</Button>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Client Info */}
          <Card className="p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Building2 className="w-4 h-4 text-slate-400" /> Client Information</h3>
            <div className="space-y-3">
              {[
                { icon: Phone, label: 'Phone', value: client.phone },
                { icon: MessageCircle, label: 'WhatsApp', value: client.whatsapp_number || client.phone },
                { icon: Mail, label: 'Email', value: client.email || '—' },
                { icon: MapPin, label: 'Address', value: client.address || '—' },
                { icon: Building2, label: 'Client Type', value: client.client_type },
                { icon: Calendar, label: 'Date Onboarded', value: formatDate(client.date_onboarded) },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-sm text-slate-500 w-28">{item.label}</span>
                  <span className="text-sm text-slate-800 font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Service Info */}
          <Card className="p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Snowflake className="w-4 h-4 text-slate-400" /> Service Information</h3>
            <div className="space-y-3">
              {[
                { label: 'Service Type', value: client.service?.service_type || '—' },
                { label: 'AC Units', value: (client.service?.ac_units || 0).toString() },
                { label: 'Installation Date', value: formatDate(client.service?.installation_date) },
                { label: 'Maintenance Plan', value: client.service?.maintenance_plan || '—' },
                { label: 'Contract Start', value: formatDate(client.service?.contract_start) },
                { label: 'Contract End', value: formatDate(client.service?.contract_end) },
                { label: 'Contract Value', value: formatCurrencyFull(client.service?.contract_value) },
                { label: 'Next Service', value: formatDate(client.service?.next_service_date) },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{item.label}</span>
                  <span className="text-sm text-slate-800 font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Payment Info */}
          <Card className="p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2"><IndianRupee className="w-4 h-4 text-slate-400" /> Payment Information</h3>
              {client.payments?.[0] && client.payments[0].status !== 'Paid' && (
                <div className="flex gap-2">
                  <Button variant="success" size="sm" onClick={handleMarkPaid}><CheckCircle2 className="w-3.5 h-3.5" /> Mark Paid</Button>
                  <Button variant="primary" size="sm" onClick={handleSendReminder}><Send className="w-3.5 h-3.5" /> Send Reminder</Button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Total Contract Value</p>
                <p className="text-lg font-bold text-slate-800">{formatCurrencyFull(totalContract)}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4">
                <p className="text-xs text-emerald-600 mb-1">Total Paid</p>
                <p className="text-lg font-bold text-emerald-700">{formatCurrencyFull(totalPaid)}</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-xs text-red-600 mb-1">Total Outstanding</p>
                <p className="text-lg font-bold text-red-700">{formatCurrencyFull(totalOutstanding)}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Payment Status</p>
                <div className="mt-1">
                  {payColors && client.payments?.[0] ? (
                    <Badge bg={payColors.bg} text={payColors.text} dot={payColors.dot}>{client.payments[0].status}</Badge>
                  ) : <span className="text-sm text-slate-600">—</span>}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'payments' && (
        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Payment History</h3>
          </div>
          {client.payments && client.payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-left text-xs text-slate-500 font-medium">
                    <th className="px-4 py-3">Invoice</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3">Payment Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Reminders</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {client.payments.map((p) => {
                    const colors = getPaymentStatusColor(p.status);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium text-slate-800">{p.invoice_number}</td>
                        <td className="px-4 py-3">
                          <p className="text-slate-800 font-medium">{formatCurrencyFull(p.total_amount)}</p>
                          <p className="text-xs text-slate-400">Outstanding: {formatCurrencyFull(p.outstanding_amount)}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{formatDate(p.due_date)}</td>
                        <td className="px-4 py-3 text-slate-600">{formatDate(p.payment_date)}</td>
                        <td className="px-4 py-3"><Badge bg={colors.bg} text={colors.text} dot={colors.dot}>{p.status}</Badge></td>
                        <td className="px-4 py-3 text-slate-600">{p.payment_method || '—'}</td>
                        <td className="px-4 py-3">
                          <span className="text-slate-600">{p.reminder_count}</span>
                          {p.reminder_status === 'Needs Human Follow-up' && (
                            <p className="text-xs text-red-500">Escalated</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {p.payment_link && (
                              <button
                                onClick={() => copyPaymentLink(p.payment_link!)}
                                className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                title="Copy payment link"
                              >
                                {copiedLink === p.payment_link ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                              </button>
                            )}
                            {p.status !== 'Paid' && (
                              <a
                                href={buildWhatsAppLink(client.whatsapp_number || client.phone, buildReminderMessage(client.name, p.outstanding_amount, p.due_date, p.payment_link))}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                title="Send payment link on WhatsApp"
                              >
                                <Send className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={<FileText className="w-7 h-7" />} title="No payments recorded" subtitle="Payment history will appear here once invoices are created." />
          )}
        </Card>
      )}

      {activeTab === 'communications' && (
        <Card className="p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Communication History</h3>
          {client.communications && client.communications.length > 0 ? (
            <div className="space-y-3">
              {client.communications.map((comm) => (
                <div key={comm.id} className={`flex gap-3 ${comm.direction === 'inbound' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${comm.direction === 'inbound' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                    {comm.direction === 'inbound' ? client.name.charAt(0) : 'AI'}
                  </div>
                  <div className={`max-w-[70%] rounded-xl px-4 py-3 ${comm.direction === 'inbound' ? 'bg-emerald-50 text-slate-700' : 'bg-blue-50 text-slate-700'}`}>
                    <p className="text-sm">{comm.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{formatDateTime(comm.sent_at)} · {comm.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<MessageCircle className="w-7 h-7" />} title="No communications yet" subtitle="WhatsApp communication history will appear here." />
          )}
        </Card>
      )}

      {activeTab === 'timeline' && (
        <Card className="p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Activity Timeline</h3>
          {client.activities && client.activities.length > 0 ? (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />
              <div className="space-y-4">
                {client.activities.map((activity) => (
                  <div key={activity.id} className="flex gap-4 relative">
                    <div className="w-8 h-8 rounded-full bg-white ring-2 ring-slate-200 flex items-center justify-center flex-shrink-0 z-10">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    </div>
                    <div className="bg-slate-50 rounded-xl px-4 py-3 flex-1">
                      <p className="text-sm font-medium text-slate-800">{activity.activity_type}</p>
                      {activity.description && <p className="text-sm text-slate-600 mt-0.5">{activity.description}</p>}
                      <p className="text-xs text-slate-400 mt-1">{formatDateTime(activity.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState icon={<Clock className="w-7 h-7" />} title="No activity yet" subtitle="Client activity will be tracked here over time." />
          )}
        </Card>
      )}
    </div>
  );
}
