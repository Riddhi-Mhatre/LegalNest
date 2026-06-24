import { Calendar } from 'lucide-react';
import { VisitCard } from '../../../components/properties/VisitCard';

const visits = [
  {
    id: 'v1',
    propertyTitle: 'Modern Loft',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1f5160590a?auto=format&fit=crop&w=800&q=80',
    location: 'Downtown LA',
    date: '2026-06-25',
    time: '10:00 AM',
    sellerName: 'John Doe',
    status: 'upcoming' as const
  },
  {
    id: 'v2',
    propertyTitle: 'Luxury Penthouse',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    location: 'Manhattan, NY',
    date: '2026-06-15',
    time: '02:00 PM',
    sellerName: 'Jane Smith',
    status: 'completed' as const
  },
  {
    id: 'v3',
    propertyTitle: 'Smart Home Mansion',
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80',
    location: 'Silicon Valley, CA',
    date: '2026-06-10',
    time: '11:00 AM',
    sellerName: 'Alice Johnson',
    status: 'cancelled' as const
  }
];

export default function BuyerVisitsPage() {
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex items-center gap-4 border-b border-dark-border pb-6">
        <div className="p-3 bg-secondary/10 rounded-lg">
          <Calendar size={28} className="text-secondary" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-black uppercase tracking-widest text-white">Scheduled Visits</h1>
          <p className="text-muted text-sm mt-1">Manage your upcoming and past property visits.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {visits.map((visit) => (
          <VisitCard key={visit.id} visit={visit} />
        ))}
      </div>
    </div>
  );
}
