import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSellerProperties, deleteSellerProperty } from '../services/sellerService';
import { Building2, Plus, Pencil, Trash2, FileText, Eye } from 'lucide-react';
import { toast } from 'sonner';

const getCity = (p: any) => p.city ?? p.location?.city ?? '—';
const getState = (p: any) => p.state ?? p.location?.state ?? '—';
const getPrice = (p: any) => {
  const raw = p.salePrice ?? p.rentPrice ?? p.price ?? 0;
  if (!raw) return '—';
  return `₹${Number(raw).toLocaleString('en-IN')}`;
};
const getStatus = (p: any) => p.verificationStatus ?? p.status ?? 'pending';

const statusConfig: Record<string, { label: string; class: string }> = {
  verified: { label: 'Verified', class: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  approved: { label: 'Approved', class: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  pending: { label: 'Pending', class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  rejected: { label: 'Rejected', class: 'bg-red-500/20 text-red-400 border-red-500/30' },
  draft: { label: 'Draft', class: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
};

export default function MyPropertiesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['seller', 'properties'],
    queryFn: getSellerProperties,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSellerProperty,
    onSuccess: () => {
      toast.success('Property deleted.');
      queryClient.invalidateQueries({ queryKey: ['seller', 'properties'] });
    },
    onError: () => toast.error('Failed to delete property.'),
  });

  const handleDelete = (propertyId: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    deleteMutation.mutate(propertyId);
  };

  return (
    <div className="min-h-screen text-white px-4 py-12 md:px-12">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-muted text-xs uppercase tracking-widest mb-2">Seller</p>
            <h1 className="text-4xl md:text-5xl font-display font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
              My Properties
            </h1>
          </div>
          <button
            onClick={() => navigate('/seller/add-property')}
            className="bg-primary text-black font-bold uppercase tracking-widest px-6 py-3 hover:bg-yellow-400 transition-colors flex items-center gap-2 rounded-none"
          >
            <Plus size={18} /> New Listing
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-dark-border/40 rounded animate-pulse" />
            ))}
          </div>
        ) : (properties as any[]).length === 0 ? (
          <div className="text-center py-24 border border-dashed border-dark-border bg-black/20 rounded-lg">
            <Building2 size={48} className="mx-auto mb-4 text-muted opacity-30" />
            <p className="text-muted tracking-wide mb-4">NO PROPERTIES LISTED YET</p>
            <button
              onClick={() => navigate('/seller/add-property')}
              className="text-primary text-sm hover:underline font-bold"
            >
              + Add your first property
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {(properties as any[]).map((property: any) => {
              const status = getStatus(property);
              const cfg = statusConfig[status] ?? statusConfig.pending;
              return (
                <div
                  key={property.propertyId}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 border border-dark-border bg-dark-card hover:border-primary/30 transition-colors rounded-lg"
                >
                  {/* Left: thumbnail + info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-16 h-16 bg-dark-hover flex items-center justify-center flex-shrink-0 rounded-lg overflow-hidden">
                      {property.images?.[0] ? (
                        <img src={property.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Building2 size={24} className="text-muted" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-base text-white truncate">{property.title}</h3>
                      <p className="text-sm text-muted">{getCity(property)}, {getState(property)}</p>
                      <p className="text-sm font-bold text-primary">{getPrice(property)}</p>
                    </div>
                  </div>

                  {/* Right: status + actions */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${cfg.class}`}>
                      {cfg.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        title="View property"
                        onClick={() => navigate(`/properties/${property.propertyId}`)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-dark-hover hover:bg-white/10 text-muted hover:text-white transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        title="Upload documents"
                        onClick={() => navigate(`/seller/documents?propertyId=${property.propertyId}`)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-dark-hover hover:bg-secondary/20 text-muted hover:text-secondary transition-colors"
                      >
                        <FileText size={16} />
                      </button>
                      <button
                        title="Edit property"
                        onClick={() => navigate(`/seller/add-property?edit=${property.propertyId}`)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-dark-hover hover:bg-primary/20 text-muted hover:text-primary transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        title="Delete property"
                        onClick={() => handleDelete(property.propertyId, property.title)}
                        disabled={deleteMutation.isPending}
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-dark-hover hover:bg-red-500/20 text-muted hover:text-red-400 transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
