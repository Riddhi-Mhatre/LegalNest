import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  Gavel, 
  Wallet, 
  Heart, 
  Calendar, 
  FileText, 
  Home, 
  Crown, 
  Settings,
  LogOut
} from 'lucide-react';
import { ROUTES } from '../../utils/constants';
import { useAuthStore } from '../../store/authStore';

export function BuyerSidebar() {
  const { logout } = useAuthStore();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: ROUTES.BUYER_DASHBOARD },
    { icon: Search, label: 'Browse Properties', path: ROUTES.PROPERTIES },
    { icon: Gavel, label: 'Live Auctions', path: ROUTES.BUYER_AUCTIONS },
    { icon: Wallet, label: 'My Bids', path: ROUTES.BUYER_BIDS },
    { icon: Heart, label: 'Saved Properties', path: ROUTES.BUYER_SAVED },
    { icon: Calendar, label: 'Visits', path: ROUTES.BUYER_VISITS },
    { icon: FileText, label: 'Legal Documents', path: ROUTES.BUYER_LEGAL },
    { icon: Home, label: 'Purchased Properties', path: ROUTES.BUYER_PURCHASES },
    { icon: Crown, label: 'Membership', path: ROUTES.BUYER_MEMBERSHIP },
  ];

  const bottomItems = [
    { icon: Settings, label: 'Settings', path: ROUTES.BUYER_PROFILE },
  ];

  return (
    <aside className="w-64 h-full bg-dark-card border-r border-dark-border flex flex-col pt-6 hidden lg:flex relative z-10 font-sans">
      <div className="px-6 mb-8 flex items-center justify-center">
        <h2 className="text-xl font-display font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">GharBid</h2>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-4 space-y-1 custom-scrollbar">
        <p className="px-4 text-xs font-bold text-muted uppercase tracking-widest mb-4 mt-2">Menu</p>
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 group relative overflow-hidden ${
                isActive
                  ? 'text-primary bg-primary/10 font-medium'
                  : 'text-muted hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={`z-10 transition-colors ${isActive ? 'text-primary' : 'group-hover:text-primary'}`} />
                <span className="z-10">{item.label}</span>
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full shadow-gold" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-dark-border mt-auto">
        {bottomItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 group ${
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted hover:text-white hover:bg-white/5'
              }`
            }
          >
            <item.icon size={20} className="group-hover:text-primary transition-colors" />
            <span>{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-muted hover:text-destructive hover:bg-destructive/10 transition-all duration-300 group mt-2"
        >
          <LogOut size={20} className="group-hover:text-destructive transition-colors" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
