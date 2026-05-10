import { Bell, Info, Zap, MessageSquare, ShieldCheck } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'match': return <Zap size={16} className="text-indigo-400" />;
      case 'nda': return <ShieldCheck size={16} className="text-emerald-400" />;
      case 'invite': return <MessageSquare size={16} className="text-cyan-400" />;
      default: return <Info size={16} className="text-slate-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all hover:border-slate-700"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-slate-900 animate-in zoom-in">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
            <h3 className="text-sm font-bold text-white">Notificações</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-wider"
              >
                Limpar tudo
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Bell size={32} className="mx-auto text-slate-700 opacity-20" />
                <p className="text-xs text-slate-500">Nenhuma notificação por enquanto.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    markAsRead(n.id);
                    if (n.link) navigate(n.link);
                    setIsOpen(false);
                  }}
                  className={`w-full p-4 text-left border-b border-slate-800/50 hover:bg-slate-800/40 transition flex gap-3 ${!n.read ? 'bg-indigo-500/5' : ''}`}
                >
                  <div className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${!n.read ? 'bg-indigo-500/20' : 'bg-slate-800'}`}>
                    {getIcon(n.type)}
                  </div>
                  <div className="space-y-1">
                    <p className={`text-sm font-bold ${!n.read ? 'text-white' : 'text-slate-300'}`}>{n.title}</p>
                    <p className="text-xs text-slate-500 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-slate-600">
                      {n.createdAt?.toDate ? n.createdAt.toDate().toLocaleDateString() : 'Agora'}
                    </p>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
