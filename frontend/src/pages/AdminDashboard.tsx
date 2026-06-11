import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Users, Building2, Gavel, FileCheck } from 'lucide-react';
import { Loader } from '../components/common/Loader';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'properties' | 'users'>('properties');

  const { data: stats } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get('/admin/dashboard').then(r => r.data.data),
  });

  const cards = [
    { label: 'Pending Properties', value: stats?.pendingProperties ?? 0, icon: Building2 },
    { label: 'Unverified Users', value: stats?.unverifiedUsers ?? 0, icon: Users },
    { label: 'Active Auctions', value: stats?.activeAuctions ?? 0, icon: Gavel },
    { label: 'Total Revenue', value: '₹' + (stats?.revenue ?? 0).toLocaleString(), icon: FileCheck },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gradient-gold">Admin Portal</h1>
        <p className="text-muted">Manage platform verifications and auctions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="card p-6 border-l-4 border-l-accent">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm text-muted">{card.label}</p>
              <card.icon size={20} className="text-accent" />
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
          <div className="text-center py-12 text-muted">
            <Loader size="sm" label="Fetching data..." />
          </div>
        </div>
      </div>
    </div>
  );
}
