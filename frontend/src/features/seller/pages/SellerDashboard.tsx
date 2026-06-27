import { useState } from 'react';
import { Building2, Plus, Eye, Clock, CheckCircle, BarChart2, ChevronRight, MessageSquare, ShieldCheck, AlertCircle, X, MapPin } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { getSellerDashboard, getSellerProperties } from '../../../services/sellerService';
import { getSellerInquiries } from '../../../services/inquiryService';
import { useNavigate } from 'react-router-dom';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const getCity = (p: any) => p.city ?? p.location?.city ?? '—';
const getState = (p: any) => p.state ?? p.location?.state ?? '—';
const getPrice = (p: any) => {
  const raw = p.salePrice ?? p.rentPrice ?? p.price ?? 0;
  if (!raw) return '—';
  return `₹${Number(raw).toLocaleString('en-IN')}`;
};
const getStatus = (p: any) => {
  if (p.status === 'sold') return 'sold';
  return p.verificationStatus ?? p.status ?? 'pending';
};

const statusConfig: Record<string, { label: string; class: string }> = {
  verified: { label: 'Verified', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  approved: { label: 'Verified', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  pending: { label: 'Verified', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  rejected: { label: 'Rejected', class: 'bg-red-500/10 text-red-400 border-red-500/20' },
  draft: { label: 'Draft', class: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
  sold: { label: 'Sold', class: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
};

export default function SellerDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [showViewersModal, setShowViewersModal] = useState(false);

  const {
    data: dashboard,
    isLoading: dashLoading,
  } = useQuery({
    queryKey: ['seller', 'dashboard'],
    queryFn: getSellerDashboard,
  });

  const {
    data: properties = [],
    isLoading: propsLoading,
  } = useQuery({
    queryKey: ['seller', 'properties'],
    queryFn: getSellerProperties,
  });

  const {
    data: inquiries = [],
    isLoading: inqLoading,
  } = useQuery({
    queryKey: ['inquiries', 'seller'],
    queryFn: getSellerInquiries,
    enabled: !!user,
  });

  const totalInquiries = (inquiries as any[]).length;

  const stats = [
    {
      label: 'Total Listings',
      value: dashLoading ? '—' : String(dashboard?.totalProperties ?? 0),
      icon: Building2,
      color: 'text-primary',
      onClick: () => navigate('/seller/my-properties?filter=all'),
    },
    {
      label: 'Sold Properties',
      value: propsLoading ? '—' : String((properties as any[]).filter(p => p.status === 'sold').length),
      icon: CheckCircle,
      color: 'text-emerald-400',
      onClick: () => navigate('/seller/sold-properties'),
    },
    {
      label: 'Total Views',
      value: dashLoading ? '—' : String(dashboard?.totalViews ?? 0),
      icon: Eye,
      color: 'text-secondary',
      onClick: () => setShowViewersModal(true),
    },
    {
      label: 'Total Inquiries',
      value: inqLoading ? '—' : String(totalInquiries),
      icon: MessageSquare,
      color: 'text-blue-400',
      onClick: () => navigate('/seller/chat'),
    },
  ];

  // Aggregate viewers from all properties for the modal
  const allViewers = (properties as any[])
    .flatMap(p => p.viewers || [])
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const trendingData = (properties as any[])
    .slice(0, 5)
    .map((p: any) => ({
      name: p.title?.slice(0, 16) ?? 'Property',
      views: p.viewsCount ?? p.viewCount ?? 0,
    }));

  return (
    <div className="min-h-screen text-white bg-dark">
      {/* Top Navigation / Hero Area */}
      <div className="bg-gradient-to-b from-black to-dark border-b border-dark-border pb-12 pt-16 px-4 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-primary font-bold text-sm tracking-widest uppercase mb-2">Welcome, {user?.name || 'Seller'}</p>
              <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight text-white mb-4">
                Dashboard
              </h1>
              <p className="text-muted text-lg max-w-xl">
                Manage your premium real estate portfolio, track performance, and handle inquiries seamlessly.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/seller/identity-documents')}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-dark-hover border border-dark-border rounded-xl font-bold hover:bg-white/5 transition-all text-sm"
              >
                <ShieldCheck size={18} />
                Identity Documents
              </button>
              <button
                onClick={() => navigate('/seller/add-property')}
                className="flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-black rounded-xl font-bold hover:bg-yellow-400 hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] transition-all transform hover:-translate-y-0.5 text-sm"
              >
                <Plus size={18} />
                New Listing
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-12 space-y-12">

        {!user?.isVerified && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 -mb-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-400 shrink-0" size={24} />
              <div>
                <h3 className="text-red-400 font-bold">Action Required: Verify Your Identity</h3>
                <p className="text-red-200/80 text-sm">Please upload your identity documents to become a verified seller.</p>
              </div>
            </div>
            <button onClick={() => navigate('/seller/identity-documents')} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold transition-colors whitespace-nowrap">
              Upload Documents
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              onClick={stat.onClick}
              className={`relative p-6 bg-dark-card border border-dark-border rounded-2xl overflow-hidden group hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer`}
            >
              <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-300">
                <stat.icon size={100} />
              </div>
              <div className="flex flex-col h-full justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-black/40 border border-dark-border ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <div>
                  <p className="text-3xl font-display font-bold mb-1">{stat.value}</p>
                  <p className="text-xs text-muted font-bold uppercase tracking-wider">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-display font-bold mb-1">Listing Performance</h2>
                <p className="text-sm text-muted">Views per property over time</p>
              </div>
              <BarChart2 className="text-primary opacity-50" size={24} />
            </div>
            
            <div className="h-[300px] w-full">
              {propsLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendingData.length ? trendingData : [{ name: 'No data', views: 0 }]} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: '#1A1A1A' }}
                      contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: '12px' }}
                      itemStyle={{ color: '#FFD700', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="views" fill="#FFD700" radius={[4, 4, 0, 0]} maxBarSize={60}>
                      {
                        trendingData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#FFD700' : '#CCAC00'} />
                        ))
                      }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 md:p-8 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-display font-bold">Recent Activity</h2>
            </div>
            
            <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
              {propsLoading ? (
                [1, 2, 3].map(i => <div key={i} className="h-16 bg-dark-border/40 rounded-xl animate-pulse" />)
              ) : (properties as any[]).length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted opacity-50">
                  <Clock size={32} className="mb-2" />
                  <p className="text-sm">No recent activity</p>
                </div>
              ) : (
                (properties as any[]).slice(0, 4).map((prop: any, i) => (
                  <div key={i} className="flex gap-4 relative">
                    {i !== 3 && <div className="absolute left-[11px] top-8 bottom-[-24px] w-0.5 bg-dark-border" />}
                    <div className="w-6 h-6 rounded-full bg-black border-2 border-primary flex items-center justify-center shrink-0 z-10 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white mb-1">
                        Property Verified
                      </p>
                      <p className="text-xs text-muted line-clamp-1">{prop.title}</p>
                      <p className="text-xs text-muted mt-1">{new Date(prop.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Properties */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-display font-bold">Recent Properties</h2>
              <p className="text-sm text-muted mt-1">Manage your latest uploaded listings</p>
            </div>
            <button
              onClick={() => navigate('/seller/my-properties?filter=all')}
              className="flex items-center gap-2 text-sm font-bold text-primary hover:text-yellow-400 transition-colors group"
            >
              View All <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {propsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-dark-border/40 rounded-xl animate-pulse" />)}
            </div>
          ) : (properties as any[]).length === 0 ? (
            <div className="text-center py-16 border border-dashed border-dark-border rounded-xl bg-black/20">
              <Building2 size={40} className="mx-auto mb-4 text-muted opacity-30" />
              <p className="text-muted font-bold tracking-wide mb-2">NO PROPERTIES FOUND</p>
              <button onClick={() => navigate('/seller/add-property')} className="text-primary text-sm hover:underline">
                Upload your first property
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {(properties as any[])
                .filter(p => getStatus(p) !== 'sold')
                .slice(0, 5)
                .map((property: any) => {
                const status = getStatus(property);
                const cfg = statusConfig[status] ?? statusConfig.pending;
                return (
                  <div
                    key={property.propertyId}
                    onClick={() => navigate(`/properties/${property.propertyId}`)}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-black/40 border border-dark-border rounded-xl hover:border-primary/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-20 h-20 bg-dark-hover rounded-lg overflow-hidden shrink-0 border border-dark-border">
                        {property.images?.[0] ? (
                          <img src={property.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Building2 size={24} className="text-muted" /></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-lg group-hover:text-primary transition-colors mb-1">{property.title}</h3>
                        <p className="text-sm text-muted">{getCity(property)}, {getState(property)}</p>
                      </div>
                    </div>

                    <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-6">
                      <div className="text-left md:text-right">
                        <p className="text-[10px] text-muted uppercase tracking-wider font-bold mb-1.5">Price</p>
                        <p className="font-bold text-white">{getPrice(property)}</p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-[10px] text-muted uppercase tracking-wider font-bold mb-1.5">Views</p>
                        <p className="font-bold text-white flex items-center justify-end gap-1"><Eye size={14} className="text-muted" /> {property.viewsCount ?? property.viewCount ?? 0}</p>
                      </div>
                      <div className="text-left md:text-right min-w-[120px]">
                        <p className="text-[10px] text-muted uppercase tracking-wider font-bold mb-1.5">Status</p>
                        <span className={`inline-block text-[11px] font-bold px-3 py-1 rounded-full border ${cfg.class}`}>{cfg.label}</span>
                      </div>
                      <div className="hidden md:flex pl-4 border-l border-dark-border">
                        <ChevronRight className="text-muted group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Viewers Modal */}
      {showViewersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-dark-border flex items-center justify-between bg-black/40">
              <div>
                <h2 className="text-2xl font-display font-bold text-white">Recent Profile Views</h2>
                <p className="text-sm text-muted">Users who have recently viewed your properties</p>
              </div>
              <button 
                onClick={() => setShowViewersModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-dark-hover hover:bg-white/10 transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {allViewers.length === 0 ? (
                <div className="text-center py-12">
                  <Eye size={48} className="mx-auto mb-4 text-muted opacity-20" />
                  <h3 className="text-lg font-bold text-white mb-1">No Viewer Data Yet</h3>
                  <p className="text-muted text-sm max-w-md mx-auto">
                    New viewer tracking has just been enabled. Future views from logged-in users will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allViewers.map((viewer: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-dark-border bg-dark/50 hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-dark flex items-center justify-center border border-dark-border shadow-inner">
                          <Eye size={16} className="text-secondary" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{viewer.viewerName}</p>
                          <div className="flex items-center gap-1.5 text-xs text-muted mt-0.5">
                            <MapPin size={10} className="text-primary" />
                            <span className="line-clamp-1">Viewed: {viewer.propertyTitle}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted font-bold">
                          {new Date(viewer.timestamp).toLocaleDateString()}
                        </p>
                        <p className="text-[10px] text-muted opacity-70">
                          {new Date(viewer.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
