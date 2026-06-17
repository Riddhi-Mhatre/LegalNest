import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Users, Building2, Gavel, FileCheck, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'properties' | 'users'>('properties');
  const queryClient = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get('/admin/dashboard').then(r => r.data.data),
  });

  const { data: pendingProperties = [], isLoading: loadingProps } = useQuery({
    queryKey: ['admin', 'pending-properties'],
    queryFn: () => api.get('/admin/properties/pending').then(r => r.data.data),
    enabled: activeTab === 'properties',
  });

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => api.get('/admin/users').then(r => r.data.data),
    enabled: activeTab === 'users',
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.put(`/admin/properties/${id}/approve`),
    onSuccess: () => {
      toast.success('Property approved!');
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
    onError: () => toast.error('Failed to approve property.'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.put(`/admin/properties/${id}/reject`, { reason }),
    onSuccess: () => {
      toast.success('Property rejected.');
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
    onError: () => toast.error('Failed to reject property.'),
  });

  const verifyUserMutation = useMutation({
    mutationFn: (userId: string) => api.put(`/admin/users/${userId}/verify`),
    onSuccess: () => {
      toast.success('User verified!');
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
    onError: () => toast.error('Failed to verify user.'),
  });

  const cards = [
    { label: 'Pending Properties', value: stats?.pendingProperties ?? 0, icon: Building2 },
    { label: 'Unverified Users', value: stats?.pendingVerifications ?? 0, icon: Users },
    { label: 'Active Auctions', value: stats?.activeAuctions ?? 0, icon: Gavel },
    { label: 'Total Revenue', value: '₹' + (stats?.totalRevenue ?? 0).toLocaleString(), icon: FileCheck },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gradient-gold">Admin Portal</h1>
        <p className="text-muted">Manage platform verifications and auctions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="card p-6 border-l-4 border-l-primary">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm text-muted">{card.label}</p>
              <card.icon size={20} className="text-primary" />
            </div>
            <p className="text-2xl font-bold font-display">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex border-b border-dark-border">
          <button
            onClick={() => setActiveTab('properties')}
            className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'properties' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-white'
            }`}
          >
            Property Approvals
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-white'
            }`}
          >
            User Verifications
          </button>
        </div>

        <div className="p-6">
          {/* Property Approvals Tab */}
          {activeTab === 'properties' && (
            <>
              {loadingProps ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-dark-border/40 rounded animate-pulse" />
                  ))}
                </div>
              ) : (pendingProperties as any[]).length === 0 ? (
                <div className="text-center py-16 text-muted">
                  <Building2 size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No pending properties</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(pendingProperties as any[]).map((prop: any) => (
                    <div
                      key={prop.propertyId}
                      className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-dark-border bg-black/40 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white mb-1 truncate">{prop.title}</h3>
                        <p className="text-sm text-muted">
                          {prop.city ?? prop.location?.city ?? '—'}, {prop.state ?? prop.location?.state ?? '—'} · {prop.type} · {prop.listingType}
                        </p>
                        <p className="text-sm text-primary font-bold mt-1">
                          ₹{Number(prop.salePrice ?? prop.rentPrice ?? prop.price ?? 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => approveMutation.mutate(prop.propertyId)}
                          disabled={approveMutation.isPending}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm font-bold hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle size={15} /> Approve
                        </button>
                        <button
                          onClick={() => {
                            const reason = window.prompt('Reason for rejection:');
                            if (reason !== null) rejectMutation.mutate({ id: prop.propertyId, reason });
                          }}
                          disabled={rejectMutation.isPending}
                          className="flex items-center gap-1.5 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-bold hover:bg-red-500/30 transition-colors disabled:opacity-50"
                        >
                          <XCircle size={15} /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* User Verifications Tab */}
          {activeTab === 'users' && (
            <>
              {loadingUsers ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-dark-border/40 rounded animate-pulse" />
                  ))}
                </div>
              ) : (users as any[]).length === 0 ? (
                <div className="text-center py-16 text-muted">
                  <Users size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No users found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(users as any[]).map((user: any) => (
                    <div
                      key={user.userId}
                      className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 border border-dark-border bg-black/40 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white">{user.name}</p>
                        <p className="text-sm text-muted">{user.email} · <span className="capitalize">{user.role}</span></p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
                          user.isVerified
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        }`}>
                          {user.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                        {!user.isVerified && (
                          <button
                            onClick={() => verifyUserMutation.mutate(user.userId)}
                            disabled={verifyUserMutation.isPending}
                            className="flex items-center gap-1.5 px-4 py-2 bg-secondary/20 text-secondary border border-secondary/30 rounded-lg text-sm font-bold hover:bg-secondary/30 transition-colors disabled:opacity-50"
                          >
                            <ShieldCheck size={15} /> Verify
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
