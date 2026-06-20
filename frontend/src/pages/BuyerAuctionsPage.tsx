import { Gavel } from 'lucide-react';
import { AuctionCard } from '../components/auctions/AuctionCard';

const liveAuctions = [
  {
    id: 'a1',
    title: 'Oceanfront Estate',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    currentBid: 5200000,
    startingBid: 4000000,
    biddersCount: 12,
    timeLeft: '02:15:30',
    status: 'active' as const
  },
  {
    id: 'a2',
    title: 'Downtown Commercial Hub',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    currentBid: 15500000,
    startingBid: 12000000,
    biddersCount: 8,
    timeLeft: '00:45:10',
    status: 'ending-soon' as const
  },
  {
    id: 'a3',
    title: 'Modern Eco Villa',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    currentBid: 3200000,
    startingBid: 3000000,
    biddersCount: 4,
    timeLeft: '12:00:00',
    status: 'active' as const
  }
];

export default function BuyerAuctionsPage() {
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex items-center gap-4 border-b border-dark-border pb-6">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Gavel size={28} className="text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-black uppercase tracking-widest text-white">Live Auctions</h1>
          <p className="text-muted text-sm mt-1">Participate in ongoing auctions and place your bids.</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
         <button className="px-4 py-2 bg-primary text-black rounded font-bold uppercase tracking-widest text-xs">All Active</button>
         <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded font-bold uppercase tracking-widest text-xs border border-dark-border">Ending Soon</button>
         <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded font-bold uppercase tracking-widest text-xs border border-dark-border">My Bids</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {liveAuctions.map((auction) => (
          <AuctionCard key={auction.id} auction={auction} />
        ))}
      </div>
    </div>
  );
}
