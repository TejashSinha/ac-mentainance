import { useState, useMemo } from 'react';
import { Search, Filter, Plus, Upload, MessageCircle, Eye, Pencil, Trash2, Users, Phone, Mail, Building2 } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, Badge, Button, EmptyState, Select } from '@/components/ui';
import { formatCurrencyFull, formatDate, getPaymentStatusColor, getRetentionColor, getClientStatusColor, buildWhatsAppLink, buildReminderMessage } from '@/lib/utils';
import type { Payment } from '@/lib/supabase';

export default function ClientsPage({ onAddClient, onEditClient, onImportClients, onViewClient }: {
  onAddClient: () => void;
  onEditClient: (clientId: string) => void;
  onImportClients: () => void;
  onViewClient: (clientId: string) => void;
}) {
  const { clients, payments, services, deleteClient } = useData();
  const [search, setSearch] = useState('');
  const [filterPayment, setFilterPayment] = useState('All');
  const [filterRetention, setFilterRetention] = useState('All');
  const [filterType, setFilterType] = useState('All');

  const getClientPayment = (clientId: string): Payment | undefined => {
    return payments.find((p) => p.client_id === clientId);
  };

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const matchSearch = !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.company.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        (c.email || '').toLowerCase().includes(search.toLowerCase());
      const payment = getClientPayment(c.id);
      const matchPayment = filterPayment === 'All' || (payment?.status === filterPayment);
      const matchRetention = filterRetention === 'All' || c.retention_status === filterRetention;
      const matchType = filterType === 'All' || c.client_type === filterType;
      return matchSearch && matchPayment && matchRetention && matchType;
    });
  }, [clients, payments, search, filterPayment, filterRetention, filterType]);

  return (
    <div className="px-4 lg:px-6 py-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Clients</h2>
          <p className="text-sm text-slate-500">{filtered.length} of {clients.length} clients</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="md" onClick={onImportClients}>
            <Upload className="w-4 h-4" /> Import
          </Button>
          <Button variant="primary" size="md" onClick={onAddClient}>
            <Plus className="w-4 h-4" /> Add Client
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, company, phone, email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select label="" value={filterPayment} onChange={setFilterPayment} options={['All', 'Paid', 'Pending', 'Overdue', 'Partially Paid']} />
            <Select label="" value={filterRetention} onChange={setFilterRetention} options={['All', 'Healthy', 'At Risk', 'Lost']} />
            <Select label="" value={filterType} onChange={setFilterType} options={['All', 'Co-Living', 'Residential', 'Commercial', 'Office', 'Hotel']} />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Users className="w-7 h-7" />}
            title="No clients found"
            subtitle="Try adjusting your search or filters, or add a new client."
            action={<Button variant="primary" onClick={onAddClient}><Plus className="w-4 h-4" /> Add Client</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-xs text-slate-500 font-medium">
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3 hidden md:table-cell">Phone</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Service</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Due Date</th>
                  <th className="px-4 py-3 hidden xl:table-cell">Retention</th>
                  <th className="px-4 py-3">WhatsApp</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((c) => {
                  const payment = getClientPayment(c.id);
                  const service = services.find((s) => s.client_id === c.id);
                  const payColors = payment ? getPaymentStatusColor(payment.status) : null;
                  const retColors = getRetentionColor(c.retention_status);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 cursor-pointer" onClick={() => onViewClient(c.id)}>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                            {c.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 truncate">{c.name}</p>
                            <p className="text-xs text-slate-400">{c.client_type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{c.company}</td>
                      <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{c.phone}</td>
                      <td className="px-4 py-3 text-slate-600 hidden lg:table-cell">{service?.service_type || '—'}</td>
                      <td className="px-4 py-3">
                        {payment && payColors ? (
                          <Badge bg={payColors.bg} text={payColors.text} dot={payColors.dot}>{payment.status}</Badge>
                        ) : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {payment ? formatCurrencyFull(payment.outstanding_amount) : '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 hidden lg:table-cell">
                        {payment?.due_date ? formatDate(payment.due_date) : '—'}
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <Badge bg={retColors.bg} text={retColors.text} dot={retColors.dot}>{c.retention_status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={buildWhatsAppLink(c.whatsapp_number || c.phone, payment ? buildReminderMessage(c.name, payment.outstanding_amount, payment.due_date, payment.payment_link) : undefined)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                          title="Open WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => onViewClient(c.id)} className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => onEditClient(c.id)} className="p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" title="Edit">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => { if (confirm(`Delete ${c.name}?`)) await deleteClient(c.id); }}
                            className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
