import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSellerAuction, scheduleSellerAuction,
  getSellerAuctionBids, getInterestedBuyers, getSellerProperties
} from '../../../services/sellerService';
import { formatPrice, formatDateTime } from '../../../utils/formatters';
import { toast } from 'sonner';
import { useState } from 'react';
import type { Bid, CreateAuctionPayload } from '../../../types/auction.types';
import {
  ArrowLeft, Gavel, Activity, Users, TrendingUp,
  Clock, CheckCircle, Building2, MapPin, Loader2,
  CalendarClock, DollarSign, Target
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getCity  = (p: any) => p.city  ?? p.location?.city  ?? '—';
const getState = (p: any) => p.state ?? p.location?.state ?? '—';

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  scheduled: { label: 'Scheduled', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  live:       { label: 'Live',      cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  active:     { label: 'Live',      cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  completed:  { label: 'Closed',   cls: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  ended:      { label: 'Closed',   cls: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  cancelled:  { label: 'Cancelled', cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

const inputCls = 'w-full bg-black border border-dark-border rounded-lg px-4 py-3 text-white placeholder-muted focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary transition-all';
const labelCls = 'block text-xs text-muted font-bold uppercase tracking-wider mb-2';

// ─── Create Auction Form (inline, when no auction exists yet) ─────────────────
interface CreateFormProps { propertyId: string; onSuccess: () => void }

function CreateAuctionForm({ propertyId, onSuccess }: CreateFormProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ startingPrice: '', reservePrice: '', bidIncrement: '', startTime: '', endTime: '' });
  const setF = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: CreateAuctionPayload) => scheduleSellerAuction(propertyId, payload),
    onSuccess: () => {
      toast.success('Auction created successfully!');
      queryClient.invalidateQueries({ queryKey: ['sellerAuction', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['seller', 'auctions'] });
      queryClient.invalidateQueries({ queryKey: ['seller', 'properties'] });
      onSuccess();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message ?? 'Failed to create auction');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sp = Number(form.startingPrice);
    const rp = Number(form.reservePrice);
    const bi = Number(form.bidIncrement);
    const st = new Date(form.startTime);
    const et = new Date(form.endTime);

    if (!sp || !rp || !bi || !form.startTime || !form.endTime) return toast.error('All fields are required');
    if (st <= new Date()) return toast.error('Start date cannot be in the past');
    if (et <= st) return toast.error('End date must be after start date');
    if (rp < sp) return toast.error('Reserve price must be ≥ starting price');
    if (bi <= 0) return toast.error('Bid increment must be greater than 0');

    mutate({ startingPrice: sp, reservePrice: rp, bidIncrement: bi, startTime: st.toISOString(), endTime: et.toISOString() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelCls}>Starting Price (₹)</label>
          <input className={inputCls} type="number" min="1" placeholder="e.g. 5000000" value={form.startingPrice} onChange={e => setF('startingPrice', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Reserve Price (₹)</label>
          <input className={inputCls} type="number" min="1" placeholder="e.g. 6000000" value={form.reservePrice} onChange={e => setF('reservePrice', e.target.value)} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Bid Increment (₹)</label>
        <input className={inputCls} type="number" min="1" placeholder="e.g. 50000" value={form.bidIncrement} onChange={e => setF('bidIncrement', e.target.value)} />
        <p className="text-xs text-muted mt-1">Minimum amount each new bid must exceed the previous.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelCls}>Start Date & Time</label>
          <input className={inputCls} type="datetime-local" value={form.startTime} onChange={e => setF('startTime', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>End Date & Time</label>
          <input className={inputCls} type="datetime-local" value={form.endTime} onChange={e => setF('endTime', e.target.value)} />
        </div>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-black font-bold rounded-xl hover:bg-yellow-400 transition-all hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(255,215,0,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending ? <><Loader2 size={18} className="animate-spin" /> Creating...</> : <><Gavel size={18} /> Create Auction</>}
      </button>
    </form>
  );
}

// ─── Stat Mini Card ───────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }: { label: string; value: any; icon: any; color: string }) {
  return (
    <div className="p-4 bg-black/40 border border-dark-border rounded-xl">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 bg-dark-hover ${color}`}>
        <Icon size={16} />
      </div>
      <p className="text-xl font-display font-bold mb-0.5">{value}</p>
      <p className="text-[10px] text-muted font-bold uppercase tracking-wider">{label}</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SellerAuctionManagementPage() {
  const { id: propertyId } = useParams<{ id: string }>();

  // Property info from seller's property list
  const { data: properties = [] } = useQuery({
    queryKey: ['seller', 'properties'],
    queryFn: getSellerProperties,
  });
  const property = (properties as any[]).find(p => p.propertyId === propertyId);

  // Auction details for this property
  const { data: auction, isLoading: auctionLoading, refetch: refetchAuction } = useQuery({
    queryKey: ['sellerAuction', propertyId],
    queryFn: () => getSellerAuction(propertyId!),
    enabled: !!propertyId,
  });

  // Bids — poll every 5s when live
  const { data: bids = [] } = useQuery<Bid[]>({
    queryKey: ['sellerAuctionBids', propertyId],
    queryFn: () => getSellerAuctionBids(propertyId!),
    enabled: !!auction?.auctionId,
    refetchInterval: auction?.status === 'live' ? 5000 : false,
  });

  // Interested buyers
  const { data: buyers = [] } = useQuery({
    queryKey: ['interestedBuyers', propertyId],
    queryFn: () => getInterestedBuyers(propertyId!),
    enabled: !!propertyId,
  });

  if (auctionLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  const statusCfg = auction ? (STATUS_CFG[auction.status] ?? STATUS_CFG.scheduled) : null;
  const isLive = auction?.status === 'live';
  const highestBid = bids.length > 0 ? Math.max(...bids.map((b: Bid) => b.amount)) : 0;
  const highestBidder = bids.find((b: Bid) => b.amount === highestBid);
  const totalBids = bids.length;

  return (
    <div className="min-h-screen text-white bg-dark">
      {/* Hero */}
      <div className="bg-gradient-to-b from-black to-dark border-b border-dark-border pb-10 pt-14 px-4 md:px-12">
        <div className="max-w-6xl mx-auto">
          <Link
            to="/seller/auctions"
            className="inline-flex items-center gap-2 text-muted hover:text-white transition-colors mb-6 text-sm"
          >
            <ArrowLeft size={15} /> Back to Auction Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Auction Management</p>
              <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight text-white mb-2">
                {property?.title ?? `Property ${propertyId?.slice(0, 8)}…`}
              </h1>
              {property && (
                <p className="text-muted flex items-center gap-1.5">
                  <MapPin size={13} /> {getCity(property)}, {getState(property)}
                </p>
              )}
            </div>
            {statusCfg && (
              <span className={`inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full border ${statusCfg.cls}`}>
                {isLive && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                {statusCfg.label}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-12 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">

            {/* Auction Config / Create Form */}
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Gavel size={18} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold">Auction Configuration</h2>
                  <p className="text-muted text-sm">{auction ? 'Current auction details' : 'Set up your auction'}</p>
                </div>
              </div>

              {!auction ? (
                <CreateAuctionForm propertyId={propertyId!} onSuccess={() => refetchAuction()} />
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <StatCard label="Starting Price" value={formatPrice(auction.startingPrice)} icon={DollarSign} color="text-muted" />
                    <StatCard label="Reserve Price" value={formatPrice(auction.reservePrice)} icon={Target} color="text-yellow-400" />
                    <StatCard label="Bid Increment" value={formatPrice(auction.bidIncrement ?? 0)} icon={TrendingUp} color="text-secondary" />
                    <StatCard label="Current Bid" value={formatPrice(auction.currentHighestBid || auction.startingPrice)} icon={TrendingUp} color="text-primary" />
                    <StatCard label="Total Bids" value={totalBids} icon={Users} color="text-blue-400" />
                    <StatCard label="Extensions" value={`${auction.extensionCount ?? 0} / ${auction.maxExtensions ?? 3}`} icon={Clock} color="text-muted" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-black/40 border border-dark-border rounded-xl">
                      <p className="text-xs text-muted font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <CalendarClock size={12} /> Start Time
                      </p>
                      <p className="font-bold text-white text-sm">{auction.startTime ? formatDateTime(auction.startTime) : '—'}</p>
                    </div>
                    <div className="p-4 bg-black/40 border border-dark-border rounded-xl">
                      <p className="text-xs text-muted font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <CalendarClock size={12} /> End Time
                      </p>
                      <p className="font-bold text-white text-sm">{auction.endTime ? formatDateTime(auction.endTime) : '—'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bid History */}
            {auction && (
              <div className="bg-dark-card border border-dark-border rounded-2xl p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                      <Activity size={18} className="text-secondary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-display font-bold">Bid History</h2>
                      <p className="text-muted text-sm">{totalBids} bid{totalBids !== 1 ? 's' : ''} placed</p>
                    </div>
                  </div>
                  {isLive && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                    </span>
                  )}
                </div>

                {bids.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-dark-border rounded-xl bg-black/20">
                    <Activity size={32} className="mx-auto mb-3 text-muted opacity-30" />
                    <p className="text-muted text-sm">No bids placed yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Highest bidder highlight */}
                    {highestBidder && (
                      <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <TrendingUp size={14} className="text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted font-bold uppercase tracking-wider">Current Leader</p>
                            <p className="font-bold text-white text-sm">{highestBidder.bidderName ?? 'Unknown Bidder'}</p>
                          </div>
                        </div>
                        <p className="text-xl font-display font-bold text-primary">{formatPrice(highestBid)}</p>
                      </div>
                    )}

                    {/* Bid table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-dark-border text-muted">
                            <th className="pb-3 font-medium uppercase tracking-wider text-xs">#</th>
                            <th className="pb-3 font-medium uppercase tracking-wider text-xs">Bidder</th>
                            <th className="pb-3 font-medium uppercase tracking-wider text-xs">Amount</th>
                            <th className="pb-3 font-medium uppercase tracking-wider text-xs">Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border">
                          {[...bids].reverse().map((bid: Bid, i) => (
                            <tr key={bid.bidId ?? i} className="hover:bg-white/5 transition-colors">
                              <td className="py-3 text-muted text-xs">{totalBids - i}</td>
                              <td className="py-3 font-medium text-white">
                                {bid.bidderName ?? 'Unknown Bidder'}
                                {bid.amount === highestBid && (
                                  <span className="ml-2 text-[9px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded-full uppercase">Top</span>
                                )}
                              </td>
                              <td className="py-3 font-bold text-primary">{formatPrice(bid.amount)}</td>
                              <td className="py-3 text-muted text-xs">
                                {bid.createdAt
                                  ? new Date(bid.createdAt).toLocaleTimeString('en-IN')
                                  : bid.timestamp
                                  ? new Date(bid.timestamp).toLocaleTimeString('en-IN')
                                  : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Property Preview */}
            {property && (
              <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
                <div className="h-36 relative bg-black overflow-hidden">
                  {property.images?.[0] ? (
                    <img src={property.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted"><Building2 size={28} /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
                <div className="p-5">
                  <h3 className="font-display font-bold text-white line-clamp-1 mb-1">{property.title}</h3>
                  <p className="text-xs text-muted flex items-center gap-1"><MapPin size={11} /> {getCity(property)}, {getState(property)}</p>
                </div>
              </div>
            )}

            {/* Auction Stats */}
            {auction && (
              <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <CheckCircle size={16} className="text-secondary" />
                  <h3 className="font-display font-bold text-white">Auction Stats</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Highest Bid', value: formatPrice(auction.currentHighestBid || auction.startingPrice) },
                    { label: 'Starting Price', value: formatPrice(auction.startingPrice) },
                    { label: 'Reserve Price', value: formatPrice(auction.reservePrice) },
                    { label: 'Total Bids', value: totalBids },
                    { label: 'Unique Bidders', value: new Set(bids.map((b: Bid) => b.bidderId ?? b.userId)).size },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-dark-border last:border-0">
                      <span className="text-xs text-muted font-medium">{item.label}</span>
                      <span className="text-sm font-bold text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interested Buyers */}
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <Users size={16} className="text-primary" />
                <h3 className="font-display font-bold text-white">Interested Buyers</h3>
                <span className="ml-auto text-xs text-muted font-bold">{(buyers as any[]).length}</span>
              </div>
              {(buyers as any[]).length === 0 ? (
                <p className="text-sm text-muted text-center py-4">No buyers yet.</p>
              ) : (
                <div className="space-y-3">
                  {(buyers as any[]).map((b: any) => (
                    <div key={b.userId} className="flex items-center gap-3 p-3 bg-black/30 rounded-lg border border-dark-border">
                      <div className="w-8 h-8 rounded-full bg-dark-hover flex items-center justify-center shrink-0">
                        <Users size={12} className="text-muted" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{b.name}</p>
                        <p className="text-xs text-muted truncate">{b.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info card */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
              <h3 className="font-bold text-primary mb-3 text-sm">How Auctions Work</h3>
              <ul className="text-xs text-white/70 space-y-2 leading-relaxed">
                {[
                  'Set a starting price to begin bidding.',
                  'Reserve price is your minimum acceptable offer.',
                  'Bid increment is the minimum raise per bid.',
                  'Auction auto-extends if bid placed near end.',
                  'Winner is buyer with the highest bid when auction closes.',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
