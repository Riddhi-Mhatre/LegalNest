import { Home, Download, Phone } from 'lucide-react';
import { formatShortPrice } from '../../../utils/formatters';

import { useQuery } from '@tanstack/react-query';
import { getPurchases } from '../../../services/userService';
import { Building2, Loader2 } from 'lucide-react';

export default function BuyerPurchasesPage() {
  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ['buyer', 'purchases'],
    queryFn: getPurchases,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="animate-spin text-primary" size={36} />
        <p className="text-muted text-sm font-semibold">Loading purchases...</p>
      </div>
    );
  }

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
        {(purchases as any[]).length === 0 ? (
          <div className="text-center py-16 border border-dashed border-dark-border rounded-xl bg-black/20">
            <Home size={40} className="mx-auto mb-4 text-muted opacity-30" />
            <p className="text-muted font-bold tracking-wide">NO PURCHASES YET</p>
          </div>
        ) : (
          (purchases as any[]).map((purchase) => (
            <div key={purchase.purchaseId} className="bg-dark-card border border-dark-border rounded-xl p-6 flex flex-col md:flex-row gap-6 hover:border-secondary/50 transition-all duration-300">
              <div className="w-full md:w-48 h-32 shrink-0 rounded-lg overflow-hidden bg-dark flex items-center justify-center border border-dark-border">
                {purchase.property?.images?.[0] ? (
                  <img src={purchase.property.images[0]} alt={purchase.propertyTitle || 'Property'} className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={40} className="text-muted opacity-30" />
                )}
              </div>
              
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{purchase.propertyTitle || 'Property'}</h3>
                    <p className="text-sm text-muted">Purchased on <span className="text-white">{new Date(purchase.date).toLocaleDateString()}</span></p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-[10px] text-muted uppercase tracking-widest mb-1">Purchase Price</p>
                    <p className="text-2xl font-display font-bold text-primary">{formatShortPrice(purchase.amount || 0)}</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-t border-dark-border pt-4 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted uppercase tracking-widest">Status:</span>
                    <span className="text-xs font-bold px-3 py-1 rounded bg-secondary/10 text-secondary">
                      Completed
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
          ))
        )}
      </div>
    </div>
  );
}
