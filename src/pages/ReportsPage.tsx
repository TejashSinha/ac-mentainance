import { useState } from 'react';
import { FileText, Download, FileSpreadsheet, BarChart3 } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, Button } from '@/components/ui';
import { useToast } from '@/components/Toast';
import { formatCurrencyFull, formatDate } from '@/lib/utils';

const reportTypes = [
  { id: 'monthly', label: 'Monthly Payment Report', desc: 'Summary of all payments collected and pending this month', icon: BarChart3 },
  { id: 'outstanding', label: 'Outstanding Payment Report', desc: 'All pending and overdue payments with client details', icon: FileText },
  { id: 'client', label: 'Client Report', desc: 'Complete client listing with service and payment status', icon: FileText },
  { id: 'whatsapp', label: 'WhatsApp Activity Report', desc: 'Communication history and reminder performance', icon: FileText },
  { id: 'retention', label: 'Retention Report', desc: 'Client retention metrics and at-risk clients', icon: FileText },
  { id: 'revenue', label: 'Revenue Report', desc: 'Revenue breakdown by month and client type', icon: BarChart3 },
];

export default function ReportsPage() {
  const { clients, payments, communications } = useData();
  const { showToast } = useToast();
  const [generating, setGenerating] = useState<string | null>(null);

  const exportCSV = (reportId: string) => {
    setGenerating(reportId);
    try {
      let csv = '';
      let filename = '';

      switch (reportId) {
        case 'monthly': {
          csv = 'Invoice,Client,Company,Amount,Paid,Outstanding,Due Date,Status\n';
          filename = 'monthly_payment_report.csv';
          payments.forEach((p) => {
            const c = clients.find((cl) => cl.id === p.client_id);
            csv += `${p.invoice_number},${c?.name || ''},${c?.company || ''},${p.total_amount},${p.paid_amount},${p.outstanding_amount},${formatDate(p.due_date)},${p.status}\n`;
          });
          break;
        }
        case 'outstanding': {
          csv = 'Client,Company,Invoice,Amount,Outstanding,Due Date,Days Overdue,Reminders,Status\n';
          filename = 'outstanding_payment_report.csv';
          payments.filter((p) => p.status !== 'Paid').forEach((p) => {
            const c = clients.find((cl) => cl.id === p.client_id);
            const days = p.due_date ? Math.max(0, Math.floor((Date.now() - new Date(p.due_date).getTime()) / 86400000)) : 0;
            csv += `${c?.name || ''},${c?.company || ''},${p.invoice_number},${p.total_amount},${p.outstanding_amount},${formatDate(p.due_date)},${days},${p.reminder_count},${p.status}\n`;
          });
          break;
        }
        case 'client': {
          csv = 'Name,Company,Phone,Email,Type,Status,Retention,Account Manager,Onboarded\n';
          filename = 'client_report.csv';
          clients.forEach((c) => {
            csv += `${c.name},${c.company},${c.phone},${c.email || ''},${c.client_type},${c.status},${c.retention_status},${c.account_manager || ''},${formatDate(c.date_onboarded)}\n`;
          });
          break;
        }
        case 'whatsapp': {
          csv = 'Client,Company,Channel,Direction,Status,Message,Sent At\n';
          filename = 'whatsapp_activity_report.csv';
          communications.forEach((comm) => {
            const c = clients.find((cl) => cl.id === comm.client_id);
            csv += `${c?.name || ''},${c?.company || ''},${comm.channel},${comm.direction},${comm.status},"${(comm.message || '').replace(/"/g, '""')}",${formatDate(comm.sent_at)}\n`;
          });
          break;
        }
        case 'retention': {
          csv = 'Name,Company,Type,Retention Status,Contract Value,Account Manager\n';
          filename = 'retention_report.csv';
          clients.forEach((c) => {
            csv += `${c.name},${c.company},${c.client_type},${c.retention_status},,\n`;
          });
          break;
        }
        case 'revenue': {
          csv = 'Month,Collected,Pending,Overdue\n';
          filename = 'revenue_report.csv';
          for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const inMonth = payments.filter((p) => p.payment_date && new Date(p.payment_date).getMonth() === date.getMonth());
            const collected = inMonth.reduce((s, p) => s + (p.paid_amount || 0), 0);
            const pending = payments.filter((p) => p.due_date && new Date(p.due_date).getMonth() === date.getMonth() && p.status !== 'Paid').reduce((s, p) => s + (p.outstanding_amount || 0), 0);
            const overdue = payments.filter((p) => p.due_date && new Date(p.due_date).getMonth() === date.getMonth() && p.status === 'Overdue').reduce((s, p) => s + (p.outstanding_amount || 0), 0);
            csv += `${date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })},${collected},${pending},${overdue}\n`;
          }
          break;
        }
      }

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Report exported as CSV');
    } catch {
      showToast('Unable to generate report', 'error');
    } finally {
      setGenerating(null);
    }
  };

  const exportPDF = (reportId: string) => {
    showToast('PDF export requires a print server. CSV export is available.', 'info');
  };

  return (
    <div className="px-4 lg:px-6 py-6 space-y-5 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Reports</h2>
        <p className="text-sm text-slate-500">Generate and export business reports</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reportTypes.map((report) => (
          <Card key={report.id} className="p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                <report.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-800 text-sm">{report.label}</h3>
                <p className="text-xs text-slate-500 mt-1 mb-3">{report.desc}</p>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => exportCSV(report.id)} disabled={generating === report.id}>
                    <FileSpreadsheet className="w-3.5 h-3.5" /> {generating === report.id ? 'Exporting...' : 'Export CSV'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => exportPDF(report.id)}>
                    <Download className="w-3.5 h-3.5" /> Export PDF
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
