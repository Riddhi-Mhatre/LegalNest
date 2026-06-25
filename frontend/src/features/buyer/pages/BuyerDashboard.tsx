import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import { Heart, Gavel, ArrowRight, Trophy, Sparkles, Loader2, AlertCircle, CheckCircle, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../utils/constants';
import { SummaryCard } from '../../../components/common/SummaryCard';
import { BuyerPropertyCard } from '../../../components/properties/BuyerPropertyCard';
import { AuctionCard } from '../../../components/auctions/AuctionCard';
import { BidTable } from '../../../components/auctions/BidTable';
import { getAuctions } from '../../../services/auctionService';
import { getProperties } from '../../../services/propertyService';
import { getBuyerBids, getPurchases } from '../../../services/userService';

export default function BuyerDashboard() {
  const { user } = useAuthStore();

  // 1. Fetch live auctions (for Active Auctions stats and Trending list)
  const { data: liveAuctions = [], isLoading: liveAuctionsLoading } = useQuery({
    queryKey: ['buyer', 'dashboard-live-auctions'],
    queryFn: () => getAuctions('live'),
  });

  // 2. Fetch properties (for recommendations and enrichment)
  const { data: properties = [], isLoading: propsLoading } = useQuery({
    queryKey: ['buyer', 'dashboard-properties'],
    queryFn: () => getProperties(),
  });

  // 3. Fetch buyer bids (for dashboard stats and active bids list)
  const { data: buyerBids = [], isLoading: bidsLoading } = useQuery({
    queryKey: ['buyer', 'dashboard-my-bids'],
    queryFn: getBuyerBids,
  });

  // 4. Fetch buyer purchases
  const { data: purchases = [], isLoading: purchasesLoading } = useQuery({
    queryKey: ['buyer', 'dashboard-purchases'],
    queryFn: getPurchases,
  });

  const isLoading = liveAuctionsLoading || propsLoading || bidsLoading || purchasesLoading;

  // Enriched live auctions for "Trending Auctions" list
  const propertyMap = new Map((properties as any[]).map(p => [p.propertyId, p]));
  const enrichedTrending = liveAuctions.slice(0, 2).map((a: any) => ({
    ...a,
    property: propertyMap.get(a.propertyId),
  }));

  // Recommended Properties (just slice the first 3 approved ones)
  const recommendedProperties = (properties as any[]).slice(0, 3);

  // Compute stats for Summary Cards
  const activeAuctionsCount = liveAuctions.length;
  
  // Unique auctions bid on
  const participatedAuctionIds = new Set((buyerBids as any[]).map(b => b.auctionId));
  const auctionsParticipatedCount = participatedAuctionIds.size;

  // Won auctions count
  const auctionsWonCount = (buyerBids as any[]).filter(b => b.isWinner || b.status === 'won').length;

  // Current highest bids (winning bids count)
  const currentHighestBidsCount = (buyerBids as any[]).filter(b => b.status === 'winning').length;

  // Map backend bids list to matches for BidTable component format
  const mappedBids = (buyerBids as any[]).map(b => ({
    id: b.bidId,
    propertyTitle: b.propertyName ?? 'Unknown Property',
    image: b.image || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=80&q=80',
    currentBid: b.currentHighestBid,
    myBid: b.myBid,
    status: b.status === 'won' ? 'winning' as const : b.status === 'lost' ? 'outbid' as const : b.status as any,
    auctionEnd: b.auctionEndTime ? new Date(b.auctionEndTime).toLocaleString('en-IN') : '—',
  }));

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="animate-spin text-primary" size={36} />
        <p className="text-muted text-sm font-semibold">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in pb-12">
      
      {!user?.isVerified && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 -mb-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-400 shrink-0" size={24} />
            <div>
              <h3 className="text-red-400 font-bold">Action Required: Verify Your Identity</h3>
              <p className="text-red-200/80 text-sm">Please upload your identity documents to become a verified buyer.</p>
            </div>
          </div>
          <Link to={ROUTES.BUYER_LEGAL} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold transition-colors whitespace-nowrap">
            Upload Documents
          </Link>
        </div>
      )}

      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-black tracking-tighter uppercase leading-none text-white mb-2">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{user?.name?.split(' ')[0] || 'Buyer'}</span>
          </h1>
          <p className="text-muted font-light tracking-wide max-w-md text-sm">
            Here's what's happening with your properties and bids today.
          </p>
        </div>
        <div className="flex gap-3">
           <Link to={ROUTES.PROPERTIES} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded font-bold uppercase tracking-widest text-xs transition-colors border border-dark-border">
             Browse Properties
           </Link>
           <Link to={ROUTES.BUYER_AUCTIONS} className="px-6 py-3 bg-primary hover:bg-white text-black rounded font-bold uppercase tracking-widest text-xs transition-colors flex items-center gap-2">
             Join Auctions <ArrowRight size={14} />
           </Link>
         </div>
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard label="Active Auctions" count={activeAuctionsCount} icon={Gavel} color="text-primary" />
        <SummaryCard label="Auctions Participated" count={auctionsParticipatedCount} icon={Heart} color="text-rose-500" />
        <SummaryCard label="Auctions Won" count={auctionsWonCount} icon={Trophy} color="text-accent" />
        <SummaryCard label="Current Highest Bids" count={currentHighestBidsCount} icon={Sparkles} color="text-secondary" />
      </section>

      {/* Recommended Properties */}
      <section>
        <div className="flex items-center justify-between mb-6 border-b border-dark-border pb-4">
          <h2 className="text-2xl font-display font-bold uppercase tracking-widest text-white">Recommended For You</h2>
          <Link to={ROUTES.PROPERTIES} className="text-xs font-bold text-primary hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1">
            View All <ArrowRight size={12} />
          </Link>
        </div>
        {recommendedProperties.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-dark-border rounded-xl bg-black/20 text-muted">
            No recommended properties available right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedProperties.map((property: any) => (
              <BuyerPropertyCard key={property.propertyId} property={property} />
            ))}
          </div>
        )}
      </section>

      {/* Purchased Properties */}
      {purchases.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6 border-b border-dark-border pb-4">
            <h2 className="text-2xl font-display font-bold uppercase tracking-widest text-emerald-400">Purchased Properties</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(purchases as any[]).map((purchase: any) => (
              <div key={purchase.purchaseId} className="bg-dark-card border border-emerald-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full -z-10 group-hover:bg-emerald-500/10 transition-colors" />
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-white text-lg mb-1">{purchase.propertyTitle || 'Property'}</h3>
                    <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                      <CheckCircle size={12} /> Successfully Acquired
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                    <Building2 size={20} />
                  </div>
                </div>
                <div className="space-y-3 mt-4 text-sm">
                  <div className="flex justify-between border-b border-dark-border pb-2">
                    <span className="text-muted">Purchase Date</span>
                    <span className="text-white font-semibold">{new Date(purchase.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-dark-border pb-2">
                    <span className="text-muted">Transaction ID</span>
                    <span className="text-white font-semibold truncate max-w-[120px]">{purchase.purchaseId}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Grid Layout for Auctions and Bids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Trending Live Auctions */}
        <section>
          <div className="flex items-center justify-between mb-6 border-b border-dark-border pb-4">
            <h2 className="text-2xl font-display font-bold uppercase tracking-widest text-white">Trending Auctions</h2>
            <Link to={ROUTES.BUYER_AUCTIONS} className="text-xs font-bold text-primary hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          {enrichedTrending.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-dark-border rounded-xl bg-black/20 text-muted">
              No live auctions currently running.
            </div>
          ) : (
            <div className="space-y-4">
              {enrichedTrending.map((auction: any) => (
                <AuctionCard key={auction.auctionId} auction={auction} />
              ))}
            </div>
          )}
        </section>

        {/* Your Active Bids */}
        <section>
          <div className="flex items-center justify-between mb-6 border-b border-dark-border pb-4">
            <h2 className="text-2xl font-display font-bold uppercase tracking-widest text-white">Your Active Bids</h2>
            <Link to={ROUTES.BUYER_BIDS} className="text-xs font-bold text-primary hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1">
              Manage Bids <ArrowRight size={12} />
            </Link>
          </div>
          {mappedBids.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-dark-border rounded-xl bg-black/20 text-muted">
              You haven't placed any bids yet.
            </div>
          ) : (
            <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden shadow-xl">
              <BidTable bids={mappedBids.slice(0, 5)} />
            </div>
          )}
        </section>
      </div>

    </div>
  );
}
