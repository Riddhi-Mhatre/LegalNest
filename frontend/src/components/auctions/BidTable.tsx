import { formatShortPrice } from '../../utils/formatters';

interface Bid {
  id: string;
  propertyTitle: string;
  image: string;
  currentBid: number;
  myBid: number;
  status: 'winning' | 'outbid' | 'ending-soon';
  auctionEnd: string;
}

interface BidTableProps {
  bids: Bid[];
}

export function BidTable({ bids }: BidTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'winning': return 'text-secondary bg-secondary/10 border-secondary/20';
      case 'outbid': return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'ending-soon': return 'text-primary bg-primary/10 border-primary/20';
      default: return 'text-muted bg-white/5 border-dark-border';
    }
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="border-b border-dark-border text-muted text-xs uppercase tracking-widest bg-dark-card/50">
            <th className="py-4 px-6 font-medium">Property</th>
            <th className="py-4 px-6 font-medium">Current Bid</th>
            <th className="py-4 px-6 font-medium">My Bid</th>
            <th className="py-4 px-6 font-medium">Status</th>
            <th className="py-4 px-6 font-medium">Auction End</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-border">
          {bids.map((bid) => (
            <tr key={bid.id} className="hover:bg-white/5 transition-colors">
              <td className="py-4 px-6">
                <div className="flex items-center gap-4">
                  <img src={bid.image} alt={bid.propertyTitle} className="w-12 h-12 rounded object-cover" />
                  <span className="font-bold text-white">{bid.propertyTitle}</span>
                </div>
              </td>
              <td className="py-4 px-6 font-display font-bold text-white">
                {formatShortPrice(bid.currentBid)}
              </td>
              <td className="py-4 px-6 font-display font-bold text-muted">
                {formatShortPrice(bid.myBid)}
              </td>
              <td className="py-4 px-6">
                <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(bid.status)}`}>
                  {bid.status.replace('-', ' ')}
                </span>
              </td>
              <td className="py-4 px-6 text-sm text-gray-300">
                {bid.auctionEnd}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
