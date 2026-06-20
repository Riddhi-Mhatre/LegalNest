import { Bell, ShieldCheck, Calendar, Gavel, Check } from 'lucide-react';

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const notifications = [
    {
      id: 1,
      type: 'auction',
      title: 'You were outbid!',
      message: 'Someone placed a higher bid on Luxury Villa in Beverly Hills.',
      time: '2 mins ago',
      read: false,
      icon: Gavel,
      color: 'text-destructive',
      bg: 'bg-destructive/10'
    },
    {
      id: 2,
      type: 'legal',
      title: 'Document Verified',
      message: 'Property Title for Sea View Apartment has been verified.',
      time: '1 hour ago',
      read: false,
      icon: ShieldCheck,
      color: 'text-secondary',
      bg: 'bg-secondary/10'
    },
    {
      id: 3,
      type: 'visit',
      title: 'Visit Confirmed',
      message: 'Your visit for Modern Loft is scheduled for tomorrow at 10 AM.',
      time: '3 hours ago',
      read: true,
      icon: Calendar,
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      id: 4,
      type: 'recommendation',
      title: 'New Property Match',
      message: 'A new property matching your saved preferences was just listed.',
      time: '1 day ago',
      read: true,
      icon: Bell,
      color: 'text-accent',
      bg: 'bg-accent/10'
    }
  ];

  return (
    <div className="flex flex-col h-[400px]">
      <div className="p-4 border-b border-dark-border flex items-center justify-between bg-dark-card sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-primary" />
          <h3 className="font-bold text-white uppercase tracking-wider text-sm">Notifications</h3>
        </div>
        <button className="text-xs text-primary hover:text-white transition-colors flex items-center gap-1">
          <Check size={14} /> Mark all read
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted p-6 text-center">
            <Bell size={32} className="mb-4 opacity-20" />
            <p>No new notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-dark-border">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-4 hover:bg-white/5 transition-colors cursor-pointer flex gap-4 ${!notif.read ? 'bg-primary/5' : ''}`}
                onClick={onClose}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.bg}`}>
                  <notif.icon size={18} className={notif.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm font-bold truncate ${!notif.read ? 'text-white' : 'text-gray-300'}`}>
                      {notif.title}
                    </h4>
                    {!notif.read && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0"></span>}
                  </div>
                  <p className="text-xs text-muted line-clamp-2 leading-relaxed mb-2">
                    {notif.message}
                  </p>
                  <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                    {notif.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-dark-border bg-black/50 text-center">
        <button onClick={onClose} className="text-xs font-bold text-muted hover:text-white transition-colors uppercase tracking-widest">
          View All Notifications
        </button>
      </div>
    </div>
  );
}
