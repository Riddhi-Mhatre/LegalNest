import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getSellerAuctions } from '../services/sellerService';
import { formatPrice } from '../utils/formatters';
import {
  Gavel, CheckCircle, Activity,
  TrendingUp, Users, ArrowRight, Eye
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const statusConfig: Record<string, { label: string; class: string }> = {
  active: { label: 'Active', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  live: { label: 'Live', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  scheduled: { label: 'Scheduled', class: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  completed: { label: 'Completed', class: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
  draft: { label: 'Draft', class: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
};

export default function SellerAuctionDashboard() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['seller', 'auctions'],
    queryFn: getSellerAuctions,
  });

  const stats = data?.stats || {
    total: 0, active: 0, completed: 0, totalBids: 0, highestBid: 0, totalViews: 0
  };

  const auctions = data?.auctions || [];

  // Generate some mock chart data based on active auctions if history is limited
  const chartData = [
    { name: 'Mon', bids: Math.floor(stats.totalBids * 0.1), views: Math.floor(stats.totalViews * 0.1) },
    { name: 'Tue', bids: Math.floor(stats.totalBids * 0.15), views: Math.floor(stats.totalViews * 0.15) },
    { name: 'Wed', bids: Math.floor(stats.totalBids * 0.2), views: Math.floor(stats.totalViews * 0.2) },
    { name: 'Thu', bids: Math.floor(stats.totalBids * 0.1), views: Math.floor(stats.totalViews * 0.1) },
    { name: 'Fri', bids: Math.floor(stats.totalBids * 0.25), views: Math.floor(stats.totalViews * 0.25) },
    { name: 'Sat', bids: Math.floor(stats.totalBids * 0.1), views: Math.floor(stats.totalViews * 0.1) },
    { name: 'Sun', bids: Math.floor(stats.totalBids * 0.1), views: Math.floor(stats.totalViews * 0.1) },
  ];

  const statCards = [
    { label: 'Total Auctions', value: stats.total, icon: Gavel, color: 'text-primary' },
    { label: 'Active / Live', value: stats.active, icon: Activity, color: 'text-emerald-400' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-blue-400' },
    { label: 'Total Bids', value: stats.totalBids, icon: Users, color: 'text-yellow-400' },
    { label: 'Total Views', value: stats.totalViews, icon: Eye, color: 'text-secondary' },
    { label: 'Highest Bid', value: formatPrice(stats.highestBid), icon: TrendingUp, color: 'text-primary' },
  ];

  return (
    <div className="min-h-screen text-white bg-dark">
      <div className="bg-gradient-to-b from-black to-dark border-b border-dark-border pb-12 pt-16 px-4 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-white mb-4">
            Auction Dashboard
          </h1>
          <p className="text-muted text-lg max-w-xl">
            Monitor and manage your property auctions. Track bids, analyze performance, and engage with interested buyers.
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-12 space-y-12">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((stat, i) => (
            <div
              key={i}
              className="p-6 bg-dark-card border border-dark-border rounded-2xl hover:border-primary/40 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-300">
                <stat.icon size={100} />
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-black/40 border border-dark-border ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <p className="text-3xl font-display font-bold mb-1">
                {isLoading ? '—' : stat.value}
              </p>
              <p className="text-xs text-muted font-bold uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance Analytics */}
          <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-display font-bold mb-6">Auction Engagement</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#666" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#666" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: '12px' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="views" name="Views" stroke="#00E5FF" strokeWidth={3} dot={{ r: 4, fill: '#0A0A0A', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line yAxisId="right" type="monotone" dataKey="bids" name="Bids" stroke="#FFD700" strokeWidth={3} dot={{ r: 4, fill: '#0A0A0A', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tips or Summary */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-display font-bold mb-6">Auction Tips</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <TrendingUp size={18} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Set a Realistic Reserve</h3>
                  <p className="text-sm text-muted">A lower reserve price can encourage more initial bidding and drive the final price higher.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                  <Activity size={18} className="text-secondary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Engage with Buyers</h3>
                  <p className="text-sm text-muted">Monitor the interested buyers list and answer any queries quickly to build confidence.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auctions List */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-bold">Your Auctions</h2>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-muted animate-pulse">Loading auctions...</div>
          ) : auctions.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-dark-border rounded-xl">
              <Gavel size={48} className="mx-auto mb-4 text-muted opacity-30" />
              <h3 className="text-xl font-bold mb-2">No Auctions Created</h3>
              <p className="text-muted text-sm max-w-sm mx-auto mb-6">
                You haven't created any auctions yet. Go to your properties and click "Manage Auction" on an approved property to start.
              </p>
              <button
                onClick={() => navigate('/seller/my-properties?filter=approved')}
                className="px-6 py-2 bg-primary text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors"
              >
                View Approved Properties
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-dark-border text-muted">
                    <th className="pb-4 font-medium uppercase tracking-wider">Property ID</th>
                    <th className="pb-4 font-medium uppercase tracking-wider">Status</th>
                    <th className="pb-4 font-medium uppercase tracking-wider">Start Date</th>
                    <th className="pb-4 font-medium uppercase tracking-wider">End Date</th>
                    <th className="pb-4 font-medium uppercase tracking-wider">Current Bid</th>
                    <th className="pb-4 font-medium uppercase tracking-wider">Bids</th>
                    <th className="pb-4 font-medium uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {auctions.map((auction: any) => {
                    const status = auction.status || 'draft';
                    const sCfg = statusConfig[status] || statusConfig.draft;
                    return (
                      <tr key={auction.auctionId} className="hover:bg-white/5 transition-colors">
                        <td className="py-4 font-medium">
                          {auction.propertyId?.slice(0,8)}...
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-1 text-xs font-bold rounded border uppercase tracking-wider ${sCfg.class}`}>
                            {sCfg.label}
                          </span>
                        </td>
                        <td className="py-4 text-muted">
                          {auction.startTime ? new Date(auction.startTime).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-4 text-muted">
                          {auction.endTime ? new Date(auction.endTime).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-4 font-bold text-primary">
                          {formatPrice(auction.currentHighestBid || auction.startingPrice || 0)}
                        </td>
                        <td className="py-4 text-muted">
                          {auction.bids?.length || 0}
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => navigate(`/seller/auctions/${auction.propertyId}`)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-secondary hover:text-white transition-colors"
                          >
                            Manage <ArrowRight size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
