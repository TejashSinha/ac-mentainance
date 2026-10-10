import { useState, useMemo } from 'react';
import { CalendarCheck, MessageCircle, Phone, CheckCircle2, Calendar, User } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, Badge, Button, EmptyState, Select } from '@/components/ui';
import { useToast } from '@/components/Toast';
import { formatCurrencyFull, formatDate, buildWhatsAppLink } from '@/lib/utils';

export default function FollowupsPage() {
  const { followups, clients, payments, updateFollowup } = useData();
  const { showToast } = useToast();
  const [filter, setFilter] = useState('All');

  const today = new Date().toISOString().split('T')[0];

  const followupsWithClient = useMemo(() => {
    return followups.map((f) => {
      const client = clients.find((c) => c.id === f.client_id);
      const payment = payments.find((p) => p.client_id === f.client_id);
      return { ...f, client, payment };
    });
  }, [followups, clients, payments]);

  const todayFollowups = followupsWithClient.filter((f) => f.due_date <= today && f.status === 'Pending');
  const filtered = filter === 'All' ? followupsWithClient.filter((f) => f.status === 'Pending') : followupsWithClient.filter((f) => f.type === filter && f.status === 'Pending');

  const handleComplete = async (id: string) => {
    await updateFollowup(id, { status: 'Completed' });
    showToast('Follow-up marked as complete');
  };

  const handleReschedule = async (id: string) => {
    const newDate = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
    await updateFollowup(id, { due_date: newDate });
    showToast('Follow-up rescheduled by 3 days');
  };

  return (
    <div className="px-4 lg:px-6 py-6 space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Follow-ups</h2>
          <p className="text-sm text-slate-500">{todayFollowups.length} follow-ups due today</p>
        </div>
        <div className="w-48">
          <Select label="" value={filter} onChange={setFilter} options={['All', 'Payment Follow-up', 'Service Follow-up', 'Contract Renewal', 'Maintenance Follow-up', 'Client Check-in', 'Retention Follow-up']} />
        </div>
      </div>

      {/* Today's Follow-ups */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-slate-800">Today's Follow-ups</h3>
          <Badge bg="bg-blue-50" text="text-blue-700">{todayFollowups.length}</Badge>
        </div>
        {filtered.length === 0 ? (
          <EmptyState icon={<CheckCircle2 className="w-7 h-7" />} title="All follow-ups are completed" subtitle="There are no pending follow-ups at this time." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-xs text-slate-500 font-medium">
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Notes</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                          {f.client?.name.charAt(0) || '?'}
                        </div>
                        <span className="font-medium text-slate-800">{f.client?.name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{f.client?.company || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge bg="bg-slate-100" text="text-slate-700">{f.type}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-800 font-medium">
                      {f.payment ? formatCurrencyFull(f.payment.outstanding_amount) : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className={f.due_date < today ? 'text-red-600 font-medium' : ''}>{formatDate(f.due_date)}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs max-w-xs truncate">{f.notes || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <a
                          href={buildWhatsAppLink(f.client?.whatsapp_number || f.client?.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                        <a href={`tel:${f.client?.phone}`} className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Call">
                          <Phone className="w-4 h-4" />
                        </a>
                        <button onClick={() => handleComplete(f.id)} className="p-1.5 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors" title="Mark Complete">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleReschedule(f.id)} className="p-1.5 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" title="Reschedule">
                          <Calendar className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Follow-up Types Info */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {['Payment Follow-up', 'Service Follow-up', 'Contract Renewal', 'Maintenance Follow-up', 'Client Check-in', 'Retention Follow-up'].map((type) => {
          const count = followups.filter((f) => f.type === type && f.status === 'Pending').length;
          return (
            <Card key={type} className="p-3 text-center">
              <p className="text-lg font-bold text-slate-800">{count}</p>
              <p className="text-xs text-slate-500 mt-0.5">{type}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
