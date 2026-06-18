import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSellerAuction, scheduleSellerAuction, getSellerAuctionBids, getInterestedBuyers } from '../services/sellerService';
import { getProperty } from '../services/propertyService';
import { FullPageLoader } from '../components/common/Loader';
import { formatPrice } from '../utils/formatters';
import { toast } from 'sonner';
import { Users, ArrowLeft, Gavel, Activity } from 'lucide-react';

export default function SellerAuctionManagementPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  // Form State
  const [startingPrice, setStartingPrice] = useState('');
  const [reservePrice, setReservePrice] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Data Queries
  const { data: property, isLoading: isPropLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => getProperty(id!),
    enabled: !!id,
  });

  const { data: auction, isLoading: isAuctionLoading } = useQuery({
    queryKey: ['sellerAuction', id],
    queryFn: () => getSellerAuction(id!),
    enabled: !!id,
  });

  const { data: bids = [] } = useQuery({
    queryKey: ['sellerAuctionBids', id],
    queryFn: () => getSellerAuctionBids(id!),
    enabled: !!auction?.auctionId,
    refetchInterval: auction?.status === 'live' ? 3000 : false, // Poll if live
  });

  const { data: buyers = [] } = useQuery({
    queryKey: ['interestedBuyers', id],
    queryFn: () => getInterestedBuyers(id!),
    enabled: !!id,
  });

  // Mutations
  const scheduleMutation = useMutation({
    mutationFn: (data: any) => scheduleSellerAuction(id!, data),
    onSuccess: () => {
      toast.success('Auction scheduled successfully!');
      queryClient.invalidateQueries({ queryKey: ['sellerAuction', id] });
      queryClient.invalidateQueries({ queryKey: ['sellerProperties'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to schedule auction');
    },
  });

  if (isPropLoading || isAuctionLoading) return <FullPageLoader />;
  if (!property) return <div className="p-8 text-center text-muted">Property not found.</div>;

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime || !endTime || !startingPrice || !reservePrice) {
      return toast.error('Please fill in all fields');
    }
    if (new Date(startTime) >= new Date(endTime)) {
      return toast.error('End time must be after start time');
    }
    
    scheduleMutation.mutate({
      startingPrice: Number(startingPrice),
      reservePrice: Number(reservePrice),
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
    });
  };

  return (
    <div className="min-h-screen bg-dark pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        
        <Link to="/seller/properties" className="inline-flex items-center gap-2 text-muted hover:text-white transition-colors mb-6">
          <ArrowLeft size={16} /> Back to My Properties
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Auction Management</h1>
          <p className="text-muted text-lg">Manage the auction for: <span className="text-white font-medium">{property.title}</span></p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Auction Status / Scheduling */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Gavel className="text-primary" />
                <h2 className="text-xl font-bold font-display">Auction Configuration</h2>
              </div>

              {!auction ? (
                <form onSubmit={handleSchedule} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-muted mb-2">Starting Price (₹)</label>
                      <input
                        type="number"
                        value={startingPrice}
                        onChange={(e) => setStartingPrice(e.target.value)}
                        className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                        placeholder="e.g. 5000000"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted mb-2">Reserve Price (₹)</label>
                      <input
                        type="number"
                        value={reservePrice}
                        onChange={(e) => setReservePrice(e.target.value)}
                        className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                        placeholder="e.g. 6000000"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted mb-2">Start Time</label>
                      <input
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted mb-2">End Time</label>
                      <input
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={scheduleMutation.isPending}
                    className="w-full btn-primary py-3 flex justify-center items-center gap-2"
                  >
                    {scheduleMutation.isPending ? 'Scheduling...' : 'Schedule Auction'}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-dark-hover rounded-lg border border-dark-border">
                    <span className="text-muted">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      auction.status === 'live' ? 'bg-green-500/20 text-green-400' : 
                      auction.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {auction.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-dark-hover rounded-lg border border-dark-border">
                      <span className="text-muted block text-sm mb-1">Starting Price</span>
                      <span className="font-bold">{formatPrice(auction.startingPrice)}</span>
                    </div>
                    <div className="p-4 bg-dark-hover rounded-lg border border-dark-border">
                      <span className="text-muted block text-sm mb-1">Reserve Price</span>
                      <span className="font-bold">{formatPrice(auction.reservePrice)}</span>
                    </div>
                    <div className="p-4 bg-dark-hover rounded-lg border border-dark-border">
                      <span className="text-muted block text-sm mb-1">Start Time</span>
                      <span className="font-bold text-sm">{new Date(auction.startTime).toLocaleString()}</span>
                    </div>
                    <div className="p-4 bg-dark-hover rounded-lg border border-dark-border">
                      <span className="text-muted block text-sm mb-1">End Time</span>
                      <span className="font-bold text-sm">{new Date(auction.endTime).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Auction History */}
            {auction && (
              <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Activity className="text-primary" />
                  <h2 className="text-xl font-bold font-display">Live Bid History</h2>
                </div>
                
                {bids.length === 0 ? (
                  <div className="text-center py-8 text-muted bg-dark-hover rounded-lg border border-dark-border border-dashed">
                    No bids have been placed yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-dark-border text-muted text-sm uppercase tracking-wider">
                          <th className="pb-3 font-medium">Bidder</th>
                          <th className="pb-3 font-medium">Amount</th>
                          <th className="pb-3 font-medium">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dark-border">
                        {bids.map((bid: any) => (
                          <tr key={bid.bidId} className="hover:bg-dark-hover/50 transition-colors">
                            <td className="py-4 text-white font-medium">{bid.bidderName}</td>
                            <td className="py-4 font-bold text-primary">{formatPrice(bid.amount)}</td>
                            <td className="py-4 text-muted text-sm">{new Date(bid.createdAt).toLocaleTimeString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            
            {/* Interested Buyers */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Users className="text-primary" />
                <h2 className="text-xl font-bold font-display">Interested Buyers</h2>
              </div>
              
              {buyers.length === 0 ? (
                <div className="text-center py-6 text-muted text-sm">
                  No buyers have expressed interest yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {buyers.map((buyer: any) => (
                    <div key={buyer.userId} className="p-3 bg-dark-hover rounded-lg border border-dark-border flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white text-sm">{buyer.name}</p>
                        <p className="text-xs text-muted truncate max-w-[150px]">{buyer.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Auction Info Card */}
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-6">
              <h3 className="font-bold text-primary mb-2">How it works</h3>
              <p className="text-sm text-white/80 leading-relaxed mb-4">
                Once your property is approved, you can schedule an auction. Interested buyers will be notified automatically.
              </p>
              <ul className="text-sm text-white/80 space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  Set a starting price to begin bidding.
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  Set a reserve price as your minimum acceptable offer.
                </li>
              </ul>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
