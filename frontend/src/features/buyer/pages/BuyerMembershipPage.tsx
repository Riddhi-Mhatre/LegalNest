import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Crown, Check, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { getBuyerMembership, upgradeBuyerMembership } from '../../../services/userService';
import { toast } from 'sonner';

const PLANS_DISPLAY = [
  {
    id: 'basic',
    name: 'Basic Explorer',
    price: '₹0',
    description: 'Browse verified listings with limited access.',
    features: ['Access to basic property details', 'Saved searches', 'Email alerts'],
  },
  {
    id: 'premium',
    name: 'Pro Bidder',
    price: '₹999/mo',
    description: 'Full access to live auctions and premium listings.',
    features: ['Access to live auctions', 'Direct seller chat', 'Priority notifications', 'Legal document preview'],
    recommended: true,
  },
  {
    id: 'elite',
    name: 'Elite Investor',
    price: '₹2,999/mo',
    description: 'VIP support and early access to off-market deals.',
    features: ['All Pro features', 'Dedicated relationship manager', 'Early access to listings', 'Free legal consultation'],
  },
];

export default function BuyerMembershipPage() {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuthStore();

  const { data: membership, isLoading } = useQuery({
    queryKey: ['buyer', 'membership-status'],
    queryFn: getBuyerMembership,
  });

  const { mutate: upgrade, isPending } = useMutation({
    mutationFn: (planId: string) => upgradeBuyerMembership(planId),
    onSuccess: (data) => {
      toast.success(`Upgraded to ${data.plan} plan successfully!`);
      // Update local storage/auth state
      updateUser({ membershipPlan: data.plan });
      // Invalidate queries to refresh view
      queryClient.invalidateQueries({ queryKey: ['buyer', 'membership-status'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message ?? 'Upgrade failed. Please try again.');
    },
  });

  const currentPlanId = membership?.plan?.toLowerCase() ?? user?.membershipPlan?.toLowerCase() ?? 'basic';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

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

      <div className="bg-dark-card border border-dark-border rounded-xl p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl">
         <div>
            <p className="text-muted text-xs uppercase tracking-widest mb-1 font-bold">Current Plan</p>
            <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3 capitalize">
               {currentPlanId}
               <span className="bg-primary/20 text-primary text-[10px] px-2 py-1 rounded uppercase tracking-widest border border-primary/50 font-bold">Active</span>
            </h2>
            {membership?.expiryDate && (
              <p className="text-sm text-muted mt-2">Your plan renews on {new Date(membership.expiryDate).toLocaleDateString('en-IN')}.</p>
            )}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS_DISPLAY.map((plan) => {
          const isCurrent = currentPlanId === plan.id;
          const isHigher = (plan.id === 'premium' && currentPlanId === 'basic') || (plan.id === 'elite' && currentPlanId !== 'elite');
          
          return (
            <div key={plan.id} className={`relative bg-dark-card border rounded-xl p-8 flex flex-col ${plan.recommended ? 'border-primary shadow-[0_0_20px_rgba(255,215,0,0.15)]' : 'border-dark-border'}`}>
              {plan.recommended && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  Recommended
                </div>
              )}
              
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-xs text-muted leading-relaxed mb-4 min-h-[32px]">{plan.description}</p>
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

              <button
                disabled={isCurrent || !isHigher || isPending}
                onClick={() => upgrade(plan.id)}
                className={`w-full py-3 rounded font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 ${
                  isCurrent
                    ? 'bg-white/10 text-white cursor-default'
                    : isHigher
                    ? 'bg-primary hover:bg-white text-black font-black'
                    : 'bg-white/5 text-gray-500 cursor-not-allowed border border-dark-border'
                }`}
              >
                {isPending && isHigher ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : isCurrent ? (
                  'Current Plan'
                ) : isHigher ? (
                  'Upgrade'
                ) : (
                  'Plan Blocked'
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
