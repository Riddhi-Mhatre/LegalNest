import { Home, Download, Phone } from 'lucide-react';
import { formatShortPrice } from '../../../utils/formatters';

const purchases = [
  {
    id: 'p1',
    propertyTitle: 'Beverly Hills Mansion',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    purchaseDate: '2025-11-12',
    purchasePrice: 4200000,
    ownershipStatus: 'Completed',
  },
  {
    id: 'p2',
    propertyTitle: 'Downtown Apartment',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    purchaseDate: '2026-03-05',
    purchasePrice: 1850000,
    ownershipStatus: 'In Progress (Registration)',
  }
];

export default function BuyerPurchasesPage() {
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex items-center gap-4 border-b border-dark-border pb-6">
        <div className="p-3 bg-secondary/10 rounded-lg">
          <Home size={28} className="text-secondary" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-black uppercase tracking-widest text-white">Purchased Properties</h1>
          <p className="text-muted text-sm mt-1">View your acquired properties and ownership status.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {purchases.map((purchase) => (
          <div key={purchase.id} className="bg-dark-card border border-dark-border rounded-xl p-6 flex flex-col md:flex-row gap-6 hover:border-secondary/50 transition-all duration-300">
            <div className="w-full md:w-48 h-32 shrink-0 rounded-lg overflow-hidden">
              <img src={purchase.image} alt={purchase.propertyTitle} className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{purchase.propertyTitle}</h3>
                  <p className="text-sm text-muted">Purchased on <span className="text-white">{purchase.purchaseDate}</span></p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-[10px] text-muted uppercase tracking-widest mb-1">Purchase Price</p>
                  <p className="text-2xl font-display font-bold text-primary">{formatShortPrice(purchase.purchasePrice)}</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-t border-dark-border pt-4 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted uppercase tracking-widest">Status:</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded ${purchase.ownershipStatus === 'Completed' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>
                    {purchase.ownershipStatus}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2 border border-dark-border">
                    <Download size={14} /> Agreement
                  </button>
                  <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2 border border-dark-border">
                    <Download size={14} /> Invoice
                  </button>
                  <button className="px-4 py-2 bg-white text-black rounded text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2 hover:bg-primary">
                    <Phone size={14} /> Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
