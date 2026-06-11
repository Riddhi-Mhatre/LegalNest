import { useState, useMemo } from 'react';
import { Search, Filter, Clock, MapPin, Building, ArrowRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const MOCK_AUCTIONS = [
  {
    id: 'a1',
    title: 'Luxury Villa in South Delhi',
    propertyType: 'Residential',
    region: 'Delhi NCR',
    currentBid: 45000000,
    status: 'ongoing',
    endTime: new Date(Date.now() + 3600000).toISOString(),
    image: 'https://images.unsplash.com/photo-1613490900233-08ddc88849b2?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'a2',
    title: 'Commercial Plaza Space',
    propertyType: 'Commercial',
    region: 'Mumbai',
    startingBid: 120000000,
    currentBid: null,
    status: 'upcoming',
    startTime: new Date(Date.now() + 86400000).toISOString(),
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'a3',
    title: 'Sea-Facing Penthouse',
    propertyType: 'Residential',
    region: 'Mumbai',
    currentBid: 85000000,
    status: 'ongoing',
    endTime: new Date(Date.now() + 7200000).toISOString(),
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'a4',
    title: 'Industrial Plot - Phase 2',
    propertyType: 'Land',
    region: 'Pune',
    startingBid: 15000000,
    currentBid: null,
    status: 'upcoming',
    startTime: new Date(Date.now() + 172800000).toISOString(),
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=800'
  },
];

const REGIONS = ['All', 'Delhi NCR', 'Mumbai', 'Pune', 'Bangalore'];
const TYPES = ['All', 'Residential', 'Commercial', 'Land'];

export default function AuctionsListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ongoing' | 'upcoming'>('all');
  const [regionFilter, setRegionFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [priceRange, setPriceRange] = useState(500000000); // Max 50 Cr default

  const filteredAuctions = useMemo(() => {
    return MOCK_AUCTIONS.filter(a => {
      const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchesRegion = regionFilter === 'All' || a.region === regionFilter;
      const matchesType = typeFilter === 'All' || a.propertyType === typeFilter;
      const price = a.currentBid || a.startingBid || 0;
      const matchesPrice = price <= priceRange;
      
      return matchesSearch && matchesStatus && matchesRegion && matchesType && matchesPrice;
    });
  }, [searchTerm, statusFilter, regionFilter, typeFilter, priceRange]);

  return (
    <div className="min-h-screen relative overflow-hidden py-8 px-4">
      {/* Background ambient glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-80 shrink-0">
          <div className="sticky top-24 bg-dark-card/50 backdrop-blur-xl border border-dark-border rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-8">
              <Filter className="text-primary" size={24} />
              <h2 className="text-xl font-display font-bold">Filter Auctions</h2>
            </div>

            {/* Status Tabs */}
            <div className="flex bg-black p-1 rounded-lg border border-dark-border mb-8">
              {['all', 'ongoing', 'upcoming'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status as any)}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                    statusFilter === status 
                      ? 'bg-primary text-black shadow-[0_0_10px_rgba(255,215,0,0.3)]' 
                      : 'text-muted hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Property Type */}
            <div className="mb-6">
              <label className="text-sm text-muted font-bold uppercase mb-3 block">Property Type</label>
              <div className="space-y-2">
                {TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all border ${
                      typeFilter === type
                        ? 'bg-secondary/20 border-secondary text-secondary font-bold'
                        : 'border-transparent hover:bg-white/5 text-white/80'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Region */}
            <div className="mb-6">
              <label className="text-sm text-muted font-bold uppercase mb-3 block">Region</label>
              <select 
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="w-full bg-black border border-dark-border rounded-lg px-4 py-3 text-sm focus:border-primary outline-none transition-colors"
              >
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <label className="text-sm text-muted font-bold uppercase mb-3 block">
                Max Price: ₹{(priceRange / 10000000).toFixed(1)} Cr
              </label>
              <input 
                type="range" 
                min="10000000" 
                max="500000000" 
                step="5000000"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-primary h-1 bg-dark-border rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-4xl font-display font-bold">
              Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary from-10% to-primary to-50%">Auctions</span>
            </h1>
            <div className="relative w-full md:w-72">
              <input 
                type="text" 
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-dark-card border border-dark-border rounded-full pl-10 pr-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            </div>
          </div>

          {/* Grid */}
          {filteredAuctions.length === 0 ? (
            <div className="text-center py-20 bg-dark-card/30 rounded-2xl border border-dark-border">
              <p className="text-muted text-lg">No auctions match your filters.</p>
              <button 
                onClick={() => { setStatusFilter('all'); setTypeFilter('All'); setRegionFilter('All'); setSearchTerm(''); setPriceRange(500000000); }}
                className="mt-4 text-primary hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
              {filteredAuctions.map(auction => (
                <div key={auction.id} className="group relative bg-dark-card rounded-2xl border border-dark-border overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(255,215,0,0.1)]">
                  {/* Image Container */}
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={auction.image} 
                      alt={auction.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                    
                    {/* Status Badge */}
                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                      auction.status === 'ongoing' 
                        ? 'bg-primary/90 text-black backdrop-blur-sm shadow-[0_0_15px_rgba(255,215,0,0.5)]' 
                        : 'bg-black/70 text-white backdrop-blur-sm border border-white/20'
                    }`}>
                      {auction.status === 'ongoing' ? (
                        <><Activity size={12} className="animate-pulse" /> Live Now</>
                      ) : (
                        <><Clock size={12} /> Upcoming</>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 relative">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-display font-bold group-hover:text-primary transition-colors line-clamp-1">{auction.title}</h3>
                    </div>
                    
                    <div className="flex gap-4 text-sm text-muted mb-6">
                      <span className="flex items-center gap-1"><Building size={14} /> {auction.propertyType}</span>
                      <span className="flex items-center gap-1"><MapPin size={14} /> {auction.region}</span>
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">
                          {auction.status === 'ongoing' ? 'Current Bid' : 'Starting Bid'}
                        </p>
                        <p className={`text-2xl font-bold ${auction.status === 'ongoing' ? 'text-primary' : 'text-white'}`}>
                          ₹{(auction.currentBid || auction.startingBid)?.toLocaleString()}
                        </p>
                      </div>
                      
                      <Link 
                        to={`/auctions/${auction.id}`} 
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          auction.status === 'ongoing'
                            ? 'bg-primary text-black hover:bg-yellow-400 hover:w-32 hover:justify-between px-4'
                            : 'bg-dark-hover text-white hover:bg-white/10'
                        }`}
                      >
                        {auction.status === 'ongoing' && <span className="hidden group-hover:block font-bold text-sm whitespace-nowrap overflow-hidden">Join Room</span>}
                        <ArrowRight size={20} className={auction.status === 'ongoing' ? 'group-hover:translate-x-1 transition-transform' : ''} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
