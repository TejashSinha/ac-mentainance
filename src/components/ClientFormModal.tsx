import { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { Modal, Input, Select, Textarea, Button } from '@/components/ui';
import { useToast } from '@/components/Toast';
import type { Client } from '@/lib/supabase';

export default function ClientFormModal({ isOpen, onClose, editClient }: {
  isOpen: boolean;
  onClose: () => void;
  editClient?: Client | null;
}) {
  const { addClient, updateClient } = useData();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '', company: '', phone: '', whatsapp_number: '', email: '', address: '',
    client_type: 'Commercial', status: 'Active', retention_status: 'Healthy',
    account_manager: 'Nimkiran', notes: '',
    service_type: 'AC Maintenance', ac_units: '1', maintenance_plan: 'Quarterly',
    contract_value: '50000',
    invoice_number: '', total_amount: '50000', paid_amount: '0',
    due_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
  });

  useEffect(() => {
    if (editClient) {
      setForm({
        name: editClient.name, company: editClient.company, phone: editClient.phone,
        whatsapp_number: editClient.whatsapp_number || '', email: editClient.email || '',
        address: editClient.address || '', client_type: editClient.client_type,
        status: editClient.status, retention_status: editClient.retention_status,
        account_manager: editClient.account_manager || 'Nimkiran', notes: editClient.notes || '',
        service_type: 'AC Maintenance', ac_units: '1', maintenance_plan: 'Quarterly',
        contract_value: '50000', invoice_number: '', total_amount: '50000', paid_amount: '0',
        due_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      });
    } else {
      setForm({
        name: '', company: '', phone: '', whatsapp_number: '', email: '', address: '',
        client_type: 'Commercial', status: 'Active', retention_status: 'Healthy',
        account_manager: 'Nimkiran', notes: '',
        service_type: 'AC Maintenance', ac_units: '1', maintenance_plan: 'Quarterly',
        contract_value: '50000', invoice_number: '', total_amount: '50000', paid_amount: '0',
        due_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      });
    }
  }, [editClient, isOpen]);

  const set = (key: string, val: string) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (!form.name || !form.company || !form.phone) {
      showToast('Please fill in name, company, and phone', 'error');
      return;
    }
    setSaving(true);
    try {
      const totalAmount = parseFloat(form.total_amount) || 0;
      const paidAmount = parseFloat(form.paid_amount) || 0;
      const outstanding = totalAmount - paidAmount;
      const status = outstanding <= 0 ? 'Paid' : paidAmount > 0 ? 'Partially Paid' : 'Pending';

      if (editClient) {
        await updateClient(editClient.id, {
          name: form.name, company: form.company, phone: form.phone,
          whatsapp_number: form.whatsapp_number || null, email: form.email || null,
          address: form.address || null, client_type: form.client_type,
          status: form.status, retention_status: form.retention_status,
          account_manager: form.account_manager, notes: form.notes || null,
        });
        showToast('Client updated successfully');
      } else {
        await addClient({
          name: form.name, company: form.company, phone: form.phone,
          whatsapp_number: form.whatsapp_number || null, email: form.email || null,
          address: form.address || null, client_type: form.client_type,
          status: form.status, retention_status: form.retention_status,
          account_manager: form.account_manager, notes: form.notes || null,
          service: {
            service_type: form.service_type, ac_units: parseInt(form.ac_units) || 1,
            maintenance_plan: form.maintenance_plan,
            contract_value: parseFloat(form.contract_value) || 0,
            contract_start: new Date().toISOString().split('T')[0],
            contract_end: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
            next_service_date: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
          },
          payment: form.invoice_number ? {
            invoice_number: form.invoice_number, total_amount: totalAmount,
            paid_amount: paidAmount, outstanding_amount: outstanding,
            due_date: form.due_date, status, payment_link: `https://pay.example.com/${form.invoice_number}`,
          } : undefined,
        });
        showToast('Client added successfully');
      }
      onClose();
    } catch {
      showToast('Unable to save client', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editClient ? 'Edit Client' : 'Add New Client'} size="xl">
      <div className="space-y-6">
        {/* Basic Information */}
        <div>
          <h4 className="text-sm font-semibold text-slate-800 mb-3">Basic Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Client Name" value={form.name} onChange={(v) => set('name', v)} placeholder="Rahul Sharma" required />
            <Input label="Company Name" value={form.company} onChange={(v) => set('company', v)} placeholder="ABC Co-Living" required />
            <Input label="Phone Number" value={form.phone} onChange={(v) => set('phone', v)} placeholder="+91XXXXXXXXXX" required />
            <Input label="WhatsApp Number" value={form.whatsapp_number} onChange={(v) => set('whatsapp_number', v)} placeholder="+91XXXXXXXXXX" />
            <Input label="Email" value={form.email} onChange={(v) => set('email', v)} placeholder="client@example.com" type="email" />
            <Input label="Address" value={form.address} onChange={(v) => set('address', v)} placeholder="MG Road, Bangalore" />
            <Select label="Client Type" value={form.client_type} onChange={(v) => set('client_type', v)} options={['Co-Living', 'Residential', 'Commercial', 'Office', 'Hotel']} />
            <Select label="Client Status" value={form.status} onChange={(v) => set('status', v)} options={['Active', 'New', 'Follow-up', 'Payment Pending', 'Payment Overdue', 'Lost / Inactive']} />
            <Select label="Retention Status" value={form.retention_status} onChange={(v) => set('retention_status', v)} options={['Healthy', 'At Risk', 'Lost']} />
            <Input label="Account Manager" value={form.account_manager} onChange={(v) => set('account_manager', v)} />
          </div>
        </div>

        {/* Service Information */}
        <div>
          <h4 className="text-sm font-semibold text-slate-800 mb-3">Service Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select label="Service Type" value={form.service_type} onChange={(v) => set('service_type', v)} options={['AC Installation', 'AC Maintenance', 'AMC Service']} />
            <Input label="Number of AC Units" value={form.ac_units} onChange={(v) => set('ac_units', v)} type="number" />
            <Select label="Maintenance Plan" value={form.maintenance_plan} onChange={(v) => set('maintenance_plan', v)} options={['Monthly', 'Quarterly', 'Half-Yearly', 'Annual']} />
            <Input label="Contract Value" value={form.contract_value} onChange={(v) => set('contract_value', v)} type="number" />
          </div>
        </div>

        {/* Payment Information - only for new clients */}
        {!editClient && (
          <div>
            <h4 className="text-sm font-semibold text-slate-800 mb-3">Payment Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Invoice Number" value={form.invoice_number} onChange={(v) => set('invoice_number', v)} placeholder="INV-XXXX" />
              <Input label="Total Amount" value={form.total_amount} onChange={(v) => set('total_amount', v)} type="number" />
              <Input label="Paid Amount" value={form.paid_amount} onChange={(v) => set('paid_amount', v)} type="number" />
              <Input label="Payment Due Date" value={form.due_date} onChange={(v) => set('due_date', v)} type="date" />
            </div>
          </div>
        )}

        {/* Notes */}
        <Textarea label="Notes" value={form.notes} onChange={(v) => set('notes', v)} placeholder="Additional notes about this client..." rows={2} />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : editClient ? 'Update Client' : 'Add Client'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
