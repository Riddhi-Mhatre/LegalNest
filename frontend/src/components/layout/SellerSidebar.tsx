import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Building2, 
  Gavel, 
  CreditCard, 
  FileText, 
  ShieldCheck,
  LogOut,
  MessageSquare,
  CheckCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { useQuery } from '@tanstack/react-query';
import { getSellerInquiries } from '../../services/inquiryService';

interface SellerSidebarProps {
  isOpen: boolean;
}

export function SellerSidebar({ isOpen }: SellerSidebarProps) {
  const { logout } = useAuthStore();
  const hasUnreadAlerts = useChatStore((state) => state.hasUnreadAlerts);

  // Fetch inquiries globally to always show dot if there are pending inquiries
  const { data: inquiries = [] } = useQuery({
    queryKey: ['inquiries', 'seller'],
    queryFn: getSellerInquiries,
  });
  const pendingInquiriesCount = inquiries.filter((i: any) => i.status === 'pending').length;
  const unreadCounts = useChatStore((state) => state.unreadCounts);
  const totalUnreadMessages = Object.values(unreadCounts).reduce((a, b) => a + b, 0);
  
  const totalAlerts = pendingInquiriesCount + totalUnreadMessages;
  const showDot = hasUnreadAlerts && totalAlerts === 0;

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/seller' },
    { icon: PlusCircle, label: 'Add Property', path: '/seller/add-property' },
    { icon: Building2, label: 'My Properties', path: '/seller/my-properties' },
    { icon: CheckCircle, label: 'Sold Properties', path: '/seller/sold-properties' },
    { icon: MessageSquare, label: 'Inquiries', path: '/seller/chat' },
    { icon: Gavel, label: 'Live Auctions', path: '/seller/auctions' },
    { icon: CreditCard, label: 'Payments', path: '/seller/payments' },
  ];

  const bottomItems = [
    { icon: ShieldCheck, label: 'Identity Verification', path: '/seller/identity-documents' },
  ];

  return (
    <aside className={`h-full bg-dark-card border-r border-dark-border flex flex-col pt-6 hidden lg:flex relative z-10 font-sans transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="px-6 mb-8 flex items-center justify-center">
        {isOpen ? (
          <h2 className="text-xl font-display font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary animate-fade-in">GharBid</h2>
        ) : (
          <h2 className="text-xl font-display font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary animate-fade-in">GB</h2>
        )}
      </div>

      <nav className={`flex-1 overflow-y-auto overflow-x-hidden space-y-1 custom-scrollbar ${isOpen ? 'px-4' : 'px-2'}`}>
        {isOpen && <p className="px-4 text-xs font-bold text-muted uppercase tracking-widest mb-4 mt-2 whitespace-nowrap">Menu</p>}
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            end={item.path === '/seller'}
            title={!isOpen ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center ${isOpen ? 'px-4 gap-4' : 'justify-center'} py-3 rounded-lg transition-all duration-300 group relative overflow-hidden ${
                isActive
                  ? 'text-primary bg-primary/10 font-medium'
                  : 'text-muted hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={`z-10 shrink-0 transition-colors ${isActive ? 'text-primary' : 'group-hover:text-primary'}`} />
                <span className={`z-10 whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 overflow-hidden hidden'}`}>
                  {item.label}
                  {item.label === 'Inquiries' && totalAlerts > 0 && (
                    <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                      {totalAlerts}
                    </span>
                  )}
                  {item.label === 'Inquiries' && showDot && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                  )}
                </span>
                {item.label === 'Inquiries' && !isOpen && totalAlerts > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                    {totalAlerts}
                  </span>
                )}
                {item.label === 'Inquiries' && !isOpen && showDot && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full shadow-gold" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className={`p-4 border-t border-dark-border mt-auto ${!isOpen ? 'px-2' : ''}`}>
        {bottomItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            title={!isOpen ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center ${isOpen ? 'gap-4 px-4' : 'justify-center'} py-3 rounded-lg transition-all duration-300 group ${
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted hover:text-white hover:bg-white/5'
              }`
            }
          >
            <item.icon size={20} className="shrink-0 group-hover:text-primary transition-colors" />
            <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 overflow-hidden hidden'}`}>
              {item.label}
            </span>
          </NavLink>
        ))}
        <button
          onClick={() => logout()}
          title={!isOpen ? 'Logout' : undefined}
          className={`w-full flex items-center ${isOpen ? 'gap-4 px-4' : 'justify-center'} py-3 rounded-lg text-muted hover:text-destructive hover:bg-destructive/10 transition-all duration-300 group mt-2`}
        >
          <LogOut size={20} className="shrink-0 group-hover:text-destructive transition-colors" />
          <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 overflow-hidden hidden'}`}>
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}
