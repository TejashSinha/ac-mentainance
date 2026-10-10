import { useState, useEffect } from 'react';
import { Building2, MessageCircle, CreditCard, Bot, Users, Save } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, Button, Input, Select, Textarea } from '@/components/ui';
import { useToast } from '@/components/Toast';
import type { AISettings } from '@/lib/supabase';

export default function SettingsPage() {
  const { aiSettings, updateAISettings } = useData();
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState('company');
  const [aiForm, setAIForm] = useState<AISettings | null>(null);
  const [companyForm, setCompanyForm] = useState({
    name: 'Nimkiran AC Services',
    phone: '+919876543200',
    email: 'contact@nimkiranac.com',
    address: 'MG Road, Bangalore, Karnataka 560001',
  });
  const [whatsappForm, setWhatsappForm] = useState({
    number: '+919876543200',
    apiProvider: 'WhatsApp Business API',
    template: 'Hi {{client_name}}, your payment of ₹{{amount}} is due on {{due_date}}. Complete payment here: {{payment_link}}.',
  });
  const [paymentForm, setPaymentForm] = useState({
    gateway: 'Razorpay',
    defaultTerms: '15 days',
    autoReminders: 'Enabled',
  });

  useEffect(() => {
    if (aiSettings) setAIForm(aiSettings);
  }, [aiSettings]);

  const handleAISave = async () => {
    if (!aiForm) return;
    await updateAISettings(aiForm);
    showToast('AI settings saved successfully');
  };

  const sections = [
    { id: 'company', label: 'Company', icon: Building2 },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'ai', label: 'AI Agent', icon: Bot },
    { id: 'users', label: 'User Management', icon: Users },
  ];

  return (
    <div className="px-4 lg:px-6 py-6 max-w-4xl mx-auto">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">Settings</h2>
        <p className="text-sm text-slate-500">Configure your dashboard, integrations, and AI agent</p>
      </div>

      {/* Section tabs */}
      <div className="flex items-center gap-1 mb-5 border-b border-slate-200 overflow-x-auto">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${activeSection === s.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <s.icon className="w-4 h-4" /> {s.label}
          </button>
        ))}
      </div>

      {activeSection === 'company' && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-slate-800">Company Settings</h3>
          <Input label="Company Name" value={companyForm.name} onChange={(v) => setCompanyForm({ ...companyForm, name: v })} />
          <Input label="Phone" value={companyForm.phone} onChange={(v) => setCompanyForm({ ...companyForm, phone: v })} />
          <Input label="Email" value={companyForm.email} onChange={(v) => setCompanyForm({ ...companyForm, email: v })} type="email" />
          <Textarea label="Address" value={companyForm.address} onChange={(v) => setCompanyForm({ ...companyForm, address: v })} rows={2} />
          <div className="flex justify-end pt-2"><Button variant="primary" onClick={() => showToast('Company settings saved')}><Save className="w-4 h-4" /> Save Changes</Button></div>
        </Card>
      )}

      {activeSection === 'whatsapp' && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-slate-800">WhatsApp Settings</h3>
          <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700">WhatsApp Business API integration is configured as a placeholder. Connect your provider credentials to enable live messaging.</div>
          <Input label="WhatsApp Number" value={whatsappForm.number} onChange={(v) => setWhatsappForm({ ...whatsappForm, number: v })} />
          <Select label="API Provider" value={whatsappForm.apiProvider} onChange={(v) => setWhatsappForm({ ...whatsappForm, apiProvider: v })} options={['WhatsApp Business API', 'Twilio', 'MessageBird', 'WATI']} />
          <Textarea label="Default Message Template" value={whatsappForm.template} onChange={(v) => setWhatsappForm({ ...whatsappForm, template: v })} rows={3} />
          <div className="flex justify-end pt-2"><Button variant="primary" onClick={() => showToast('WhatsApp settings saved')}><Save className="w-4 h-4" /> Save Changes</Button></div>
        </Card>
      )}

      {activeSection === 'payment' && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-slate-800">Payment Settings</h3>
          <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700">Payment gateway integration is configured as a placeholder. Connect your gateway credentials to enable live payment links.</div>
          <Select label="Payment Gateway" value={paymentForm.gateway} onChange={(v) => setPaymentForm({ ...paymentForm, gateway: v })} options={['Razorpay', 'Stripe', 'PayU', 'Cashfree']} />
          <Select label="Default Payment Terms" value={paymentForm.defaultTerms} onChange={(v) => setPaymentForm({ ...paymentForm, defaultTerms: v })} options={['7 days', '15 days', '30 days', '45 days', '60 days']} />
          <Select label="Automatic Reminders" value={paymentForm.autoReminders} onChange={(v) => setPaymentForm({ ...paymentForm, autoReminders: v })} options={['Enabled', 'Disabled']} />
          <div className="flex justify-end pt-2"><Button variant="primary" onClick={() => showToast('Payment settings saved')}><Save className="w-4 h-4" /> Save Changes</Button></div>
        </Card>
      )}

      {activeSection === 'ai' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div>
            <h3 className="font-semibold text-slate-800">AI WhatsApp Payment Assistant</h3>
          </div>
          <p className="text-sm text-slate-500">Configure the AI agent that sends payment reminders and communicates with clients via WhatsApp.</p>
          {aiForm && (
            <>
              <Input label="Agent Name" value={aiForm.agent_name} onChange={(v) => setAIForm({ ...aiForm, agent_name: v })} />
              <Select label="Tone" value={aiForm.tone} onChange={(v) => setAIForm({ ...aiForm, tone: v })} options={['Professional', 'Friendly', 'Concise']} />
              <Select label="Reminder Frequency" value={aiForm.reminder_frequency} onChange={(v) => setAIForm({ ...aiForm, reminder_frequency: v })} options={['Daily', 'Every 2 days', 'Every 3 days', 'Weekly', 'Custom']} />
              <Input label="Maximum Reminders" value={aiForm.max_reminders.toString()} onChange={(v) => setAIForm({ ...aiForm, max_reminders: parseInt(v) || 3 })} type="number" />
              <Select label="Stop Condition" value={aiForm.stop_condition} onChange={(v) => setAIForm({ ...aiForm, stop_condition: v })} options={['Payment received', 'Client requests human support', 'Account manager manually pauses']} />
              <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-blue-800">AI Agent Workflow</p>
                <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Payment becomes due</li>
                  <li>AI sends first reminder (3 days before)</li>
                  <li>AI sends second reminder (on due date)</li>
                  <li>AI sends third reminder (3 days after)</li>
                  <li>Escalates to human if still unpaid</li>
                  <li>Stops reminders when payment received</li>
                </ol>
              </div>
              <div className="flex justify-end pt-2"><Button variant="primary" onClick={handleAISave}><Save className="w-4 h-4" /> Save AI Settings</Button></div>
            </>
          )}
        </Card>
      )}

      {activeSection === 'users' && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-slate-800">User Management</h3>
          <div className="space-y-3">
            {[
              { name: 'Nimkiran', email: 'nimkiran@acservices.com', role: 'Admin' },
              { name: 'Ramesh', email: 'ramesh@acservices.com', role: 'Manager' },
              { name: 'Suresh', email: 'suresh@acservices.com', role: 'Staff' },
            ].map((u) => (
              <div key={u.email} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center text-white font-bold text-sm">{u.name.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{u.name}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${u.role === 'Admin' ? 'bg-violet-50 text-violet-700' : u.role === 'Manager' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{u.role}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-2"><Button variant="secondary" onClick={() => showToast('User management is a demo feature', 'info')}>Add User</Button></div>
        </Card>
      )}
    </div>
  );
}
