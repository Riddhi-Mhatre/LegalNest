import { Building2, Plus, Eye, TrendingUp, DollarSign } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { getProperties } from '../services/propertyService';
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

const trendingData = [
  { name: 'Villa Nova', views: 4000 },
  { name: 'Skyline Apt', views: 3000 },
  { name: 'Oceanside', views: 2000 },
  { name: 'Urban Loft', views: 2780 },
  { name: 'The Manor', views: 1890 },
];

export default function SellerDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['properties', 'seller'],
    queryFn: () => getProperties(),
  });

  const myProperties = properties.filter((p: any) => p.sellerId === user?.userId);

  const stats = [
    { label: 'Active Listings', value: myProperties.length.toString(), icon: Building2 },
    { label: 'Total Views', value: '14.2k', icon: Eye },
    { label: 'Total Profit', value: '$1.2M', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-black text-white px-4 py-12 md:px-12 font-sans">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header - Brutalist typography */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 animate-fade-in">
          <div>
            <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
              Seller<br />HQ.
            </h1>
            <p className="text-muted mt-4 text-lg font-light tracking-wide max-w-md">
              Command center for your premium real estate portfolio.
            </p>
          </div>
          <button 
          onClick={()=>navigate("/seller/add-property")}
          className="bg-primary text-black font-bold uppercase tracking-widest px-8 py-4 rounded-none hover:bg-white transition-colors duration-300 flex items-center justify-center gap-3 group">
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" /> 
            New Listing
          </button>
        </div>

        {/* Stats Grid - High contrast */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {stats.map((stat, i) => (
            <div 
              key={stat.label} 
              className="relative p-8 border border-dark-border bg-dark-card overflow-hidden group hover:border-primary/50 transition-colors duration-500 animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                <stat.icon size={120} />
              </div>
              <p className="text-sm text-muted uppercase tracking-widest mb-4">{stat.label}</p>
              <p className="text-5xl font-display font-bold text-gradient-gold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Revenue Chart */}
          <div className="border border-dark-border bg-dark-card p-6 md:p-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="text-secondary" />
              <h2 className="text-xl font-display font-bold uppercase tracking-wide">Revenue Trend</h2>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#008080" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#008080" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" tick={{fill: '#666', fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis stroke="#666" tick={{fill: '#666', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: '0' }}
                    itemStyle={{ color: '#008080' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#008080" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trending Properties Chart */}
          <div className="border border-dark-border bg-dark-card p-6 md:p-8 animate-slide-up" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center gap-3 mb-8">
              <Eye className="text-primary" />
              <h2 className="text-xl font-display font-bold uppercase tracking-wide">Most Viewed Properties</h2>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendingData} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" horizontal={false} />
                  <XAxis type="number" stroke="#666" tick={{fill: '#666', fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#666" tick={{fill: '#ccc', fontSize: 12}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: '#1A1A1A'}}
                    contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: '0' }}
                    itemStyle={{ color: '#FFD700' }}
                  />
                  <Bar dataKey="views" fill="#FFD700" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* My Properties List */}
        <div className="border border-dark-border bg-dark-card p-6 md:p-8 animate-slide-up" style={{ animationDelay: '500ms' }}>
          <h2 className="text-2xl font-display font-bold uppercase tracking-wide mb-8">Portfolio Directory</h2>
          
          {isLoading ? (
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-dark-border rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-dark-border rounded"></div>
                  <div className="h-4 bg-dark-border rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ) : myProperties.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-dark-border bg-[#050505]">
              <Building2 size={48} className="mx-auto mb-4 text-muted opacity-30" />
              <p className="text-muted tracking-wide">NO PROPERTIES LISTED</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myProperties.map((property: any) => (
                <div key={property.propertyId} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-dark-border bg-black hover:border-primary/40 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-dark-hover flex items-center justify-center">
                      <Building2 size={24} className="text-muted group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg">{property.title}</h3>
                      <p className="text-sm text-muted">{property.city}, {property.state}</p>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-xs text-muted uppercase tracking-wider mb-1">Status</p>
                      <span className="badge-verified">{property.verificationStatus}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted uppercase tracking-wider mb-1">Price</p>
                      <p className="font-bold text-gradient-gold">${property.price.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
