import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Check, Shield, Zap, Sparkles, Building2, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const PLANS = {
  buyer: {
    monthly: [
      { id: 'b_m_basic', name: 'Basic Explorer', price: 0, description: 'Browse verified listings with limited access.', features: ['Access to basic property details', 'Saved searches', 'Email alerts'] },
      { id: 'b_m_pro', name: 'Pro Bidder', price: 999, description: 'Full access to live auctions and premium listings.', features: ['Access to live auctions', 'Direct seller chat', 'Priority notifications', 'Legal document preview'], isPopular: true },
      { id: 'b_m_elite', name: 'Elite Investor', price: 2999, description: 'VIP support and early access to off-market deals.', features: ['All Pro features', 'Dedicated relationship manager', 'Early access to listings', 'Free legal consultation'] },
    ],
    quarterly: [
      { id: 'b_q_basic', name: 'Basic Explorer', price: 0, description: 'Browse verified listings with limited access.', features: ['Access to basic property details', 'Saved searches', 'Email alerts'] },
      { id: 'b_q_pro', name: 'Pro Bidder', price: 2499, description: 'Full access to live auctions and premium listings.', features: ['Access to live auctions', 'Direct seller chat', 'Priority notifications', 'Legal document preview'], isPopular: true },
      { id: 'b_q_elite', name: 'Elite Investor', price: 7999, description: 'VIP support and early access to off-market deals.', features: ['All Pro features', 'Dedicated relationship manager', 'Early access to listings', 'Free legal consultation'] },
    ],
    annual: [
      { id: 'b_a_basic', name: 'Basic Explorer', price: 0, description: 'Browse verified listings with limited access.', features: ['Access to basic property details', 'Saved searches', 'Email alerts'] },
      { id: 'b_a_pro', name: 'Pro Bidder', price: 8999, description: 'Full access to live auctions and premium listings.', features: ['Access to live auctions', 'Direct seller chat', 'Priority notifications', 'Legal document preview'], isPopular: true },
      { id: 'b_a_elite', name: 'Elite Investor', price: 29999, description: 'VIP support and early access to off-market deals.', features: ['All Pro features', 'Dedicated relationship manager', 'Early access to listings', 'Free legal consultation'] },
    ]
  },
  seller: {
    monthly: [
      { id: 's_m_basic', name: 'Standard Listing', price: 1999, description: 'List your property for 30 days.', features: ['1 Property Listing', 'Basic visibility', 'Standard support'] },
      { id: 's_m_pro', name: 'Premium Auction', price: 4999, description: 'Host a live English auction for your property.', features: ['Live Auction setup', 'Featured placement', 'Dedicated account manager', 'Marketing blast'], isPopular: true },
      { id: 's_m_elite', name: 'Agency/Builder', price: 14999, description: 'For agencies listing multiple properties.', features: ['Unlimited listings', 'Multiple live auctions', 'Custom branding', 'API access'] },
    ],
    quarterly: [
      { id: 's_q_basic', name: 'Standard Listing', price: 4999, description: 'List your property for 90 days.', features: ['1 Property Listing', 'Basic visibility', 'Standard support'] },
      { id: 's_q_pro', name: 'Premium Auction', price: 12999, description: 'Host a live English auction for your property.', features: ['Live Auction setup', 'Featured placement', 'Dedicated account manager', 'Marketing blast'], isPopular: true },
      { id: 's_q_elite', name: 'Agency/Builder', price: 39999, description: 'For agencies listing multiple properties.', features: ['Unlimited listings', 'Multiple live auctions', 'Custom branding', 'API access'] },
    ],
    annual: [
      { id: 's_a_basic', name: 'Standard Listing', price: 17999, description: 'List your property for 365 days.', features: ['1 Property Listing', 'Basic visibility', 'Standard support'] },
      { id: 's_a_pro', name: 'Premium Auction', price: 44999, description: 'Host a live English auction for your property.', features: ['Live Auction setup', 'Featured placement', 'Dedicated account manager', 'Marketing blast'], isPopular: true },
      { id: 's_a_elite', name: 'Agency/Builder', price: 149999, description: 'For agencies listing multiple properties.', features: ['Unlimited listings', 'Multiple live auctions', 'Custom branding', 'API access'] },
    ]
  }
};

export default function MembershipPage() {
  const { user } = useAuthStore();
  const [role, setRole] = useState<'buyer' | 'seller'>(user?.role === 'admin' ? 'buyer' : (user?.role || 'buyer'));
  const [cycle, setCycle] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');

  const activePlans = PLANS[role][cycle];
  const isBuyer = role === 'buyer';

  return (
    <div className="min-h-screen relative overflow-hidden py-16 px-4">
      {/* Dynamic Background */}
      <div className={`absolute inset-0 opacity-20 blur-[150px] transition-colors duration-1000 ${isBuyer ? 'bg-[radial-gradient(ellipse_at_top,#FFD700_0%,transparent_70%)]' : 'bg-[radial-gradient(ellipse_at_top,#008080_0%,transparent_70%)]'}`}></div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-2xl">
            Choose Your <span className={isBuyer ? 'text-gradient-gold' : 'text-gradient-teal'}>Power</span>
          </h1>
          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto">
            Unlock the full potential of GharBid. Zero hidden fees. Unmatched transparency.
          </p>
        </div>

        {/* Toggles */}
        <div className="flex flex-col items-center gap-8 mb-16">
          {/* Role Toggle */}
          <div className="flex bg-dark-hover p-1.5 rounded-2xl border border-dark-border shadow-2xl relative">
            <button
              onClick={() => setRole('buyer')}
              className={`relative flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all duration-300 z-10 ${
                isBuyer ? 'text-black' : 'text-muted hover:text-white'
              }`}
            >
              <User size={18} /> Buyer
            </button>
            <button
              onClick={() => setRole('seller')}
              className={`relative flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all duration-300 z-10 ${
                !isBuyer ? 'text-white' : 'text-muted hover:text-white'
              }`}
            >
              <Building2 size={18} /> Seller
            </button>
            <div 
              className={`absolute top-1.5 bottom-1.5 w-[calc(50%-0.375rem)] rounded-xl transition-all duration-500 ease-out ${
                isBuyer ? 'left-1.5 bg-primary shadow-[0_0_20px_rgba(255,215,0,0.5)]' : 'translate-x-[100%] bg-secondary shadow-[0_0_20px_rgba(0,128,128,0.5)]'
              }`}
            ></div>
          </div>

          {/* Cycle Toggle */}
          <div className="flex gap-2">
            {(['monthly', 'quarterly', 'annual'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCycle(c)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  cycle === c 
                    ? `bg-white/10 text-white border ${isBuyer ? 'border-primary shadow-[0_0_15px_rgba(255,215,0,0.2)]' : 'border-secondary shadow-[0_0_15px_rgba(0,128,128,0.2)]'}` 
                    : 'text-muted hover:text-white border border-transparent hover:border-white/10'
                }`}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {activePlans.map((plan, i) => {
            const isPop = plan.isPopular;
            return (
              <div
                key={plan.id}
                className={`group relative p-8 rounded-3xl bg-dark-card border transition-all duration-500 hover:-translate-y-4 ${
                  isPop 
                    ? `border-2 scale-105 z-10 ${isBuyer ? 'border-primary shadow-[0_0_40px_rgba(255,215,0,0.15)] hover:shadow-[0_0_60px_rgba(255,215,0,0.3)]' : 'border-secondary shadow-[0_0_40px_rgba(0,128,128,0.2)] hover:shadow-[0_0_60px_rgba(0,128,128,0.4)]'}` 
                    : 'border-dark-border hover:border-white/20'
                }`}
              >
                {/* Glow behind popular card */}
                {isPop && (
                  <div className={`absolute inset-0 -z-10 blur-2xl opacity-20 transition-opacity group-hover:opacity-40 rounded-3xl ${isBuyer ? 'bg-primary' : 'bg-secondary'}`}></div>
                )}

                {isPop && (
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase flex items-center gap-1 shadow-xl ${
                    isBuyer ? 'bg-primary text-black' : 'bg-secondary text-white'
                  }`}>
                    <Sparkles size={14} /> Most Popular
                  </div>
                )}

                <h3 className="text-2xl font-display font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted mb-8 h-10">{plan.description}</p>
                
                <div className="mb-8 flex items-end gap-1">
                  <span className="text-5xl font-bold tracking-tight">₹{plan.price.toLocaleString()}</span>
                  {plan.price > 0 && <span className="text-muted text-sm pb-1">/{cycle === 'monthly' ? 'mo' : cycle === 'quarterly' ? 'qtr' : 'yr'}</span>}
                </div>

                <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <div className={`mt-0.5 rounded-full p-1 ${isPop ? (isBuyer ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary') : 'bg-white/5 text-muted'}`}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span className="text-white/90 text-sm font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide uppercase transition-all duration-300 ${
                  isPop 
                    ? `${isBuyer ? 'bg-primary text-black hover:bg-yellow-400 hover:shadow-[0_0_25px_rgba(255,215,0,0.5)]' : 'bg-secondary text-white hover:bg-teal-500 hover:shadow-[0_0_25px_rgba(0,128,128,0.5)]'} btn-shine` 
                    : 'bg-dark-hover border border-dark-border text-white hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                }`}>
                  Select {plan.name}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Guarantee */}
        <div className="mt-24 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-6 relative group">
            <div className={`absolute inset-0 blur-xl opacity-0 group-hover:opacity-50 transition-opacity rounded-full ${isBuyer ? 'bg-primary' : 'bg-secondary'}`}></div>
            <Shield size={24} className={isBuyer ? 'text-primary' : 'text-secondary'} />
          </div>
          <p className="text-muted max-w-md mx-auto">
            Bank-grade encryption. Verified users only. Upgrade or downgrade anytime with no questions asked.
          </p>
        </div>
      </div>
    </div>
  );
}
