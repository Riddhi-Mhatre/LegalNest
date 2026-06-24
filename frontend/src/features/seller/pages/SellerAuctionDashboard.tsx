import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSellerAuctions, getSellerProperties, scheduleSellerAuction } from '../../../services/sellerService';
import { formatPrice } from '../../../utils/formatters';
import { toast } from 'sonner';
import type { Auction, CreateAuctionPayload } from '../../../types/auction.types';
import {
  Gavel, CheckCircle, Activity, TrendingUp, Users,
  ArrowRight, X, Building2, MapPin, Plus, Loader2,
  CalendarClock, ShieldAlert
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getCity  = (p: any) => p.city  ?? p.location?.city  ?? '—';
const getState = (p: any) => p.state ?? p.location?.state ?? '—';
const getPrice = (p: any) => {
  const raw = p.salePrice ?? p.rentPrice ?? p.price ?? 0;
  return raw ? `₹${Number(raw).toLocaleString('en-IN')}` : '—';
};

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  scheduled: { label: 'Scheduled', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  live:       { label: 'Live',      cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  active:     { label: 'Live',      cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  completed:  { label: 'Closed',   cls: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
  ended:      { label: 'Closed',   cls: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
  cancelled:  { label: 'Cancelled', cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

// ─── Create Auction Modal ─────────────────────────────────────────────────────
interface CreateAuctionModalProps {
  property: any;
  onClose: () => void;
  onSuccess: () => void;
}

function CreateAuctionModal({ property, onClose, onSuccess }: CreateAuctionModalProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    startingPrice: '',
    reservePrice: '',
    bidIncrement: '',
    startTime: '',
    endTime: '',
  });

  const setF = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: CreateAuctionPayload) =>
      scheduleSellerAuction(property.propertyId, payload),
    onSuccess: () => {
      toast.success('Auction created successfully!');
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

    if (!sp || !rp || !bi || !form.startTime || !form.endTime) {
      return toast.error('All fields are required');
    }
    if (st <= new Date()) {
      return toast.error('Start date cannot be in the past');
    }
    if (et <= st) {
      return toast.error('End date must be after start date');
    }
    if (rp < sp) {
      return toast.error('Reserve price must be ≥ starting price');
    }
    if (bi <= 0) {
      return toast.error('Bid increment must be greater than 0');
    }

    mutate({
      startingPrice: sp,
      reservePrice: rp,
      bidIncrement: bi,
      startTime: st.toISOString(),
      endTime: et.toISOString(),
    });
  };

  const inputCls = 'w-full bg-black border border-dark-border rounded-lg px-4 py-3 text-white placeholder-muted focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary transition-all';
  const labelCls = 'block text-xs text-muted font-bold uppercase tracking-wider mb-2';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-dark-card border border-dark-border rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Gavel size={18} className="text-primary" />
              <span className="text-xs text-primary font-bold uppercase tracking-widest">Create Auction</span>
            </div>
            <h2 className="text-2xl font-display font-bold text-white line-clamp-1">{property.title}</h2>
            <p className="text-sm text-muted mt-1">{getCity(property)}, {getState(property)}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
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
            <p className="text-xs text-muted mt-1">Minimum amount each new bid must exceed the previous bid by.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Start Date & Time</label>
              <input className={inputCls} type="datetime-local" value={form.startTime} onChange={e => setF('startTime', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>End Date & Time</label>
              <input className={inputCls} type="datetime-local" value={form.endTime} onChange={e => setF('endTime', e.target.value)} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-dark-border text-muted hover:text-white hover:border-white/30 font-bold transition-all text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-black font-bold hover:bg-yellow-400 transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              {isPending ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : <><Gavel size={16} /> Create Auction</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Auction Card (for dashboard list) ───────────────────────────────────────
interface AuctionListCardProps { auction: Auction; onManage: () => void }

function AuctionListCard({ auction, onManage }: AuctionListCardProps) {
  const cfg = STATUS_CFG[auction.status] ?? STATUS_CFG.scheduled;
  const isLive = auction.status === 'live';
  const bidsCount = auction.bids?.length ?? 0;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-black/40 border border-dark-border rounded-xl hover:border-primary/40 transition-all group">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-14 h-14 rounded-lg bg-dark-hover border border-dark-border flex items-center justify-center shrink-0">
          <Gavel size={22} className="text-muted" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted font-mono mb-1">{auction.propertyId.slice(0, 10)}…</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${cfg.cls}`}>
              {isLive && <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1 animate-pulse" />}
              {cfg.label}
            </span>
            <span className="text-xs text-muted">{bidsCount} bid{bidsCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-6 text-sm">
        <div>
          <p className="text-[10px] text-muted uppercase tracking-wider font-bold mb-1">Current Bid</p>
          <p className="font-bold text-primary">{formatPrice(auction.currentHighestBid || auction.startingPrice || 0)}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted uppercase tracking-wider font-bold mb-1">Start</p>
          <p className="text-white text-xs">{auction.startTime ? new Date(auction.startTime).toLocaleDateString('en-IN') : '—'}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted uppercase tracking-wider font-bold mb-1">End</p>
          <p className="text-white text-xs">{auction.endTime ? new Date(auction.endTime).toLocaleDateString('en-IN') : '—'}</p>
        </div>
        <button
          onClick={onManage}
          className="flex items-center gap-1.5 text-xs font-bold text-secondary hover:text-white transition-colors group-hover:underline"
        >
          Manage <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Eligible Property Card ───────────────────────────────────────────────────
interface EligiblePropertyCardProps {
  property: any;
  onCreateAuction: () => void;
}

function EligiblePropertyCard({ property, onCreateAuction }: EligiblePropertyCardProps) {
  return (
    <div className="flex flex-col bg-dark-card border border-dark-border rounded-2xl overflow-hidden hover:border-primary/40 transition-all group">
      <div className="relative h-40 bg-black overflow-hidden">
        {property.images?.[0] ? (
          <img src={property.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted"><Building2 size={32} /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <span className="absolute bottom-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 uppercase tracking-wider">
          Approved
        </span>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-display font-bold text-white line-clamp-1 mb-1 group-hover:text-primary transition-colors">{property.title}</h3>
        <p className="text-xs text-muted flex items-center gap-1 mb-3"><MapPin size={11} /> {getCity(property)}, {getState(property)}</p>
        <p className="text-lg font-bold text-primary mb-4">{getPrice(property)}</p>
        <button
          onClick={onCreateAuction}
          className="mt-auto flex items-center justify-center gap-2 py-2.5 bg-primary text-black font-bold rounded-lg hover:bg-yellow-400 transition-all text-sm"
        >
          <Plus size={15} /> Create Auction
        </button>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const TABS = ['All', 'Scheduled', 'Live', 'Closed'] as const;
type Tab = typeof TABS[number];

export default function SellerAuctionDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('All');
  const [modalProperty, setModalProperty] = useState<any>(null);

  // Fetch all seller auctions
  const { data: auctionData, isLoading: auctionsLoading } = useQuery({
    queryKey: ['seller', 'auctions'],
    queryFn: getSellerAuctions,
  });

  // Fetch all seller properties to find eligible ones
  const { data: properties = [], isLoading: propsLoading } = useQuery({
    queryKey: ['seller', 'properties'],
    queryFn: getSellerProperties,
  });

  const stats = auctionData?.stats ?? { total: 0, active: 0, completed: 0, totalBids: 0, highestBid: 0, totalViews: 0 };
  const allAuctions: Auction[] = auctionData?.auctions ?? [];

  // Derive scheduled count from auction list (backend stats.active = live only)
  const scheduledCount = allAuctions.filter(a => a.status === 'scheduled').length;
  const liveCount = allAuctions.filter(a => a.status === 'live').length;
  const closedCount = allAuctions.filter(a => a.status === 'completed' || a.status === 'ended').length;

  // Properties eligible for auction: approved + no existing auction
  const propertyIdsWithAuction = new Set(allAuctions.map(a => a.propertyId));
  const eligibleProperties = (properties as any[]).filter(p => {
    const status = p.status ?? p.verificationStatus;
    return (status === 'approved' || status === 'verified') && !p.isAuctionRequested && !propertyIdsWithAuction.has(p.propertyId);
  });

  // Filter auctions by tab
  const filteredAuctions = allAuctions.filter(a => {
    const s = a.status;
    if (tab === 'All') return true;
    if (tab === 'Scheduled') return s === 'scheduled';
    if (tab === 'Live') return s === 'live';
    if (tab === 'Closed') return s === 'completed' || s === 'ended' || s === 'cancelled';
    return true;
  });

  const statCards = [
    { label: 'Total Auctions', value: stats.total, icon: Gavel, color: 'text-primary' },
    { label: 'Scheduled', value: scheduledCount, icon: CalendarClock, color: 'text-blue-400' },
    { label: 'Live', value: liveCount, icon: Activity, color: 'text-emerald-400' },
    { label: 'Closed', value: closedCount, icon: CheckCircle, color: 'text-gray-400' },
    { label: 'Total Bids', value: stats.totalBids, icon: Users, color: 'text-yellow-400' },
    { label: 'Highest Bid', value: formatPrice(stats.highestBid || 0), icon: TrendingUp, color: 'text-primary' },
  ];

  const isLoading = auctionsLoading || propsLoading;

  return (
    <div className="min-h-screen text-white bg-dark">
      {/* Hero */}
      <div className="bg-gradient-to-b from-black to-dark border-b border-dark-border pb-12 pt-16 px-4 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Seller</p>
          <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight text-white mb-4">Auction Dashboard</h1>
          <p className="text-muted text-lg max-w-xl">
            Monitor your property auctions, track bids in real time, and manage new auction creation.
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-12 space-y-12">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((s) => (
            <div key={s.label} className="p-6 bg-dark-card border border-dark-border rounded-2xl hover:border-primary/40 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-300">
                <s.icon size={100} />
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-black/40 border border-dark-border ${s.color}`}>
                <s.icon size={20} />
              </div>
              <p className="text-3xl font-display font-bold mb-1">{isLoading ? '—' : s.value}</p>
              <p className="text-xs text-muted font-bold uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Eligible Properties */}
        {(eligibleProperties.length > 0 || propsLoading) && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <ShieldAlert size={20} className="text-primary" />
              <div>
                <h2 className="text-2xl font-display font-bold">Properties Ready for Auction</h2>
                <p className="text-muted text-sm mt-0.5">Approved properties that don't have an auction yet.</p>
              </div>
            </div>
            {propsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <div key={i} className="h-64 bg-dark-card border border-dark-border rounded-2xl animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {eligibleProperties.map((prop: any) => (
                  <EligiblePropertyCard
                    key={prop.propertyId}
                    property={prop}
                    onCreateAuction={() => setModalProperty(prop)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Auctions List */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold">Your Auctions</h2>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-black/40 border border-dark-border rounded-xl p-1 mb-8 w-fit">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                  tab === t ? 'bg-primary text-black' : 'text-muted hover:text-white'
                }`}
              >
                {t}
                {t !== 'All' && (
                  <span className="ml-2 text-[10px] font-bold opacity-70">
                    {t === 'Scheduled' ? scheduledCount : t === 'Live' ? liveCount : closedCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {auctionsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-dark-border/40 rounded-xl animate-pulse" />)}
            </div>
          ) : filteredAuctions.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-dark-border rounded-xl bg-black/20">
              <Gavel size={40} className="mx-auto mb-4 text-muted opacity-30" />
              <h3 className="font-display font-bold text-white mb-2">No {tab !== 'All' ? tab : ''} Auctions</h3>
              <p className="text-muted text-sm max-w-sm mx-auto mb-6">
                {tab === 'All'
                  ? "You haven't created any auctions yet. Select an approved property above to get started."
                  : `No ${tab.toLowerCase()} auctions at this time.`}
              </p>
              {tab === 'All' && (
                <button
                  onClick={() => navigate('/seller/my-properties?filter=approved')}
                  className="px-6 py-2.5 bg-primary text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors text-sm"
                >
                  View Approved Properties
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAuctions.map((auction) => (
                <AuctionListCard
                  key={auction.auctionId}
                  auction={auction}
                  onManage={() => navigate(`/seller/auctions/${auction.propertyId}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Auction Modal */}
      {modalProperty && (
        <CreateAuctionModal
          property={modalProperty}
          onClose={() => setModalProperty(null)}
          onSuccess={() => { setModalProperty(null); navigate('/seller/auctions'); }}
        />
      )}
    </div>
  );
}
