import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import * as adminService from '../services/adminService';
import {
  Users, Building2, Gavel, CheckCircle, Search, LayoutDashboard, UserCheck, BarChart3,
  CreditCard, Bell, Settings as SettingsIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  // Debugging logs requested by user
  console.log("AUTH STORE STATE", useAuthStore.getState());
  console.log("ADMIN EMAIL ENV", import.meta.env.VITE_ADMIN_EMAIL);
  console.log("CURRENT USER", useAuthStore.getState().user);

  // --- API Queries ---
  const { data: stats } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminService.getDashboardStats,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: adminService.getUsers,
    enabled: ['overview', 'users', 'sellers'].includes(activeTab),
  });

  const { data: properties = [], isLoading: loadingProps } = useQuery({
    queryKey: ['admin', 'pending-properties'],
    queryFn: adminService.getPendingProperties,
    enabled: ['overview', 'properties'].includes(activeTab),
  });

  // --- Mutations ---
  const approveMutation = useMutation({
    mutationFn: (id: string) => adminService.approveProperty(id),
    onSuccess: () => {
      toast.success('Property approved!');
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
    onError: () => toast.error('Failed to approve property.'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => adminService.rejectProperty(id, reason),
    onSuccess: () => {
      toast.success('Property rejected.');
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
    onError: () => toast.error('Failed to reject property.'),
  });

  const verifyUserMutation = useMutation({
    mutationFn: (userId: string) => adminService.verifyUser(userId),
    onSuccess: () => {
      toast.success('User verified!');
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
    onError: () => toast.error('Failed to verify user.'),
  });

  // --- Computed Data ---
  const sellersPending = useMemo(() => {
    return (users || []).filter((u: any) => u.role === 'seller' && !u.isVerified);
  }, [users]);

  // --- UI Configuration ---
  const sidebarNav = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'sellers', label: 'Seller Verification', icon: UserCheck },
    { id: 'properties', label: 'Property Approval', icon: Building2 },
    { id: 'auctions', label: 'Auctions', icon: Gavel },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const renderOverview = () => {
    const summaryCards = [
      { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-400' },
      { label: 'Total Buyers', value: (users || []).filter((u: any) => u.role === 'buyer').length, icon: Users, color: 'text-indigo-400' },
      { label: 'Total Sellers', value: (users || []).filter((u: any) => u.role === 'seller').length, icon: Users, color: 'text-purple-400' },
      { label: 'Pending Sellers', value: stats?.pendingVerifications || 0, icon: UserCheck, color: 'text-yellow-400' },
      { label: 'Pending Properties', value: stats?.pendingProperties || 0, icon: Building2, color: 'text-orange-400' },
      { label: 'Active Auctions', value: stats?.activeAuctions || 0, icon: Gavel, color: 'text-secondary' },
      { label: 'Total Revenue', value: '₹' + (stats?.totalRevenue || 0).toLocaleString(), icon: CreditCard, color: 'text-emerald-400' },
    ];

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-display font-bold">Dashboard Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {summaryCards.map((card, i) => (
            <div key={i} className="p-5 bg-dark-card border border-dark-border rounded-xl">
              <div className={`w-10 h-10 rounded-lg bg-black border border-dark-border flex items-center justify-center mb-4 ${card.color}`}>
                <card.icon size={18} />
              </div>
              <p className="text-3xl font-display font-bold mb-1">{card.value}</p>
              <p className="text-xs text-muted font-bold uppercase tracking-wider">{card.label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderUsers = () => {
    const filteredUsers = (users || []).filter((u: any) => u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-display font-bold">User Management</h2>
          <div className="relative w-64">
            <input 
              type="text" placeholder="Search users..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-dark-border rounded-lg pl-10 pr-4 py-2 text-sm focus:border-primary outline-none"
            />
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          </div>
        </div>
        <div className="overflow-x-auto bg-dark-card border border-dark-border rounded-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/40 border-b border-dark-border">
              <tr>
                <th className="p-4 font-bold text-muted uppercase tracking-wider">User</th>
                <th className="p-4 font-bold text-muted uppercase tracking-wider">Role</th>
                <th className="p-4 font-bold text-muted uppercase tracking-wider">Status</th>
                <th className="p-4 font-bold text-muted uppercase tracking-wider">Joined</th>
                <th className="p-4 font-bold text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {filteredUsers.map((u: any) => (
                <tr key={u.userId} className="hover:bg-white/5">
                  <td className="p-4">
                    <div className="font-bold">{u.name}</div>
                    <div className="text-muted text-xs">{u.email}</div>
                  </td>
                  <td className="p-4 capitalize">{u.role}</td>
                  <td className="p-4">
                    {u.isVerified ? (
                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] uppercase font-bold tracking-wider">Verified</span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded text-[10px] uppercase font-bold tracking-wider">Pending</span>
                    )}
                  </td>
                  <td className="p-4 text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <button className="text-primary hover:text-white transition-colors font-bold text-xs">View User</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSellers = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold">Seller Verification</h2>
      {sellersPending.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-dark-border bg-dark-card rounded-xl">
          <CheckCircle size={48} className="mx-auto mb-4 text-emerald-500/30" />
          <p className="text-muted">All sellers verified.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sellersPending.map((seller: any) => (
            <div key={seller.userId} className="p-5 bg-dark-card border border-dark-border rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center border border-dark-border font-bold text-lg">{seller.name.charAt(0)}</div>
                <div>
                  <h3 className="font-bold">{seller.name}</h3>
                  <p className="text-xs text-muted">{seller.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 border border-dark-border rounded-lg text-sm font-bold hover:bg-dark-hover transition-colors">View Docs</button>
                <button
                  onClick={() => verifyUserMutation.mutate(seller.userId)}
                  disabled={verifyUserMutation.isPending}
                  className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm font-bold hover:bg-emerald-500/20 transition-colors"
                >
                  Verify Seller
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderProperties = () => {
    const filteredProps = (properties || []).filter((p: any) => p.title?.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-display font-bold">Property Approvals</h2>
          <div className="relative w-64">
            <input 
              type="text" placeholder="Search properties..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-dark-border rounded-lg pl-10 pr-4 py-2 text-sm focus:border-primary outline-none"
            />
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          </div>
        </div>
        {loadingProps ? (
          <div className="animate-pulse space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-dark-card rounded-xl"></div>)}
          </div>
        ) : filteredProps.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-dark-border bg-dark-card rounded-xl">
            <CheckCircle size={48} className="mx-auto mb-4 text-emerald-500/30" />
            <p className="text-muted">No pending properties.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProps.map((prop: any) => (
              <div key={prop.propertyId} className="flex items-center justify-between p-4 bg-dark-card border border-dark-border rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-black rounded-lg overflow-hidden border border-dark-border">
                    {prop.images?.[0] ? <img src={prop.images[0]} className="w-full h-full object-cover" alt="" /> : <Building2 size={20} className="m-auto mt-4 text-muted" />}
                  </div>
                  <div>
                    <h3 className="font-bold">{prop.title}</h3>
                    <p className="text-xs text-muted">{prop.city}, {prop.state} • ₹{Number(prop.price || prop.salePrice || 0).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={`/properties/${prop.propertyId}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 border border-dark-border rounded-lg text-xs font-bold hover:bg-dark-hover">View</a>
                  <button onClick={() => approveMutation.mutate(prop.propertyId)} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold hover:bg-emerald-500/20">Approve</button>
                  <button onClick={() => { const r = prompt('Reason:'); if (r) rejectMutation.mutate({ id: prop.propertyId, reason: r }) }} className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold hover:bg-red-500/20">Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderMockSection = (title: string, icon: any) => (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold">{title}</h2>
      <div className="text-center py-20 border border-dashed border-dark-border bg-dark-card rounded-xl">
        <div className="flex justify-center mb-4 text-muted opacity-50">{icon}</div>
        <h3 className="text-lg font-bold mb-2">Coming Soon</h3>
        <p className="text-muted max-w-sm mx-auto text-sm">This section is currently under development and will be available in the next platform update.</p>
      </div>
    </div>
  );

  const renderReports = () => {
    const data = [
      { name: 'Jan', users: 400, revenue: 2400 },
      { name: 'Feb', users: 300, revenue: 1398 },
      { name: 'Mar', users: 200, revenue: 9800 },
      { name: 'Apr', users: 278, revenue: 3908 },
      { name: 'May', users: 189, revenue: 4800 },
      { name: 'Jun', users: 239, revenue: 3800 },
    ];
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-display font-bold">Reports & Analytics</h2>
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 h-96">
          <h3 className="font-bold mb-4">Platform Growth (Mock Data)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
              <XAxis dataKey="name" stroke="#666" tick={{fill: '#666', fontSize: 12}} />
              <YAxis yAxisId="left" stroke="#666" tick={{fill: '#666', fontSize: 12}} />
              <YAxis yAxisId="right" orientation="right" stroke="#666" tick={{fill: '#666', fontSize: 12}} />
              <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#333', borderRadius: '8px'}} />
              <Line yAxisId="left" type="monotone" dataKey="users" stroke="#00E5FF" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#FFD700" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-black text-white">
      {/* Sidebar */}
      <div className="w-64 shrink-0 bg-dark-card border-r border-dark-border flex flex-col h-[calc(100vh-64px)] sticky top-16">
        <div className="p-4 border-b border-dark-border">
          <p className="text-xs uppercase font-bold tracking-widest text-primary mb-1">GharBid</p>
          <h2 className="font-display font-bold">Admin Portal</h2>
        </div>
        <div className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
          {sidebarNav.map(nav => (
            <button
              key={nav.id}
              onClick={() => setActiveTab(nav.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                activeTab === nav.id ? 'bg-primary/10 text-primary' : 'text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              <nav.icon size={16} /> {nav.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto h-[calc(100vh-64px)] bg-dark">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'sellers' && renderSellers()}
          {activeTab === 'properties' && renderProperties()}
          {activeTab === 'auctions' && renderMockSection('Auction Management', <Gavel size={64}/>)}
          {activeTab === 'reports' && renderReports()}
          {activeTab === 'payments' && renderMockSection('Payments & Revenue', <CreditCard size={64}/>)}
          {activeTab === 'notifications' && renderMockSection('Platform Notifications', <Bell size={64}/>)}
          {activeTab === 'settings' && renderMockSection('Platform Settings', <SettingsIcon size={64}/>)}
        </div>
      </div>
    </div>
  );
}
