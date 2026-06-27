import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Wallet, Loader2, Info } from 'lucide-react';
import { BidTable } from '../../../components/auctions/BidTable';
import { getBuyerBids } from '../../../services/userService';

export default function BuyerBidsPage() {
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter');
  const { data: bids = [], isLoading } = useQuery({
    queryKey: ['buyer', 'bids-list-page'],
    queryFn: getBuyerBids,
  });

  const filteredBids = filter === 'won'
    ? bids.filter((b: any) => b.isWinner || b.status === 'won')
    : bids;

  const mappedBids = filteredBids.map((b: any) => ({
    id: b.bidId,
    propertyTitle: b.propertyName ?? 'Unknown Property',
    image: b.image || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=80&q=80',
    currentBid: b.currentHighestBid,
    myBid: b.myBid,
    status: b.isWinner || b.status === 'won' ? 'winning' as const : b.status === 'lost' ? 'outbid' as const : b.status as any,
    auctionEnd: b.auctionEndTime ? new Date(b.auctionEndTime).toLocaleString('en-IN') : '—',
  }));

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex items-center gap-4 border-b border-dark-border pb-6">
        <div className="p-3 bg-secondary/10 rounded-lg">
          <Wallet size={28} className="text-secondary" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-black uppercase tracking-widest text-white">
            {filter === 'won' ? 'Auctions Won' : 'My Bids'}
          </h1>
          <p className="text-muted text-sm mt-1">
            {filter === 'won' ? 'Properties you have successfully won at auction.' : 'Track and manage your active bids.'}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : mappedBids.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-dark-border rounded-xl bg-black/20 text-muted">
          <Info size={40} className="mx-auto mb-4 text-muted opacity-30" />
          <h3 className="font-display font-bold text-white mb-2">No Bids Found</h3>
          <p className="text-muted text-sm max-w-sm mx-auto">
            {filter === 'won' ? 'You have not won any auctions yet.' : "You haven't placed any bids on active property auctions yet."}
          </p>
        </div>
      ) : (
        <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden shadow-xl">
          <BidTable bids={mappedBids} />
        </div>
      )}
    </div>
  );
}
