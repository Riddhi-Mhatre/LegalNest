import { useAuthStore } from '../store/authStore';
import { Heart, Gavel, Home, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import { SummaryCard } from '../components/common/SummaryCard';
import { BuyerPropertyCard } from '../components/properties/BuyerPropertyCard';
import { AuctionCard } from '../components/auctions/AuctionCard';
import { BidTable } from '../components/auctions/BidTable';

const recommendedProperties = [
  {
    id: '1',
    title: 'Modern Glass Villa',
    location: 'Beverly Hills, CA',
    price: 4500000,
    type: 'Villa',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    isVerified: true
  },
  {
    id: '2',
    title: 'Luxury Penthouse',
    location: 'Manhattan, NY',
    price: 8200000,
    type: 'Apartment',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    isVerified: true
  },
  {
    id: '3',
    title: 'Smart Home Mansion',
    location: 'Silicon Valley, CA',
    price: 12500000,
    type: 'House',
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80',
    isVerified: false
  }
];

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
  }
];

const recentBids = [
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
  }
];

export default function BuyerDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-12 animate-fade-in pb-12">
      
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
        <SummaryCard label="Saved Properties" count={12} icon={Heart} trend="2 this week" trendUp={true} color="text-rose-500" />
        <SummaryCard label="Active Bids" count={3} icon={Gavel} trend="1 ending soon" trendUp={false} color="text-primary" />
        <SummaryCard label="Scheduled Visits" count={2} icon={Calendar} trend="Next tomorrow" trendUp={true} color="text-secondary" />
        <SummaryCard label="Auctions Won" count={1} icon={Home} color="text-accent" />
      </section>

      {/* Recommended Properties */}
      <section>
        <div className="flex items-center justify-between mb-6 border-b border-dark-border pb-4">
          <h2 className="text-2xl font-display font-bold uppercase tracking-widest text-white">Recommended For You</h2>
          <Link to={ROUTES.PROPERTIES} className="text-xs font-bold text-primary hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1">
            View All <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedProperties.map((property) => (
            <BuyerPropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>

      {/* Grid Layout for Auctions and Bids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Live Auctions */}
        <section>
          <div className="flex items-center justify-between mb-6 border-b border-dark-border pb-4">
            <h2 className="text-2xl font-display font-bold uppercase tracking-widest text-white">Trending Auctions</h2>
            <Link to={ROUTES.BUYER_AUCTIONS} className="text-xs font-bold text-primary hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-4">
            {liveAuctions.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        </section>

        {/* Recent Bids */}
        <section>
          <div className="flex items-center justify-between mb-6 border-b border-dark-border pb-4">
            <h2 className="text-2xl font-display font-bold uppercase tracking-widest text-white">Your Active Bids</h2>
            <Link to={ROUTES.BUYER_BIDS} className="text-xs font-bold text-primary hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1">
              Manage Bids <ArrowRight size={12} />
            </Link>
          </div>
          <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
            <BidTable bids={recentBids} />
          </div>
        </section>
      </div>

    </div>
  );
}
