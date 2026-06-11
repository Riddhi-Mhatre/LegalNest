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
import { ArrowLeft, Gavel, Users } from 'lucide-react';
import { ROUTES } from '../utils/constants';

export default function AuctionRoomPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { setAuction, connectToAuction, disconnectFromAuction, isConnected } = useAuctionStore();
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

  // Handle socket connection
  useEffect(() => {
    if (id && auction?.status === 'live') {
      connectToAuction(id);
      return () => disconnectFromAuction(id);
    }
  }, [id, auction?.status, connectToAuction, disconnectFromAuction]);

  if (auctionLoading || propertyLoading) return <FullPageLoader />;
  if (!auction || !property) return <div className="text-center py-20 text-muted">Auction not found</div>;

  const isLive = auction.status === 'live';

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      {/* Header */}
      <div className="bg-dark-card border-b border-dark-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={ROUTES.PROPERTIES} className="btn-ghost p-2" aria-label="Back">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="font-display font-bold text-lg hidden sm:block truncate max-w-sm">{property.title}</h1>
              <div className="flex items-center gap-2">
                {isLive ? (
                  <span className="badge-live"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> LIVE AUCTION</span>
                ) : (
                  <span className="text-xs text-muted uppercase font-bold tracking-wider">{auction.status}</span>
                )}
                {isConnected && <span className="text-[10px] text-secondary">● Connected</span>}
              </div>
            </div>
          </div>
          {isLive && <CountdownTimer />}
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Property Media & Details */}
        <div className="lg:col-span-5 xl:col-span-6 space-y-6">
          <ImageGallery images={property.images} title={property.title} />
          <div className="card p-6">
            <h2 className="text-xl font-bold font-display mb-2">{property.title}</h2>
            <p className="text-muted text-sm leading-relaxed mb-4 line-clamp-3">{property.description}</p>
            <div className="flex gap-4 border-t border-dark-border pt-4 text-sm">
              <div>
                <p className="text-muted text-xs uppercase mb-0.5">Starting Price</p>
                <p className="font-semibold text-white">₹{auction.startingPrice.toLocaleString()}</p>
              </div>
              <div className="border-l border-dark-border pl-4">
                <p className="text-muted text-xs uppercase mb-0.5">Area</p>
                <p className="font-semibold text-white">{property.area} sqft</p>
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
                Sellers and Admins cannot place bids.
              </div>
            )
          ) : (
            <div className="card p-6 text-center">
              <h3 className="font-bold text-lg mb-2">Auction Ended</h3>
              <p className="text-muted text-sm">Winning Bid: <span className="text-primary font-bold">₹{auction.currentHighestBid.toLocaleString()}</span></p>
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
                {/* Global Auction Room Chat */}
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
