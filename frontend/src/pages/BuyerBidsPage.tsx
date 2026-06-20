import { Wallet } from 'lucide-react';
import { BidTable } from '../components/auctions/BidTable';

const myBids = [
  {
    id: 'b1',
    propertyTitle: 'Sunset Boulevard Apartment',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    currentBid: 2100000,
    myBid: 2100000,
    status: 'winning' as const,
    auctionEnd: '2026-06-21 14:00'
  },
  {
    id: 'b2',
    propertyTitle: 'Lakeview plot',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    currentBid: 850000,
    myBid: 800000,
    status: 'outbid' as const,
    auctionEnd: '2026-06-25 10:00'
  },
  {
    id: 'b3',
    propertyTitle: 'Downtown Loft',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1f5160590a?auto=format&fit=crop&w=800&q=80',
    currentBid: 1200000,
    myBid: 1200000,
    status: 'ending-soon' as const,
    auctionEnd: '2026-06-20 18:00'
  }
];

export default function BuyerBidsPage() {
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex items-center gap-4 border-b border-dark-border pb-6">
        <div className="p-3 bg-secondary/10 rounded-lg">
          <Wallet size={28} className="text-secondary" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-black uppercase tracking-widest text-white">My Bids</h1>
          <p className="text-muted text-sm mt-1">Track and manage your active bids.</p>
        </div>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden shadow-xl">
        <BidTable bids={myBids} />
      </div>
    </div>
  );
}
