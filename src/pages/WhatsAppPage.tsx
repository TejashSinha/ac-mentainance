import { useState, useMemo } from 'react';
import { MessageCircle, Send, Bot, User, Zap, AlertCircle } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, Badge, Button, EmptyState } from '@/components/ui';
import { useToast } from '@/components/Toast';
import { formatCurrencyFull, getPaymentStatusColor, getCommStatusColor, buildWhatsAppLink, formatDateTime } from '@/lib/utils';

export default function WhatsAppPage() {
  const { clients, payments, communications, sendReminder, aiSettings } = useData();
  const { showToast } = useToast();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const clientsWithComms = useMemo(() => {
    return clients.map((c) => {
      const comms = communications.filter((comm) => comm.client_id === c.id);
      const payment = payments.find((p) => p.client_id === c.id);
      const lastComm = comms[0];
      return { ...c, comms, payment, lastComm, commCount: comms.length };
    }).filter((c) => c.commCount > 0 || c.payment?.status !== 'Paid');
  }, [clients, communications, payments]);

  const selectedClient = clientsWithComms.find((c) => c.id === selectedClientId);
  const selectedComms = selectedClient ? communications.filter((c) => c.client_id === selectedClientId) : [];

  const handleSendReminder = async () => {
    if (!selectedClient?.payment) return;
    await sendReminder(selectedClient.payment, selectedClient);
    showToast(`Reminder sent to ${selectedClient.name}`);
  };

  return (
    <div className="px-4 lg:px-6 py-6 max-w-7xl mx-auto">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">WhatsApp Communication Center</h2>
        <p className="text-sm text-slate-500">AI-powered payment reminders and client conversations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 h-[calc(100vh-200px)]">
        {/* Client List */}
        <Card className="overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="font-semibold text-sm text-slate-800">Conversations</h3>
          </div>
          <div className="overflow-y-auto flex-1">
            {clientsWithComms.length === 0 ? (
              <EmptyState icon={<MessageCircle className="w-7 h-7" />} title="No conversations" subtitle="WhatsApp communication history will appear here." />
            ) : (
              clientsWithComms.map((c) => {
                const payColors = c.payment ? getPaymentStatusColor(c.payment.status) : null;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedClientId(c.id)}
                    className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 ${selectedClientId === c.id ? 'bg-blue-50/50' : ''}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                      {c.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-slate-800 truncate">{c.name}</p>
                        {c.lastComm && <span className="text-[10px] text-slate-400 flex-shrink-0">{formatDateTime(c.lastComm.sent_at).split(',')[0]}</span>}
                      </div>
                      <p className="text-xs text-slate-500 truncate">{c.company}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {payColors && c.payment && <Badge bg={payColors.bg} text={payColors.text} dot={payColors.dot}>{c.payment.status}</Badge>}
                        {c.payment && <span className="text-xs text-slate-500">{formatCurrencyFull(c.payment.outstanding_amount)}</span>}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Card>

        {/* Conversation */}
        <Card className="lg:col-span-2 overflow-hidden flex flex-col">
          {!selectedClient ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState icon={<MessageCircle className="w-7 h-7" />} title="Select a conversation" subtitle="Choose a client from the list to view their WhatsApp communication history." />
            </div>
          ) : (
            <>
              {/* Conversation Header */}
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                    {selectedClient.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-800">{selectedClient.name}</p>
                    <p className="text-xs text-slate-500">{selectedClient.company} · {selectedClient.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedClient.payment && selectedClient.payment.status !== 'Paid' && (
                    <Button variant="primary" size="sm" onClick={handleSendReminder}>
                      <Send className="w-3.5 h-3.5" /> Send AI Reminder
                    </Button>
                  )}
                  <a href={buildWhatsAppLink(selectedClient.whatsapp_number || selectedClient.phone)} target="_blank" rel="noopener noreferrer">
                    <Button variant="success" size="sm"><MessageCircle className="w-3.5 h-3.5" /> Open WhatsApp</Button>
                  </a>
                </div>
              </div>

              {/* AI Agent Banner */}
              <div className="px-5 py-2.5 bg-gradient-to-r from-blue-50 to-violet-50 border-b border-slate-100 flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-slate-700">{aiSettings?.agent_name || 'Nimkiran Payment Assistant'}</span>
                <Badge bg="bg-emerald-50" text="text-emerald-700" dot="bg-emerald-500">Active</Badge>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-slate-50/30">
                {selectedComms.length === 0 ? (
                  <EmptyState icon={<MessageCircle className="w-7 h-7" />} title="No messages yet" subtitle="Send a reminder to start the conversation." />
                ) : (
                  selectedComms.reverse().map((comm) => {
                    const commColors = getCommStatusColor(comm.status);
                    return (
                      <div key={comm.id} className={`flex gap-3 ${comm.direction === 'inbound' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${comm.direction === 'inbound' ? 'bg-emerald-100 text-emerald-600' : 'bg-gradient-to-br from-blue-500 to-violet-500 text-white'}`}>
                          {comm.direction === 'inbound' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className={`max-w-[70%] rounded-xl px-4 py-3 ${comm.direction === 'inbound' ? 'bg-white text-slate-700 ring-1 ring-slate-200' : 'bg-blue-600 text-white'}`}>
                          <p className="text-sm whitespace-pre-wrap">{comm.message}</p>
                          <div className={`flex items-center gap-2 mt-1.5 ${comm.direction === 'inbound' ? 'text-slate-400' : 'text-blue-200'}`}>
                            <span className="text-[10px]">{formatDateTime(comm.sent_at)}</span>
                            <Badge bg={commColors.bg} text={commColors.text}>{comm.status}</Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* AI Workflow Info */}
              <div className="px-5 py-3 border-t border-slate-100 bg-white">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>AI Agent automatically sends reminders based on configured rules. Max {aiSettings?.max_reminders || 3} reminders before human escalation.</span>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
