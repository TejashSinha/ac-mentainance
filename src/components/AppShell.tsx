import { useState, type ReactNode } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import { ToastProvider } from '@/components/Toast';
import { DataProvider } from '@/context/DataContext';

const pages = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'clients', label: 'Clients', icon: 'Users' },
  { id: 'payments', label: 'Payments', icon: 'CreditCard' },
  { id: 'whatsapp', label: 'WhatsApp', icon: 'MessageCircle' },
  { id: 'followups', label: 'Follow-ups', icon: 'CalendarCheck' },
  { id: 'retention', label: 'Retention', icon: 'HeartHandshake' },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
  { id: 'reports', label: 'Reports', icon: 'FileText' },
  { id: 'settings', label: 'Settings', icon: 'Settings' },
];

type ShellProps = {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
  children: ReactNode;
};

export default function AppShell({ currentPage, setCurrentPage, selectedClientId, setSelectedClientId, children }: ShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <DataProvider>
      <ToastProvider>
        <div className="min-h-screen bg-slate-50 flex">
          <Sidebar
            currentPage={currentPage}
            setCurrentPage={(p) => { setCurrentPage(p); setSelectedClientId(null); setSidebarOpen(false); }}
            pages={pages}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          <div className="flex-1 flex flex-col min-w-0 lg:ml-72">
            <Topbar
              currentPage={currentPage}
              onMenuClick={() => setSidebarOpen(true)}
              onNavigate={setCurrentPage}
              pages={pages}
            />
            <main className="flex-1 overflow-x-hidden">
              {children}
            </main>
          </div>
        </div>
      </ToastProvider>
    </DataProvider>
  );
}


