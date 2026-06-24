import { Heart, Scale, X, Check } from 'lucide-react';
import { BuyerPropertyCard } from '../../../components/properties/BuyerPropertyCard';
import { useState } from 'react';

const savedProperties = [
  {
    propertyId: '1',
    title: 'Modern Glass Villa',
    city: 'Beverly Hills',
    state: 'CA',
    salePrice: 4500000,
    type: 'villa',
    listingType: 'sale',
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'],
    isVerified: true,
    verificationStatus: 'verified',
  },
  {
    propertyId: '2',
    title: 'Luxury Penthouse',
    city: 'Manhattan',
    state: 'NY',
    salePrice: 8200000,
    type: 'apartment',
    listingType: 'sale',
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'],
    isVerified: true,
    verificationStatus: 'verified',
  },
  {
    propertyId: '3',
    title: 'Smart Home Mansion',
    city: 'Silicon Valley',
    state: 'CA',
    salePrice: 12500000,
    type: 'house',
    listingType: 'sale',
    images: ['https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80'],
    isVerified: false,
    verificationStatus: 'pending',
  },
];

export default function BuyerSavedPage() {
  const [comparing, setComparing] = useState(false);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex items-center justify-between border-b border-dark-border pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 rounded-lg">
            <Heart size={28} className="text-rose-500" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-black uppercase tracking-widest text-white">Saved Properties</h1>
            <p className="text-muted text-sm mt-1">Properties you've liked and saved for later.</p>
          </div>
        </div>
        <button 
          onClick={() => setComparing(!comparing)}
          className={`px-4 py-2 rounded font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-colors ${comparing ? 'bg-primary text-black' : 'bg-white/5 text-white border border-dark-border hover:bg-white/10'}`}
        >
          <Scale size={14} /> Compare Properties
        </button>
      </div>

      {comparing && (
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 overflow-x-auto shadow-xl animate-slide-up mb-8">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-lg font-bold uppercase tracking-widest text-primary">Comparison View (Max 4)</h2>
             <button onClick={() => setComparing(false)} className="text-muted hover:text-white"><X size={20} /></button>
          </div>
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr>
                <th className="p-4 border-b border-dark-border">Features</th>
                {savedProperties.slice(0, 3).map(p => (
                  <th key={p.propertyId} className="p-4 border-b border-dark-border font-bold text-white w-1/4">
                    <img src={p.images?.[0]} className="w-full h-24 object-cover rounded mb-2" alt={p.title} />
                    {p.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              <tr>
                <td className="p-4 text-muted font-bold uppercase tracking-widest text-xs">Price</td>
                {savedProperties.slice(0, 3).map(p => <td key={p.propertyId} className="p-4 font-display font-bold">₹{(p.salePrice ?? p.rentPrice ?? 0).toLocaleString()}</td>)}
              </tr>
              <tr>
                <td className="p-4 text-muted font-bold uppercase tracking-widest text-xs">Location</td>
                {savedProperties.slice(0, 3).map(p => <td key={p.propertyId} className="p-4">{[p.city, p.state].filter(Boolean).join(', ')}</td>)}
              </tr>
              <tr>
                <td className="p-4 text-muted font-bold uppercase tracking-widest text-xs">Verified</td>
                {savedProperties.slice(0, 3).map(p => <td key={p.propertyId} className="p-4">{p.isVerified ? <Check size={16} className="text-secondary" /> : <X size={16} className="text-destructive" />}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedProperties.map((property) => (
          <BuyerPropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
}
