import { useState, useMemo } from 'react';
import { HeartHandshake, MessageCircle, TrendingUp, AlertTriangle, UserMinus, UserCheck } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, Badge, Button, EmptyState, Select } from '@/components/ui';
import { KPICard } from '@/components/KPICard';
import { LineChart } from '@/components/Charts';
import { formatCurrencyFull, formatDate, getRetentionColor, buildWhatsAppLink } from '@/lib/utils';

export default function RetentionPage() {
  const { clients, services, payments } = useData();
  const [filter, setFilter] = useState('All');

  const retained = clients.filter((c) => c.retention_status === 'Healthy');
  const atRisk = clients.filter((c) => c.retention_status === 'At Risk');
  const lost = clients.filter((c) => c.retention_status === 'Lost');

  const retentionRate = clients.length > 0 ? Math.round((retained.length / clients.length) * 100) : 0;

  const filtered = filter === 'All' ? clients : clients.filter((c) => c.retention_status === filter);

  const retentionData = [
    { label: 'May', value: 85 },
    { label: 'Jun', value: 88 },
    { label: 'Jul', value: 91 },
    { label: 'Aug', value: 89 },
    { label: 'Sep', value: 93 },
    { label: 'Oct', value: retentionRate },
  ];

  return (
    <div className="px-4 lg:px-6 py-6 space-y-5 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Client Retention</h2>
        <p className="text-sm text-slate-500">Track client health, contract renewals, and retention performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Retention Rate" value={`${retentionRate}%`} trend="+2%" trendUp icon={<HeartHandshake className="w-5 h-5 text-violet-600" />} iconBg="bg-violet-50" />
        <KPICard title="Retained Clients" value={retained.length.toString()} icon={<UserCheck className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-50" />
        <KPICard title="At Risk" value={atRisk.length.toString()} icon={<AlertTriangle className="w-5 h-5 text-amber-600" />} iconBg="bg-amber-50" />
        <KPICard title="Lost Clients" value={lost.length.toString()} icon={<UserMinus className="w-5 h-5 text-red-600" />} iconBg="bg-red-50" />
      </div>

      {/* Retention Chart */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-800">Retention Trend</h3>
            <p className="text-xs text-slate-500">Monthly retention rate over the last 6 months</p>
          </div>
          <Badge bg="bg-emerald-50" text="text-emerald-700" dot="bg-emerald-500">{retentionRate}%</Badge>
        </div>
        <LineChart data={retentionData} height={200} color="#8b5cf6" />
      </Card>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <div className="w-48">
          <Select label="" value={filter} onChange={setFilter} options={['All', 'Healthy', 'At Risk', 'Lost']} />
        </div>
        <span className="text-sm text-slate-500">{filtered.length} clients</span>
      </div>

      {/* Retention Table */}
      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={<HeartHandshake className="w-7 h-7" />} title="No clients found" subtitle="No clients match this retention filter." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-xs text-slate-500 font-medium">
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Contract Value</th>
                  <th className="px-4 py-3 hidden md:table-cell">Contract End</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Last Service</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Retention Score</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((c) => {
                  const service = services.find((s) => s.client_id === c.id);
                  const payment = payments.find((p) => p.client_id === c.id);
                  const colors = getRetentionColor(c.retention_status);
                  const score = c.retention_status === 'Healthy' ? 90 + Math.floor(Math.random() * 10) : c.retention_status === 'At Risk' ? 50 + Math.floor(Math.random() * 20) : 20;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">{c.name.charAt(0)}</div>
                          <span className="font-medium text-slate-800">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{c.company}</td>
                      <td className="px-4 py-3 text-slate-800 font-medium">{service ? formatCurrencyFull(service.contract_value) : '—'}</td>
                      <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{service ? formatDate(service.contract_end) : '—'}</td>
                      <td className="px-4 py-3 text-slate-600 hidden lg:table-cell">{service ? formatDate(service.next_service_date) : '—'}</td>
                      <td className="px-4 py-3"><Badge bg={colors.bg} text={colors.text} dot={colors.dot}>{c.retention_status}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${score}%` }} />
                          </div>
                          <span className="text-xs text-slate-600 font-medium">{score}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <a href={buildWhatsAppLink(c.whatsapp_number || c.phone)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                          <MessageCircle className="w-4 h-4" />
                        </a>
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
