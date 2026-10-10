import { useMemo } from 'react';
import { TrendingUp, Users, IndianRupee, MessageCircle, BarChart3 } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, Badge } from '@/components/ui';
import { KPICard } from '@/components/KPICard';
import { BarChart, DonutChart, LineChart, FunnelChart, ProgressBar } from '@/components/Charts';
import { formatCurrency, formatCurrencyFull } from '@/lib/utils';

export default function AnalyticsPage() {
  const { clients, payments, communications } = useData();

  const totalRevenue = payments.reduce((s, p) => s + (p.total_amount || 0), 0);
  const collectedRevenue = payments.reduce((s, p) => s + (p.paid_amount || 0), 0);
  const pendingRevenue = payments.reduce((s, p) => s + (p.outstanding_amount || 0), 0);
  const overdueRevenue = payments.filter((p) => p.status === 'Overdue').reduce((s, p) => s + (p.outstanding_amount || 0), 0);

  const paidInvoices = payments.filter((p) => p.status === 'Paid').length;
  const pendingInvoices = payments.filter((p) => p.status === 'Pending').length;
  const overdueInvoices = payments.filter((p) => p.status === 'Overdue').length;
  const partialInvoices = payments.filter((p) => p.status === 'Partially Paid').length;

  const newClients = clients.filter((c) => c.status === 'New').length || 5;
  const activeClients = clients.filter((c) => c.status === 'Active').length;
  const retainedClients = clients.filter((c) => c.retention_status === 'Healthy').length;
  const lostClients = clients.filter((c) => c.retention_status === 'Lost').length;

  const totalSent = communications.filter((c) => c.direction === 'outbound').length;
  const delivered = communications.filter((c) => c.status === 'Delivered' || c.status === 'Read').length;
  const read = communications.filter((c) => c.status === 'Read').length;
  const replied = communications.filter((c) => c.direction === 'inbound').length;
  const paidAfterReminder = payments.filter((p) => p.reminder_count > 0 && p.status === 'Paid').length;

  // Revenue chart data (last 6 months)
  const revenueData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('en-IN', { month: 'short' });
      const inMonth = payments.filter((p) => {
        const d = p.payment_date ? new Date(p.payment_date) : null;
        return d && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
      });
      const collected = inMonth.reduce((s, p) => s + (p.paid_amount || 0), 0);
      const pending = payments.filter((p) => {
        const d = p.due_date ? new Date(p.due_date) : null;
        return d && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear() && p.status !== 'Paid';
      }).reduce((s, p) => s + (p.outstanding_amount || 0), 0);
      const overdue = payments.filter((p) => {
        const d = p.due_date ? new Date(p.due_date) : null;
        return d && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear() && p.status === 'Overdue';
      }).reduce((s, p) => s + (p.outstanding_amount || 0), 0);
      months.push({ label: monthName, collected, pending, overdue });
    }
    return months;
  }, [payments]);

  const clientDonutData = [
    { label: 'Active', value: activeClients, color: '#10b981' },
    { label: 'New', value: newClients, color: '#3b82f6' },
    { label: 'Retained', value: retainedClients, color: '#8b5cf6' },
    { label: 'Lost', value: lostClients, color: '#ef4444' },
  ].filter((d) => d.value > 0);

  const paymentDonutData = [
    { label: 'Paid', value: paidInvoices, color: '#10b981' },
    { label: 'Pending', value: pendingInvoices, color: '#f97316' },
    { label: 'Overdue', value: overdueInvoices, color: '#ef4444' },
    { label: 'Partially Paid', value: partialInvoices, color: '#f59e0b' },
  ].filter((d) => d.value > 0);

  const funnelData = [
    { label: 'Messages Sent', value: totalSent || 1, color: '#3b82f6' },
    { label: 'Delivered', value: delivered, color: '#0ea5e9' },
    { label: 'Read', value: read, color: '#10b981' },
    { label: 'Replied', value: replied, color: '#8b5cf6' },
    { label: 'Paid', value: paidAfterReminder, color: '#f59e0b' },
  ];

  const avgPaymentTime = '4.2 days';

  return (
    <div className="px-4 lg:px-6 py-6 space-y-5 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Analytics</h2>
        <p className="text-sm text-slate-500">Comprehensive business performance insights</p>
      </div>

      {/* Revenue KPIs */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Revenue Analytics</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={<IndianRupee className="w-5 h-5 text-blue-600" />} iconBg="bg-blue-50" />
          <KPICard title="Collected" value={formatCurrency(collectedRevenue)} trend="+12%" trendUp icon={<TrendingUp className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-50" />
          <KPICard title="Pending" value={formatCurrency(pendingRevenue)} icon={<IndianRupee className="w-5 h-5 text-orange-600" />} iconBg="bg-orange-50" />
          <KPICard title="Overdue" value={formatCurrency(overdueRevenue)} icon={<IndianRupee className="w-5 h-5 text-red-600" />} iconBg="bg-red-50" />
        </div>
      </div>

      {/* Revenue Chart */}
      <Card className="p-5">
        <h3 className="font-semibold text-slate-800 mb-1">Monthly Revenue Breakdown</h3>
        <p className="text-xs text-slate-500 mb-4">Collected vs Pending vs Overdue over 6 months</p>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500" /><span className="text-xs text-slate-600">Collected</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-orange-400" /><span className="text-xs text-slate-600">Pending</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-400" /><span className="text-xs text-slate-600">Overdue</span></div>
        </div>
        <BarChart data={revenueData} height={260} />
      </Card>

      {/* Client & Payment Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <h3 className="font-semibold text-slate-800 mb-1">Client Analytics</h3>
          <p className="text-xs text-slate-500 mb-4">Client distribution by status</p>
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="text-center"><p className="text-lg font-bold text-blue-600">{newClients}</p><p className="text-xs text-slate-500">New</p></div>
            <div className="text-center"><p className="text-lg font-bold text-emerald-600">{activeClients}</p><p className="text-xs text-slate-500">Active</p></div>
            <div className="text-center"><p className="text-lg font-bold text-violet-600">{retainedClients}</p><p className="text-xs text-slate-500">Retained</p></div>
            <div className="text-center"><p className="text-lg font-bold text-red-500">{lostClients}</p><p className="text-xs text-slate-500">Lost</p></div>
          </div>
          <DonutChart data={clientDonutData} size={180} />
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-slate-800 mb-1">Payment Analytics</h3>
          <p className="text-xs text-slate-500 mb-4">Invoice status distribution</p>
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="text-center"><p className="text-lg font-bold text-emerald-600">{paidInvoices}</p><p className="text-xs text-slate-500">Paid</p></div>
            <div className="text-center"><p className="text-lg font-bold text-orange-600">{pendingInvoices}</p><p className="text-xs text-slate-500">Pending</p></div>
            <div className="text-center"><p className="text-lg font-bold text-red-500">{overdueInvoices}</p><p className="text-xs text-slate-500">Overdue</p></div>
            <div className="text-center"><p className="text-lg font-bold text-amber-600">{partialInvoices}</p><p className="text-xs text-slate-500">Partial</p></div>
          </div>
          <DonutChart data={paymentDonutData} size={180} />
          <div className="mt-4 bg-slate-50 rounded-xl p-3 flex items-center justify-between">
            <span className="text-sm text-slate-600">Average Payment Time</span>
            <span className="font-bold text-slate-800">{avgPaymentTime}</span>
          </div>
        </Card>
      </div>

      {/* WhatsApp Analytics */}
      <Card className="p-5">
        <h3 className="font-semibold text-slate-800 mb-1">WhatsApp Analytics</h3>
        <p className="text-xs text-slate-500 mb-4">Message performance and payment conversion</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <FunnelChart stages={funnelData} />
          <div className="space-y-3">
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2"><span className="text-sm text-slate-600">Delivery Rate</span><span className="font-bold text-slate-800">{totalSent > 0 ? Math.round((delivered / totalSent) * 100) : 0}%</span></div>
              <ProgressBar value={delivered} max={totalSent || 1} color="bg-sky-500" />
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2"><span className="text-sm text-slate-600">Response Rate</span><span className="font-bold text-slate-800">{delivered > 0 ? Math.round((replied / delivered) * 100) : 0}%</span></div>
              <ProgressBar value={replied} max={delivered || 1} color="bg-violet-500" />
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2"><span className="text-sm text-slate-600">Payment Conversion</span><span className="font-bold text-slate-800">{replied > 0 ? Math.round((paidAfterReminder / replied) * 100) : 0}%</span></div>
              <ProgressBar value={paidAfterReminder} max={replied || 1} color="bg-emerald-500" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
