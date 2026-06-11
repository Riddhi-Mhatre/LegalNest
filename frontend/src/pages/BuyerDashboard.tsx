import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Heart, Gavel, FileText, ArrowRight, Activity, Map } from 'lucide-react';
import { ROUTES } from '../utils/constants';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const biddingActivity = [
  { name: 'Mon', bids: 2 },
  { name: 'Tue', bids: 5 },
  { name: 'Wed', bids: 3 },
  { name: 'Thu', bids: 8 },
  { name: 'Fri', bids: 12 },
  { name: 'Sat', bids: 7 },
  { name: 'Sun', bids: 4 },
];

const interestDistribution = [
  { name: 'Apartments', value: 45 },
  { name: 'Villas', value: 25 },
  { name: 'Commercial', value: 20 },
  { name: 'Plots', value: 10 },
];

const COLORS = ['#FFD700', '#008080', '#800080', '#1A1A1A'];

export default function BuyerDashboard() {
  const { user } = useAuthStore();


  const menuItems = [
    { label: 'Saved Properties', icon: Heart, count: 12, path: ROUTES.PROPERTIES, color: 'text-rose-500', glow: 'hover:border-rose-500/50' },
    { label: 'Active Auctions', icon: Gavel, count: 3, path: '/auctions', color: 'text-primary', glow: 'hover:border-primary/50' },
    { label: 'Completed Deals', icon: FileText, count: 1, path: '/transactions', color: 'text-secondary', glow: 'hover:border-secondary/50' },
  ];

  return (
    <div className="min-h-screen bg-black text-white px-4 py-12 md:px-12 font-sans relative overflow-hidden">
      
      {/* Decorative gradient orb */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1400px] mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 animate-fade-in">
          <div>
            <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
              Welcome<br />{user?.name?.split(' ')[0] || 'Buyer'}.
            </h1>
            <p className="text-muted mt-4 text-lg font-light tracking-wide max-w-md">
              Your personalized real estate acquisitions portal.
            </p>
          </div>
          <Link to={ROUTES.PROPERTIES} className="bg-white text-black font-bold uppercase tracking-widest px-8 py-4 rounded-none hover:bg-primary transition-colors duration-300 flex items-center justify-center gap-3 group">
            Browse Market
            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-300" />
          </Link>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {menuItems.map((item, i) => (
            <Link 
              key={item.label} 
              to={item.path} 
              className={`p-8 border border-dark-border bg-dark-card/50 backdrop-blur-md group transition-all duration-500 ${item.glow} animate-slide-up flex flex-col justify-between`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex justify-between items-start mb-12">
                <item.icon size={32} className={`${item.color}`} />
                <ArrowRight size={24} className="text-muted opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </div>
              <div>
                <p className="text-sm text-muted uppercase tracking-widest mb-2">{item.label}</p>
                <p className="text-5xl font-display font-bold text-white">{item.count}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          
          {/* Bidding Activity Chart */}
          <div className="border border-dark-border bg-dark-card/80 p-6 md:p-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-3 mb-8">
              <Activity className="text-primary" />
              <h2 className="text-xl font-display font-bold uppercase tracking-wide">Bidding Activity</h2>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={biddingActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" tick={{fill: '#666', fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis stroke="#666" tick={{fill: '#666', fontSize: 12}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: '0' }}
                    itemStyle={{ color: '#FFD700' }}
                  />
                  <Line type="monotone" dataKey="bids" stroke="#FFD700" strokeWidth={3} dot={{r: 4, fill: '#FFD700'}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Interest Distribution Chart */}
          <div className="border border-dark-border bg-dark-card/80 p-6 md:p-8 animate-slide-up" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center gap-3 mb-8">
              <Map className="text-secondary" />
              <h2 className="text-xl font-display font-bold uppercase tracking-wide">Portfolio Interest</h2>
            </div>
            <div className="h-[250px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={interestDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {interestDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: '0' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col gap-2 pointer-events-none">
                {interestDistribution.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2 text-xs text-muted uppercase tracking-wider">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    {entry.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
