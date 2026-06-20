import { Crown, Check } from 'lucide-react';

const plans = [
  {
    name: 'Basic',
    price: 'Free',
    features: ['Browse properties', 'Save up to 10 properties', 'Basic support'],
    current: false,
    recommended: false
  },
  {
    name: 'Premium',
    price: '$99/mo',
    features: ['Join live auctions', 'Save unlimited properties', 'Priority legal document verification', 'Dedicated support agent'],
    current: true,
    recommended: true
  },
  {
    name: 'Elite',
    price: '$299/mo',
    features: ['All Premium features', 'Early access to luxury listings', 'Free property valuation reports', 'Concierge visit scheduling'],
    current: false,
    recommended: false
  }
];

export default function BuyerMembershipPage() {
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex items-center gap-4 border-b border-dark-border pb-6">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Crown size={28} className="text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-black uppercase tracking-widest text-white">Membership</h1>
          <p className="text-muted text-sm mt-1">Manage your plan to unlock premium platform features.</p>
        </div>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-xl p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
         <div>
            <p className="text-muted text-sm uppercase tracking-widest mb-1">Current Plan</p>
            <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3">
               Premium
               <span className="bg-primary/20 text-primary text-[10px] px-2 py-1 rounded uppercase tracking-widest border border-primary/50">Active</span>
            </h2>
            <p className="text-sm text-muted mt-2">Your plan renews on July 20, 2026.</p>
         </div>
         <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded font-bold uppercase tracking-widest text-xs border border-dark-border transition-colors">
            Manage Billing
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.name} className={`relative bg-dark-card border rounded-xl p-8 flex flex-col ${plan.recommended ? 'border-primary shadow-gold' : 'border-dark-border'}`}>
            {plan.recommended && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                Recommended
              </div>
            )}
            
            <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
            <div className="text-3xl font-display font-black text-white mb-6">
               {plan.price}
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
               {plan.features.map((feature, i) => (
                 <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <Check size={16} className="text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                 </li>
               ))}
            </ul>

            <button className={`w-full py-3 rounded font-bold uppercase tracking-widest text-xs transition-colors ${plan.current ? 'bg-white/10 text-white cursor-default' : plan.recommended ? 'bg-primary hover:bg-white text-black' : 'bg-white/5 hover:bg-white/10 text-white border border-dark-border'}`}>
               {plan.current ? 'Current Plan' : 'Upgrade'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
