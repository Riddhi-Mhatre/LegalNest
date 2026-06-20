import { Clock, Users } from 'lucide-react';
import { formatShortPrice } from '../../utils/formatters';

interface AuctionCardProps {
  auction: {
    id: string;
    title: string;
    image: string;
    currentBid: number;
    startingBid: number;
    biddersCount: number;
    timeLeft: string;
    status: 'winning' | 'outbid' | 'ending-soon' | 'active';
  };
}

export function AuctionCard({ auction }: AuctionCardProps) {
  const getStatusBadge = () => {
    switch(auction.status) {
      case 'winning': return <span className="bg-secondary/20 text-secondary border border-secondary/50 text-[10px] px-2 py-1 rounded uppercase font-bold tracking-widest">Winning</span>;
      case 'outbid': return <span className="bg-destructive/20 text-destructive border border-destructive/50 text-[10px] px-2 py-1 rounded uppercase font-bold tracking-widest animate-pulse">Outbid</span>;
      case 'ending-soon': return <span className="bg-primary/20 text-primary border border-primary/50 text-[10px] px-2 py-1 rounded uppercase font-bold tracking-widest animate-pulse">Ending Soon</span>;
      default: return null;
    }
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden group hover:border-primary/50 transition-all duration-300">
      <div className="flex flex-col sm:flex-row">
        {/* Image Side */}
        <div className="sm:w-2/5 h-40 sm:h-auto relative overflow-hidden">
          <img src={auction.image} alt={auction.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute top-2 left-2">
            {getStatusBadge()}
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
             <div className="flex items-center gap-1 text-white text-xs font-bold bg-black/60 w-fit px-2 py-1 rounded backdrop-blur-md">
                <Clock size={12} className="text-primary" />
                <span>{auction.timeLeft}</span>
             </div>
          </div>
        </div>

        {/* Content Side */}
        <div className="sm:w-3/5 p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-white font-bold text-lg leading-tight mb-4">{auction.title}</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-[10px] text-muted uppercase tracking-widest mb-1">Current Bid</p>
                <p className="text-xl font-display font-bold text-primary">{formatShortPrice(auction.currentBid)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted uppercase tracking-widest mb-1">Starting Bid</p>
                <p className="text-sm font-medium text-white">{formatShortPrice(auction.startingBid)}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-1 text-muted text-xs">
              <Users size={12} />
              <span>{auction.biddersCount} Bidders</span>
            </div>
            
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded text-xs font-bold uppercase tracking-widest transition-colors border border-dark-border">
                View
              </button>
              <button className="px-4 py-2 bg-primary hover:bg-white text-black rounded text-xs font-bold uppercase tracking-widest transition-colors">
                Place Bid
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
