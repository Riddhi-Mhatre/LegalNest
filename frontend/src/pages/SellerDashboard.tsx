import { Building2, Plus, Eye, TrendingUp, Clock, CheckCircle, XCircle, BarChart2, FileText } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { getSellerDashboard, getSellerProperties } from '../services/sellerService';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const revenueData = [
  { name: 'Jan', value: 45000 },
  { name: 'Feb', value: 52000 },
  { name: 'Mar', value: 38000 },
  { name: 'Apr', value: 65000 },
  { name: 'May', value: 89000 },
  { name: 'Jun', value: 120000 },
];

// Helper to resolve city/state from either flat fields or nested location object
const getCity = (p: any) => p.city ?? p.location?.city ?? '—';
const getState = (p: any) => p.state ?? p.location?.state ?? '—';
const getPrice = (p: any) => {
  const raw = p.salePrice ?? p.rentPrice ?? p.price ?? 0;
  if (!raw) return '—';
  return `₹${Number(raw).toLocaleString('en-IN')}`;
};
const getStatus = (p: any) =>
  p.verificationStatus ?? p.status ?? 'pending';

const statusConfig: Record<string, { label: string; class: string }> = {
  verified: { label: 'Verified', class: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  approved: { label: 'Approved', class: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  pending: { label: 'Pending', class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  rejected: { label: 'Rejected', class: 'bg-red-500/20 text-red-400 border-red-500/30' },
  draft: { label: 'Draft', class: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
};

export default function SellerDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

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

  const stats = [
    {
      label: 'Total Listings',
      value: dashLoading ? '—' : String(dashboard?.totalProperties ?? 0),
      icon: Building2,
      color: 'text-primary',
    },
    {
      label: 'Pending Approval',
      value: dashLoading ? '—' : String(dashboard?.pendingApproval ?? 0),
      icon: Clock,
      color: 'text-yellow-400',
    },
    {
      label: 'Approved',
      value: dashLoading ? '—' : String(dashboard?.approved ?? 0),
      icon: CheckCircle,
      color: 'text-emerald-400',
    },
    {
      label: 'Total Views',
      value: dashLoading ? '—' : String(dashboard?.totalViews ?? 0),
      icon: Eye,
      color: 'text-secondary',
    },
    {
      label: 'Rejected',
      value: dashLoading ? '—' : String(dashboard?.rejected ?? 0),
      icon: XCircle,
      color: 'text-red-400',
    },
  ];

  // Build trending data from real properties
  const trendingData = (properties as any[])
    .slice(0, 5)
    .map((p: any) => ({
      name: p.title?.slice(0, 16) ?? 'Property',
      views: p.viewsCount ?? p.viewCount ?? 0,
    }));

  return (
    <div className="min-h-screen text-white px-4 py-12 md:px-12">
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-fade-in">
          <div>
            <p className="text-muted text-sm uppercase tracking-widest mb-2">Welcome back, {user?.email?.split('@')[0] ?? 'Seller'}</p>
            <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
              Seller<br />HQ.
            </h1>
            <p className="text-muted mt-3 text-base font-light tracking-wide max-w-md">
              Command center for your premium real estate portfolio.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/seller/documents')}
              className="flex items-center gap-2 px-6 py-4 border border-secondary/40 text-secondary hover:bg-secondary/10 font-bold uppercase tracking-widest transition-colors duration-300 rounded-none"
            >
              <FileText size={18} />
              Upload Docs
            </button>
            <button
              onClick={() => navigate('/seller/add-property')}
              className="bg-primary text-black font-bold uppercase tracking-widest px-8 py-4 hover:bg-yellow-400 transition-colors duration-300 flex items-center justify-center gap-3 group rounded-none"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              New Listing
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="relative p-6 border border-dark-border bg-dark-card overflow-hidden group hover:border-primary/40 transition-colors duration-500 animate-slide-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="absolute -right-3 -top-3 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                <stat.icon size={80} />
              </div>
              <p className="text-xs text-muted uppercase tracking-widest mb-3">{stat.label}</p>
              <p className={`text-4xl font-display font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">

          {/* Revenue Chart */}
          <div className="border border-dark-border bg-dark-card p-6 md:p-8 animate-slide-up" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="text-secondary" />
              <h2 className="text-xl font-display font-bold uppercase tracking-wide">Revenue Trend</h2>
              <span className="ml-auto text-xs text-muted bg-dark-border px-2 py-1 rounded">Sample Data</span>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#008080" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#008080" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: '0' }}
                    itemStyle={{ color: '#008080' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#008080" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Views Per Property */}
          <div className="border border-dark-border bg-dark-card p-6 md:p-8 animate-slide-up" style={{ animationDelay: '500ms' }}>
            <div className="flex items-center gap-3 mb-8">
              <BarChart2 className="text-primary" />
              <h2 className="text-xl font-display font-bold uppercase tracking-wide">Views Per Listing</h2>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendingData.length ? trendingData : [{ name: 'No data yet', views: 0 }]} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" horizontal={false} />
                  <XAxis type="number" stroke="#666" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#666" tick={{ fill: '#ccc', fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip
                    cursor={{ fill: '#1A1A1A' }}
                    contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: '0' }}
                    itemStyle={{ color: '#FFD700' }}
                  />
                  <Bar dataKey="views" fill="#FFD700" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Properties Table */}
        <div className="border border-dark-border bg-dark-card p-6 md:p-8 animate-slide-up" style={{ animationDelay: '600ms' }}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-bold uppercase tracking-wide">Portfolio Directory</h2>
            <span className="text-xs text-muted bg-dark-border px-3 py-1 rounded-full">
              {(properties as any[]).length} listing{(properties as any[]).length !== 1 ? 's' : ''}
            </span>
          </div>

          {propsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-dark-border/40 rounded animate-pulse" />
              ))}
            </div>
          ) : (properties as any[]).length === 0 ? (
            <div className="text-center py-20 border border-dashed border-dark-border bg-black/20 rounded-lg">
              <Building2 size={48} className="mx-auto mb-4 text-muted opacity-30" />
              <p className="text-muted tracking-wide mb-4">NO PROPERTIES LISTED</p>
              <button
                onClick={() => navigate('/seller/add-property')}
                className="text-primary text-sm hover:underline font-bold"
              >
                + Add your first property
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {(properties as any[]).map((property: any) => {
                const status = getStatus(property);
                const cfg = statusConfig[status] ?? statusConfig.pending;
                return (
                  <div
                    key={property.propertyId}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-dark-border bg-black/50 hover:border-primary/40 transition-colors group cursor-pointer rounded"
                    onClick={() => navigate(`/properties/${property.propertyId}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-dark-hover flex items-center justify-center flex-shrink-0 rounded">
                        {property.images?.[0] ? (
                          <img src={property.images[0]} alt="" className="w-full h-full object-cover rounded" />
                        ) : (
                          <Building2 size={22} className="text-muted group-hover:text-primary transition-colors" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-base group-hover:text-primary transition-colors">{property.title}</h3>
                        <p className="text-sm text-muted">{getCity(property)}, {getState(property)}</p>
                      </div>
                    </div>

                    <div className="mt-3 md:mt-0 flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-xs text-muted uppercase tracking-wider mb-1">Status</p>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${cfg.class}`}>{cfg.label}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted uppercase tracking-wider mb-1">Price</p>
                        <p className="font-bold text-primary">{getPrice(property)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted uppercase tracking-wider mb-1">Views</p>
                        <p className="font-bold text-secondary">{property.viewsCount ?? property.viewCount ?? 0}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
