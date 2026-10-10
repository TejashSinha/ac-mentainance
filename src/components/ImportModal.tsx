import { useState, useRef } from 'react';
import { Modal, Button } from '@/components/ui';
import { useData } from '@/context/DataContext';
import { useToast } from '@/components/Toast';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Download } from 'lucide-react';

type ParsedRow = {
  name: string;
  company: string;
  phone: string;
  email: string;
  amount: string;
  due_date: string;
  payment_status: string;
  payment_link: string;
  errors: string[];
};

export default function ImportModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { addClient } = useData();
  const { showToast } = useToast();
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const expectedColumns = ['Name', 'Company', 'Phone', 'Email', 'Amount', 'Due Date', 'Payment Status', 'Payment Link'];

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim());
      if (lines.length < 2) { showToast('File appears to be empty', 'error'); return; }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const rows: ParsedRow[] = lines.slice(1).map((line) => {
        const cols = line.split(',').map((c) => c.trim());
        const getCol = (name: string) => {
          const idx = headers.findIndex((h) => h.includes(name.toLowerCase()));
          return idx >= 0 ? cols[idx] || '' : '';
        };
        const name = getCol('name');
        const company = getCol('company');
        const phone = getCol('phone');
        const email = getCol('email');
        const amount = getCol('amount');
        const due_date = getCol('due');
        const payment_status = getCol('status') || 'Pending';
        const payment_link = getCol('link');
        const errors: string[] = [];
        if (!name) errors.push('Missing name');
        if (!phone) errors.push('Missing phone');
        if (phone && !phone.match(/^[+0-9]{10,15}$/)) errors.push('Invalid phone');
        if (!company) errors.push('Missing company');
        return { name, company, phone, email, amount, due_date, payment_status, payment_link, errors };
      });
      setParsedData(rows);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const validRows = parsedData.filter((r) => r.errors.length === 0);
    if (validRows.length === 0) { showToast('No valid rows to import', 'error'); return; }
    setImporting(true);
    try {
      for (const row of validRows) {
        const totalAmount = parseFloat(row.amount) || 0;
        await addClient({
          name: row.name, company: row.company, phone: row.phone,
          email: row.email || null, client_type: 'Commercial', status: 'Active',
          retention_status: 'Healthy', account_manager: 'Nimkiran',
          service: { service_type: 'AC Maintenance', ac_units: 1, maintenance_plan: 'Quarterly', contract_value: totalAmount },
          payment: totalAmount > 0 ? {
            invoice_number: 'IMP-' + Date.now().toString(36),
            total_amount: totalAmount, paid_amount: 0, outstanding_amount: totalAmount,
            due_date: row.due_date || null, status: row.payment_status || 'Pending',
            payment_link: row.payment_link || null,
          } : undefined,
        });
      }
      showToast(`Successfully imported ${validRows.length} clients`);
      setParsedData([]);
      onClose();
    } catch {
      showToast('Unable to import some clients', 'error');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csv = expectedColumns.join(',') + '\n' + 'Rahul Sharma,ABC Co-Living,+919876543210,rahul@abc.com,85000,2026-10-10,Pending,https://pay.example.com/123';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'client_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const validCount = parsedData.filter((r) => r.errors.length === 0).length;
  const errorCount = parsedData.filter((r) => r.errors.length > 0).length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Clients from CSV/Excel" size="xl">
      <div className="space-y-5">
        {/* Instructions */}
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-sm text-blue-800 mb-2">Upload a CSV file with the following columns:</p>
          <div className="flex flex-wrap gap-1.5">
            {expectedColumns.map((col) => (
              <span key={col} className="text-xs bg-white text-blue-600 px-2 py-1 rounded-md font-medium ring-1 ring-blue-200">{col}</span>
            ))}
          </div>
          <button onClick={downloadTemplate} className="mt-3 inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium">
            <Download className="w-3.5 h-3.5" /> Download CSV Template
          </button>
        </div>

        {/* Upload area */}
        {parsedData.length === 0 ? (
          <div
            className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <FileSpreadsheet className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700">Click to upload CSV file</p>
            <p className="text-xs text-slate-400 mt-1">Supports .csv files</p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-slate-700"><strong>{validCount}</strong> valid rows</span>
              </div>
              {errorCount > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-slate-700"><strong>{errorCount}</strong> rows with errors</span>
                </div>
              )}
            </div>

            {/* Preview table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs text-slate-500 font-medium">
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Company</th>
                    <th className="px-3 py-2">Phone</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Errors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {parsedData.map((row, i) => (
                    <tr key={i} className={row.errors.length > 0 ? 'bg-red-50/30' : ''}>
                      <td className="px-3 py-2">
                        {row.errors.length === 0
                          ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          : <AlertCircle className="w-4 h-4 text-red-500" />}
                      </td>
                      <td className="px-3 py-2 text-slate-800">{row.name || '—'}</td>
                      <td className="px-3 py-2 text-slate-600">{row.company || '—'}</td>
                      <td className="px-3 py-2 text-slate-600">{row.phone || '—'}</td>
                      <td className="px-3 py-2 text-slate-600">{row.amount || '—'}</td>
                      <td className="px-3 py-2">
                        {row.errors.length > 0 && (
                          <span className="text-xs text-red-600">{row.errors.join(', ')}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center">
              <Button variant="secondary" size="sm" onClick={() => setParsedData([])}>Re-upload</Button>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button variant="primary" onClick={handleImport} disabled={importing || validCount === 0}>
                  <Upload className="w-4 h-4" /> {importing ? 'Importing...' : `Import ${validCount} Clients`}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
