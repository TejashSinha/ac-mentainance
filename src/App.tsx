import { useState } from 'react';
import AppShell from '@/components/AppShell';
import DashboardPage from '@/pages/DashboardPage';
import ClientsPage from '@/pages/ClientsPage';
import ClientProfilePage from '@/pages/ClientProfilePage';
import PaymentsPage from '@/pages/PaymentsPage';
import WhatsAppPage from '@/pages/WhatsAppPage';
import FollowupsPage from '@/pages/FollowupsPage';
import RetentionPage from '@/pages/RetentionPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import ReportsPage from '@/pages/ReportsPage';
import SettingsPage from '@/pages/SettingsPage';
import ClientFormModal from '@/components/ClientFormModal';
import ImportModal from '@/components/ImportModal';
import { useData } from '@/context/DataContext';
import type { Client } from '@/lib/supabase';

function AppContent({ currentPage, setCurrentPage, selectedClientId, setSelectedClientId }: {
  currentPage: string;
  setCurrentPage: (p: string) => void;
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
}) {
  const { clients } = useData();
  const [showAddClient, setShowAddClient] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [showImport, setShowImport] = useState(false);

  const handleEditClient = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setEditClient(client);
      setShowAddClient(true);
    }
  };

  const handleViewClient = (clientId: string) => {
    setSelectedClientId(clientId);
  };

  const handleCloseModal = () => {
    setShowAddClient(false);
    setEditClient(null);
  };

  let pageContent: React.ReactNode;
  if (currentPage === 'clients' && selectedClientId) {
    pageContent = (
      <ClientProfilePage
        clientId={selectedClientId}
        onBack={() => setSelectedClientId(null)}
        onEditClient={handleEditClient}
      />
    );
  } else {
    switch (currentPage) {
      case 'dashboard':
        pageContent = <DashboardPage onNavigate={setCurrentPage} onAddClient={() => setShowAddClient(true)} onImportClients={() => setShowImport(true)} />;
        break;
      case 'clients':
        pageContent = <ClientsPage onAddClient={() => setShowAddClient(true)} onEditClient={handleEditClient} onImportClients={() => setShowImport(true)} onViewClient={handleViewClient} />;
        break;
      case 'payments':
        pageContent = <PaymentsPage />;
        break;
      case 'whatsapp':
        pageContent = <WhatsAppPage />;
        break;
      case 'followups':
        pageContent = <FollowupsPage />;
        break;
      case 'retention':
        pageContent = <RetentionPage />;
        break;
      case 'analytics':
        pageContent = <AnalyticsPage />;
        break;
      case 'reports':
        pageContent = <ReportsPage />;
        break;
      case 'settings':
        pageContent = <SettingsPage />;
        break;
      default:
        pageContent = <DashboardPage onNavigate={setCurrentPage} onAddClient={() => setShowAddClient(true)} onImportClients={() => setShowImport(true)} />;
    }
  }

  return (
    <>
      {pageContent}
      <ClientFormModal isOpen={showAddClient} onClose={handleCloseModal} editClient={editClient} />
      <ImportModal isOpen={showImport} onClose={() => setShowImport(false)} />
    </>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  return (
    <AppShell
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      selectedClientId={selectedClientId}
      setSelectedClientId={setSelectedClientId}
    >
      <AppContent
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        selectedClientId={selectedClientId}
        setSelectedClientId={setSelectedClientId}
      />
    </AppShell>
  );
}

export default App;
