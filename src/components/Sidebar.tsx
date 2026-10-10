import {
  X, Snowflake, LogOut, LayoutDashboard, Users, CreditCard,
  MessageCircle, CalendarCheck, HeartHandshake, BarChart3,
  FileText, Settings, ChevronRight,
  type LucideIcon,
} from 'lucide-react';

type PageDef = { id: string; label: string; icon: string };

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard, Users, CreditCard, MessageCircle, CalendarCheck,
  HeartHandshake, BarChart3, FileText, Settings,
};

type SidebarProps = {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  pages: PageDef[];
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({ currentPage, setCurrentPage, pages, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-slate-900 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Snowflake className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-sm tracking-tight">Nimkiran AC</h1>
              <p className="text-slate-400 text-xs">Management System</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {pages.map((page) => {
            const isActive = currentPage === page.id;
            const Icon = iconMap[page.icon];
            return (
              <button
                key={page.id}
                onClick={() => setCurrentPage(page.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }
                `}
              >
                {Icon && <Icon className="w-4.5 h-4.5 flex-shrink-0" />}
                <span className="flex-1 text-left">{page.label}</span>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-2">
          <div className="bg-slate-800/50 rounded-lg px-3 py-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-400 font-medium">Demo Data Active</span>
          </div>
        </div>

        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center text-white font-bold text-sm">
              N
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">Nimkiran</p>
              <p className="text-slate-400 text-xs">Admin</p>
            </div>
            <button className="text-slate-400 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
