export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '₹0';
  const value = Math.round(amount);
  if (value >= 10000000) {
    return '₹' + (value / 10000000).toFixed(2) + ' Cr';
  }
  if (value >= 100000) {
    return '₹' + (value / 100000).toFixed(2) + ' L';
  }
  return '₹' + value.toLocaleString('en-IN');
}

export function formatCurrencyFull(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '₹0';
  return '₹' + Math.round(amount).toLocaleString('en-IN');
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' +
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export function daysOverdue(dueDate: string | null | undefined): number {
  if (!dueDate) return 0;
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diff = today.getTime() - due.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function timeAgo(date: string | null | undefined): string {
  if (!date) return '—';
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return hours + 'h ago';
  const days = Math.floor(hours / 24);
  if (days < 30) return days + 'd ago';
  const months = Math.floor(days / 30);
  return months + 'mo ago';
}

export function getPaymentStatusColor(status: string): { bg: string; text: string; dot: string } {
  switch (status) {
    case 'Paid':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' };
    case 'Partially Paid':
      return { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' };
    case 'Pending':
      return { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' };
    case 'Overdue':
      return { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' };
  }
}

export function getRetentionColor(status: string): { bg: string; text: string; dot: string } {
  switch (status) {
    case 'Healthy':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' };
    case 'At Risk':
      return { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' };
    case 'Lost':
      return { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' };
  }
}

export function getClientStatusColor(status: string): { bg: string; text: string } {
  switch (status) {
    case 'Active':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700' };
    case 'New':
      return { bg: 'bg-blue-50', text: 'text-blue-700' };
    case 'Follow-up':
      return { bg: 'bg-sky-50', text: 'text-sky-700' };
    case 'Payment Pending':
      return { bg: 'bg-orange-50', text: 'text-orange-700' };
    case 'Payment Overdue':
      return { bg: 'bg-red-50', text: 'text-red-700' };
    case 'Lost / Inactive':
      return { bg: 'bg-gray-100', text: 'text-gray-600' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700' };
  }
}

export function getCommStatusColor(status: string): { bg: string; text: string } {
  switch (status) {
    case 'Sent':
      return { bg: 'bg-blue-50', text: 'text-blue-700' };
    case 'Delivered':
      return { bg: 'bg-sky-50', text: 'text-sky-700' };
    case 'Read':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700' };
    case 'Replied':
      return { bg: 'bg-violet-50', text: 'text-violet-700' };
    case 'Failed':
      return { bg: 'bg-red-50', text: 'text-red-700' };
    case 'Scheduled':
      return { bg: 'bg-gray-100', text: 'text-gray-600' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700' };
  }
}

export function buildWhatsAppLink(phone: string | null | undefined, message?: string): string {
  let cleaned = (phone || '').replace(/[^0-9]/g, '');
  if (cleaned.length === 10) cleaned = '91' + cleaned;
  if (!cleaned) return '#';
  let link = `https://wa.me/${cleaned}`;
  if (message) link += `?text=${encodeURIComponent(message)}`;
  return link;
}

export function buildReminderMessage(name: string, amount: number, dueDate: string | null, paymentLink?: string | null): string {
  const due = dueDate ? formatDate(dueDate) : 'soon';
  let msg = `Hi ${name}, this is a reminder regarding your pending AC maintenance payment of ₹${amount.toLocaleString('en-IN')} due on ${due}.`;
  if (paymentLink) msg += ` Please use the payment link below to complete the payment:\n${paymentLink}`;
  msg += `\n\nThank you,\nNimkiran AC Services`;
  return msg;
}
