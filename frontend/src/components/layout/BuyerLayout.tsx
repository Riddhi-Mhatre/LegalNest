import { Outlet } from 'react-router-dom';
import { BuyerSidebar } from './BuyerSidebar';
import { Bell, Search, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useState } from 'react';
import { NotificationPanel } from '../common/NotificationPanel';

export function BuyerLayout() {
  const { user } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black flex overflow-hidden">
      <BuyerSidebar />
      
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen relative">
        {/* Top Navbar */}
        <header className="h-20 border-b border-dark-border bg-black/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="p-2 -ml-2 text-white lg:hidden rounded-full hover:bg-white/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center gap-2 bg-dark-card border border-dark-border rounded-full px-4 py-2 w-64 focus-within:border-primary/50 focus-within:shadow-gold transition-all duration-300">
              <Search size={18} className="text-muted" />
              <input 
                type="text" 
                placeholder="Search properties, auctions..." 
                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-muted"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors relative group"
              >
                <Bell size={24} className="text-white group-hover:text-primary transition-colors" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-black"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 top-full mt-4 w-80 md:w-96 bg-dark-card border border-dark-border shadow-2xl rounded-xl overflow-hidden z-50 animate-fade-in">
                  <NotificationPanel onClose={() => setShowNotifications(false)} />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent p-[2px]">
                <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">{user?.name?.charAt(0) || 'B'}</span>
                </div>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-bold text-white">{user?.name || 'Buyer'}</p>
                <p className="text-xs text-primary font-medium tracking-widest uppercase">Verified</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-black p-4 md:p-8 custom-scrollbar relative">
           {/* Decorative elements */}
           <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[100px] rounded-full pointer-events-none" />
           <div className="relative z-10 max-w-[1400px] mx-auto">
              <Outlet />
           </div>
        </main>
      </div>
    </div>
  );
}
