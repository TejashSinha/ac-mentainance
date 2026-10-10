import { useState, useRef, useEffect } from 'react';
import { Menu, Search, Bell, ChevronDown } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { timeAgo } from '@/lib/utils';

type PageDef = { id: string; label: string; icon: string };

type TopbarProps = {
  currentPage: string;
  onMenuClick: () => void;
  onNavigate: (page: string) => void;
  pages: PageDef[];
};

export default function Topbar({ currentPage, onMenuClick, onNavigate, pages }: TopbarProps) {
  const { notifications, clients, markNotificationRead } = useData();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const pageTitle = pages.find((p) => p.id === currentPage)?.label || 'Dashboard';

  const searchResults = searchQuery.length > 1
    ? clients.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        (c.email || '').toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onMenuClick} className="lg:hidden text-slate-600 hover:text-slate-900">
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-900 truncate">{greeting}, Nimkiran</h2>
            <p className="text-xs text-slate-500 hidden sm:block">{today}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search */}
          <div className="relative" ref={searchRef}>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-sm text-slate-600"
            >
              <Search className="w-4 h-4" />
              <span className="hidden md:inline">Search clients...</span>
            </button>
            {showSearch && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl ring-1 ring-slate-200 z-50">
                <div className="p-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search name, company, phone..."
                      className="bg-transparent outline-none text-sm flex-1 text-slate-700"
                    />
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {searchResults.length === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-slate-400">No clients found</p>
                  ) : (
                    searchResults.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => { onNavigate('clients'); setSearchQuery(''); setShowSearch(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                          {c.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{c.name}</p>
                          <p className="text-xs text-slate-500 truncate">{c.company}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-slate-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifs && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl ring-1 ring-slate-200 z-50">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="font-semibold text-sm text-slate-800">Notifications</p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-slate-400">No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => { if (!n.read) markNotificationRead(n.id); }}
                        className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 ${!n.read ? 'bg-blue-50/30' : ''}`}
                      >
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-blue-500' : 'bg-slate-300'}`} />
                        <div className="min-w-0">
                          <p className="text-sm text-slate-700">{n.message}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{timeAgo(n.created_at)}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center text-white font-bold text-sm">
                N
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500 hidden sm:block" />
            </button>
            {showProfile && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl ring-1 ring-slate-200 z-50">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="font-semibold text-sm text-slate-800">Nimkiran</p>
                  <p className="text-xs text-slate-500">Admin · nimkiran@acservices.com</p>
                </div>
                <div className="py-1">
                  <button onClick={() => { onNavigate('settings'); setShowProfile(false); }} className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left">Profile Settings</button>
                  <button onClick={() => { onNavigate('settings'); setShowProfile(false); }} className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left">AI Agent Settings</button>
                  <button className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left">Logout</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
