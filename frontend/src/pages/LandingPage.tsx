import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Gavel, MessageCircle, TrendingUp, Home, ChevronDown, Building, MapPin, Landmark } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getProperties } from '../services/propertyService';
import { PropertyCard } from '../components/properties/PropertyCard';
import { Loader } from '../components/common/Loader';
import { ROUTES } from '../utils/constants';

const STATS = [
  { label: 'Verified Properties', value: '500+' },
  { label: 'Live Auctions', value: '25+' },
  { label: 'Happy Buyers', value: '1,200+' },
  { label: 'Cities Covered', value: '12' },
];

const STEPS = [
  { icon: Shield, title: 'Browse Verified Listings', desc: 'All properties are verified with legal documents before listing.' },
  { icon: Gavel, title: 'Bid or Express Interest', desc: 'Join live English auctions or express direct purchase interest.' },
  { icon: MessageCircle, title: 'Chat with Sellers', desc: 'Secure one-to-one chat unlocked after expressing interest or winning an auction.' },
  { icon: TrendingUp, title: 'Complete Offline', desc: 'Schedule inspection, legal verification, and ownership transfer offline.' },
];

export default function LandingPage() {
  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties', 'featured'],
    queryFn: () => getProperties({ status: 'approved' }),
  });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-gradient min-h-[calc(100vh-64px)] flex flex-col justify-center px-4 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,215,0,0.08),transparent_60%)]" />
        
        {/* Decorative Background Icons */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <Building size={120} className="absolute top-[10%] left-[5%] text-white/5 animate-float" style={{ animationDelay: '0s' }} />
          <Home size={100} className="absolute bottom-[20%] left-[15%] text-white/5 animate-float" style={{ animationDelay: '2s' }} />
          <Gavel size={140} className="absolute top-[15%] right-[8%] text-primary/5 animate-float" style={{ animationDelay: '1s' }} />
          <MapPin size={80} className="absolute bottom-[25%] right-[20%] text-secondary/5 animate-float" style={{ animationDelay: '3s' }} />
          <Landmark size={110} className="absolute top-[50%] left-[80%] text-white/5 animate-float" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 w-full">
          <div className="badge-live inline-flex mb-6">🔴 Live Auctions Happening Now</div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6 tracking-tight">
            Find Your Perfect Property
            <br />
            <span className="text-gradient-gold">With Complete Trust</span>
          </h1>
          <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            GharBid is India's most trusted real estate marketplace — verified listings, live English auctions, and secure communications. All offline transactions, zero hidden fees.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={ROUTES.PROPERTIES} className="btn-primary flex items-center gap-2" id="hero-browse-btn">
              Browse Properties <ArrowRight size={16} />
            </Link>
            <Link to="/auctions" className="btn-secondary flex items-center gap-2 shadow-[0_0_15px_rgba(0,128,128,0.5)] hover:shadow-[0_0_30px_rgba(0,128,128,0.8)] hover:-translate-y-1 transition-all duration-300" id="hero-auction-btn">
              <Gavel size={16} className="animate-pulse" /> Join Live Auction
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-primary drop-shadow-[0_0_15px_rgba(255,215,0,0.6)] cursor-pointer animate-bounce hover:text-yellow-300 transition-colors" 
          onClick={() => window.scrollTo({ top: window.innerHeight - 64, behavior: 'smooth' })}
          aria-label="Scroll down"
        >
          <Home size={24} className="mb-1" />
          <ChevronDown size={20} />
        </div>
      </section>

      {/* Partition 2: Stats & How it Works */}
      <div className="min-h-screen flex flex-col justify-center">
        {/* Stats */}
        <section className="py-12 px-4 border-y border-dark-border bg-dark-card/50">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map(stat => (
              <div key={stat.label}>
                <p className="text-3xl font-display font-bold text-gradient-gold">{stat.value}</p>
                <p className="text-muted text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it Works */}
        <section className="py-16 px-4 flex-1 flex flex-col justify-center">
          <div className="max-w-5xl mx-auto w-full">
            <h2 className="section-title text-center mb-2">How <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary drop-shadow-[0_0_10px_rgba(0,128,128,0.3)]">GharBid</span> Works</h2>
            <p className="section-subtitle text-center mb-12">A simple, transparent process from discovery to ownership</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {STEPS.map((step, i) => (
                <div key={step.title} className="card p-6 text-center group border-b-2 border-b-transparent hover:border-b-primary hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(255,215,0,0.15)] transition-all duration-300 bg-dark-card relative">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <step.icon size={22} className="text-primary" />
                  </div>
                  <div className="text-xs text-primary font-bold mb-1">Step {i + 1}</div>
                  <h3 className="font-semibold text-sm mb-2">{step.title}</h3>
                  <p className="text-muted text-xs leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Partition 3: Featured Properties & CTA */}
      <div className="min-h-[calc(100vh-64px)] flex flex-col justify-center bg-dark-card/30">
        {/* Featured Properties */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="section-title flex items-center gap-3">
                  <span className="w-8 h-1 bg-gradient-to-r from-primary to-transparent rounded-full"></span>
                  <span className="text-gradient-gold drop-shadow-[0_0_10px_rgba(255,215,0,0.3)]">Featured Properties</span>
                </h2>
                <p className="section-subtitle">Verified and ready for viewing</p>
              </div>
              <Link to={ROUTES.PROPERTIES} className="btn-ghost text-sm flex items-center gap-1" id="see-all-properties">
                See All <ArrowRight size={14} />
              </Link>
            </div>
            {isLoading ? (
              <Loader label="Loading featured properties..." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(properties ?? []).slice(0, 4).map((property: any) => (
                  <PropertyCard key={property.propertyId} property={property} featured />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 text-center mt-auto">
          <div className="max-w-2xl mx-auto">
            <h2 className="section-title mb-4">Ready to Find Your Dream Property?</h2>
            <p className="text-muted mb-8">Join 1,200+ buyers and sellers who trust GharBid for transparent real estate transactions.</p>
            <Link to={ROUTES.REGISTER} className="btn-primary text-base px-8 py-3 inline-flex items-center gap-2 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_0_25px_rgba(255,215,0,0.4)] transition-all duration-300" id="landing-cta-register">
              Get Started Free <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
