import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, MapPin, User, ArrowRight } from 'lucide-react';
import { formatPrice, formatCountdown } from '../../utils/formatters';
import type { AuctionWithProperty } from '../../types/auction.types';

interface AuctionCardProps {
  auction: AuctionWithProperty;
}

export function AuctionCard({ auction }: AuctionCardProps) {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(0);

  const property = auction.property;
  const image = property?.images?.[0] ?? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
  const title = property?.title ?? 'Luxury Property';
  const city = property?.city ?? property?.location?.city ?? 'Unknown';
  const state = property?.state ?? property?.location?.state ?? 'India';
  const sellerName = (property as any)?.sellerName ?? 'Verified Seller';
  const biddersCount = auction.totalBids ?? auction.bids?.length ?? 0;

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      if (auction.status === 'scheduled') {
        return Math.max(0, new Date(auction.startTime).getTime() - now);
      }
      if (auction.status === 'live') {
        return Math.max(0, new Date(auction.endTime).getTime() - now);
      }
      return 0;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [auction]);

  const getStatusBadge = () => {
    switch (auction.status) {
      case 'scheduled':
        return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest">Scheduled</span>;
      case 'live':
        return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest animate-pulse flex items-center gap-1">● Live</span>;
      default:
        return <span className="bg-gray-500/20 text-gray-400 border border-gray-500/30 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest">Ended</span>;
    }
  };

  const getTimerText = () => {
    if (auction.status === 'scheduled') {
      return `Starts in: ${formatCountdown(timeLeft)}`;
    }
    if (auction.status === 'live') {
      return `Ends in: ${formatCountdown(timeLeft)}`;
    }
    return 'Auction Closed';
  };

  const currentBid = auction.currentHighestBid || auction.startingPrice || 0;

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden group hover:border-primary/50 transition-all duration-300">
      <div className="flex flex-col sm:flex-row">
        {/* Image Section */}
        <div className="sm:w-2/5 h-48 sm:h-auto relative overflow-hidden">
          <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105" />
          <div className="absolute top-3 left-3">
            {getStatusBadge()}
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/40 to-transparent p-3">
            <div className="flex items-center gap-1.5 text-white text-xs font-bold bg-black/70 w-fit px-2.5 py-1 rounded backdrop-blur-md border border-white/10">
              <Clock size={12} className={auction.status === 'live' ? 'text-emerald-400' : 'text-primary'} />
              <span className="font-mono">{getTimerText()}</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="sm:w-3/5 p-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div>
              <h3 className="text-white font-bold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">{title}</h3>
              <p className="text-xs text-muted flex items-center gap-1"><MapPin size={11} /> {city}, {state}</p>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-gray-300 bg-white/5 w-fit px-2 py-1 rounded border border-white/5">
              <User size={11} className="text-primary" />
              <span>Seller: <strong className="text-white">{sellerName}</strong></span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <p className="text-[10px] text-muted uppercase tracking-widest font-bold mb-0.5">Current Bid</p>
                <p className="text-lg font-display font-black text-primary">{formatPrice(currentBid)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted uppercase tracking-widest font-bold mb-0.5">Starting Price</p>
                <p className="text-sm font-semibold text-white">{formatPrice(auction.startingPrice)}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-dark-border/50 pt-4 mt-4">
            <div className="flex items-center gap-1 text-muted text-xs font-medium">
              <Users size={12} className="text-primary" />
              <span>{biddersCount} bid{biddersCount !== 1 ? 's' : ''}</span>
            </div>
            
            <button
              onClick={() => navigate(`/auctions/${auction.auctionId}`)}
              className="px-4 py-2 bg-primary hover:bg-white text-black rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1"
            >
              View Auction <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
