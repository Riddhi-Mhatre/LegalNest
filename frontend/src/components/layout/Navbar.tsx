import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../utils/constants';
import { Bell, Home, LogOut, User, Gavel, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  if (location.pathname.startsWith('/buyer')) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-dark-border bg-dark-card/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Back Arrow & Logo */}
          <div className="flex items-center gap-3">
            {location.pathname !== '/' && (
              <button 
                onClick={() => navigate(-1)} 
                className="p-1.5 rounded-full hover:bg-white/10 text-muted hover:text-white transition-all flex items-center justify-center"
                aria-label="Go Back"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <Link to={ROUTES.HOME} className="flex items-center gap-2 group" id="nav-logo">
              <span className="text-xl font-display font-bold text-gradient-gold group-hover:opacity-90 transition-opacity animate-brand-intro inline-block origin-left">
                GharBid
              </span>
              <span className="text-xs text-muted hidden sm:block">Trusted Real Estate</span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link to={ROUTES.PROPERTIES} className="px-4 py-2 text-sm font-medium text-white/80 rounded-lg hover:-translate-y-1 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-secondary hover:from-10% hover:to-primary hover:to-40% active:scale-95 transition-all duration-300" id="nav-properties">Properties</Link>
            <Link to="/auctions" className="px-4 py-2 text-sm font-medium text-white/80 rounded-lg hover:-translate-y-1 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-secondary hover:from-10% hover:to-primary hover:to-40% active:scale-95 transition-all duration-300" id="nav-auctions">Live Auctions</Link>
            <Link to={ROUTES.MEMBERSHIP} className="px-4 py-2 text-sm font-medium text-white/80 rounded-lg hover:-translate-y-1 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-secondary hover:from-10% hover:to-primary hover:to-40% active:scale-95 transition-all duration-300" id="nav-membership">Membership</Link>
          </div>

          {/* Auth Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <>
                <Link to={ROUTES.CHAT} className="btn-ghost p-2" id="nav-chat" aria-label="Chat">
                  <Bell size={18} />
                </Link>
                <div className="relative">
                  <button
                    id="nav-user-menu"
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 btn-ghost px-3"
                    aria-expanded={menuOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center">
                      <User size={14} className="text-primary" />
                    </div>
                    <span className="text-sm hidden sm:block">{user.name.split(' ')[0]}</span>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 top-12 w-48 bg-dark-card border border-dark-border rounded-xl shadow-xl z-50 py-1 animate-slide-up">
                      <Link to={ROUTES.PROFILE} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-dark-hover transition-colors" onClick={() => setMenuOpen(false)} id="nav-profile">
                        <User size={14} /> Profile
                      </Link>
                      <Link to={`/${user.role}/dashboard`} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-dark-hover transition-colors" onClick={() => setMenuOpen(false)} id="nav-dashboard">
                          <Home size={14} /> Dashboard
                        </Link>
                      {user.role === 'seller' && (
                        <Link to={`/seller/auctions`} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-dark-hover transition-colors" onClick={() => setMenuOpen(false)} id="nav-seller-auctions">
                          <Gavel size={14} /> Auctions
                        </Link>
                      )}
                      <hr className="border-dark-border my-1" />
                      <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-dark-hover transition-colors" id="nav-logout">
                        <LogOut size={14} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to={ROUTES.LOGIN} className="px-4 py-2 text-sm font-medium text-white/80 rounded-lg hover:-translate-y-1 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-secondary hover:from-10% hover:to-primary hover:to-40% active:scale-95 transition-all duration-300" id="nav-login">Login</Link>
                <Link to={ROUTES.REGISTER} className="btn-primary text-sm" id="nav-register">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
