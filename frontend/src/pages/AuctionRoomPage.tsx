import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAuction, getBidHistory } from '../services/auctionService';
import { getProperty } from '../services/propertyService';
import { useAuctionStore } from '../store/auctionStore';
import { useAuthStore } from '../store/authStore';
import { BidPanel } from '../components/auctions/BidPanel';
import { CountdownTimer } from '../components/auctions/CountdownTimer';
import { BidHistory } from '../components/auctions/BidHistory';
import { Leaderboard } from '../components/auctions/Leaderboard';
import { ChatWindow } from '../components/chat/ChatWindow';
import { ImageGallery } from '../components/properties/ImageGallery';
import { FullPageLoader } from '../components/common/Loader';
import { ArrowLeft, Gavel, Users, MapPin, Calendar, Trophy } from 'lucide-react';
import { ROUTES } from '../utils/constants';
import { formatPrice, formatDateTime } from '../utils/formatters';

export default function AuctionRoomPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { setAuction, connectToAuction, disconnectFromAuction, isConnected, bidHistory } = useAuctionStore();
  const [activeTab, setActiveTab] = useState<'bids' | 'chat'>('bids');

  const { data: auction, isLoading: auctionLoading } = useQuery({
    queryKey: ['auction', id],
    queryFn: () => getAuction(id!),
    enabled: !!id,
  });

  const { data: property, isLoading: propertyLoading } = useQuery({
    queryKey: ['property', auction?.propertyId],
    queryFn: () => getProperty(auction!.propertyId),
    enabled: !!auction?.propertyId,
  });

  useQuery({
    queryKey: ['bids', id],
    queryFn: () => getBidHistory(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (auction) setAuction(auction);
  }, [auction, setAuction]);

  // Handle socket connection - connect on mount, regardless of status
  useEffect(() => {
    if (id && auction) {
      connectToAuction(id);
      return () => disconnectFromAuction(id);
    }
  }, [id, auction, connectToAuction, disconnectFromAuction]);

  if (auctionLoading || propertyLoading) return <FullPageLoader />;
  if (!auction || !property) return <div className="text-center py-20 text-muted">Auction not found</div>;

  const isLive = auction.status === 'live';
  const isScheduled = auction.status === 'scheduled';
  const isEnded = auction.status === 'completed' || auction.status === 'ended' || auction.status === 'cancelled';
  const uniqueParticipants = new Set(bidHistory.map(b => b.userId ?? b.bidderId)).size;

  const city = property.city ?? property.location?.city ?? 'Unknown';
  const state = property.state ?? property.location?.state ?? 'India';

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      {/* Header */}
      <div className="bg-dark-card border-b border-dark-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={user?.role === 'seller' ? '/seller/auctions' : ROUTES.BUYER_AUCTIONS} className="btn-ghost p-2" aria-label="Back">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="font-display font-bold text-lg hidden sm:block truncate max-w-sm">{property.title}</h1>
              <div className="flex items-center gap-2">
                {isLive ? (
                  <span className="badge-live"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> LIVE NOW</span>
                ) : isScheduled ? (
                  <span className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">SCHEDULED</span>
                ) : (
                  <span className="text-xs text-muted bg-white/5 border border-dark-border px-2 py-0.5 rounded font-bold uppercase tracking-wider">{auction.status}</span>
                )}
                {isConnected && <span className="text-[10px] text-secondary">● Connected</span>}
              </div>
            </div>
          </div>
          {!isEnded && <CountdownTimer />}
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Property Media & Details */}
        <div className="lg:col-span-5 xl:col-span-6 space-y-6">
          <ImageGallery images={property.images} title={property.title} />
          
          <div className="card p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold font-display text-white">{property.title}</h2>
              <p className="text-xs text-muted flex items-center gap-1.5 mt-1.5"><MapPin size={13} /> {city}, {state}</p>
            </div>
            
            <p className="text-muted text-sm leading-relaxed">{property.description}</p>
            
            <div className="border-t border-dark-border pt-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Property Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted text-xs uppercase mb-0.5">Area</p>
                  <p className="font-semibold text-white">{property.area} sqft</p>
                </div>
                <div>
                  <p className="text-muted text-xs uppercase mb-0.5">Property Type</p>
                  <p className="font-semibold text-white capitalize">{property.type}</p>
                </div>
                {property.bedrooms > 0 && (
                  <div>
                    <p className="text-muted text-xs uppercase mb-0.5">Bedrooms</p>
                    <p className="font-semibold text-white">{property.bedrooms}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-dark-border pt-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Auction Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted text-xs uppercase mb-0.5">Starting Price</p>
                  <p className="font-bold text-primary">{formatPrice(auction.startingPrice)}</p>
                </div>
                <div>
                  <p className="text-muted text-xs uppercase mb-0.5">Reserve Price</p>
                  <p className="font-semibold text-white">{formatPrice(auction.reservePrice)}</p>
                </div>
                <div>
                  <p className="text-muted text-xs uppercase mb-0.5">Bid Increment</p>
                  <p className="font-semibold text-secondary">{formatPrice(auction.bidIncrement)}</p>
                </div>
                <div>
                  <p className="text-muted text-xs uppercase mb-0.5">Participants</p>
                  <p className="font-semibold text-white flex items-center gap-1"><Users size={14} /> {uniqueParticipants}</p>
                </div>
                <div>
                  <p className="text-muted text-xs uppercase mb-0.5">Start Time</p>
                  <p className="font-semibold text-white text-xs">{formatDateTime(auction.startTime)}</p>
                </div>
                <div>
                  <p className="text-muted text-xs uppercase mb-0.5">End Time</p>
                  <p className="font-semibold text-white text-xs">{formatDateTime(auction.endTime)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column: Bidding Panel & History */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6 flex flex-col h-[calc(100vh-120px)] lg:h-auto">
          {isLive ? (
            user?.role === 'buyer' ? (
              <BidPanel auctionId={auction.auctionId} />
            ) : (
              <div className="card p-6 text-center text-muted text-sm border-dashed">
                Sellers cannot place bids.
              </div>
            )
          ) : isScheduled ? (
            <div className="card p-6 text-center space-y-4 border border-dashed border-dark-border">
              <Calendar size={36} className="mx-auto text-blue-400 opacity-60" />
              <div>
                <h3 className="font-bold text-lg text-white">Auction Scheduled</h3>
                <p className="text-muted text-xs mt-2 leading-relaxed">
                  Bidding opens once the countdown reaches zero on {formatDateTime(auction.startTime)}.
                </p>
              </div>
            </div>
          ) : (
            <div className="card p-6 text-center space-y-4 border border-primary/20 bg-primary/5">
              <Trophy size={36} className="mx-auto text-primary" />
              <div>
                <h3 className="font-bold text-lg text-white">Auction Closed</h3>
                {auction.currentHighestBid > 0 ? (
                  <div className="mt-3 space-y-1.5 text-sm bg-black/40 p-3 rounded-lg border border-white/5">
                    <p className="text-muted text-xs uppercase font-bold tracking-wider">Final Winning Bid</p>
                    <p className="text-2xl font-display font-black text-primary">{formatPrice(auction.currentHighestBid)}</p>
                    {auction.highestBidderId && (
                      <p className="text-xs text-muted">Winner ID: <strong className="text-white">{auction.highestBidderId.slice(0, 12)}...</strong></p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted text-xs mt-2">Auction ended with no bids placed.</p>
                )}
              </div>
            </div>
          )}
          
          <div className="flex-1 min-h-[300px] flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">Live Activity</h3>
              <div className="flex bg-dark-hover rounded p-0.5 text-xs">
                <button 
                  onClick={() => setActiveTab('bids')}
                  className={`px-3 py-1 rounded-sm ${activeTab === 'bids' ? 'bg-dark-card border border-dark-border text-white' : 'text-muted'}`}
                >
                  <Gavel size={12} className="inline mr-1"/> Bids
                </button>
                <button 
                  onClick={() => setActiveTab('chat')}
                  className={`px-3 py-1 rounded-sm ${activeTab === 'chat' ? 'bg-dark-card border border-dark-border text-white' : 'text-muted'}`}
                >
                  <Users size={12} className="inline mr-1"/> Chat
                </button>
              </div>
            </div>
            
            <div className="flex-1 relative">
              <div className={`absolute inset-0 transition-opacity ${activeTab === 'bids' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                <BidHistory />
              </div>
              <div className={`absolute inset-0 card flex flex-col transition-opacity ${activeTab === 'chat' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                <ChatWindow roomId={`global_auction_${auction.auctionId}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Leaderboard */}
        <div className="lg:col-span-3 hidden lg:block">
          <div className="sticky top-24">
            <Leaderboard />
          </div>
        </div>
      </div>
    </div>
  );
}
