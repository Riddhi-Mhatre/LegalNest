import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSellerProperties, deleteSellerProperty, markPropertySold } from '../../../services/sellerService';
import {
  Building2, Plus, Pencil, Trash2, FileText, Eye, Gavel, CheckCircle,
  CreditCard, ShieldCheck, ShieldAlert, MapPin, Calendar
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getCity  = (p: any) => p.city  ?? p.location?.city  ?? '—';
const getState = (p: any) => p.state ?? p.location?.state ?? '—';
const getPrice = (p: any) => {
  const raw = p.salePrice ?? p.rentPrice ?? p.price ?? 0;
  if (!raw) return '—';
  return `₹${Number(raw).toLocaleString('en-IN')}`;
};
const getStatus = (p: any) => {
  if (p.status === 'sold') return 'sold';
  return p.verificationStatus ?? p.status ?? 'pending';
};

const REQUIRED_DOC_KEYS = ['saleDeed', 'propertyCard', 'taxReceipt', 'ownerAadhar', 'ownerPan'];

const getDocsCount = (p: any): { uploaded: number; total: number } => {
  const docs = p.documents ?? {};
  if (Array.isArray(docs)) {
    return { uploaded: docs.length, total: REQUIRED_DOC_KEYS.length };
  }
  const uploaded = REQUIRED_DOC_KEYS.filter(k => !!docs[k]).length;
  return { uploaded, total: REQUIRED_DOC_KEYS.length };
};

// ─── Status badge configs ─────────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; class: string; icon?: any }> = {
  verified:  { label: 'Approved', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  approved:  { label: 'Approved', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  sold:      { label: 'Sold',     class: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  pending:   { label: 'Pending',  class: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
  rejected:  { label: 'Rejected', class: 'bg-red-500/10 text-red-400 border-red-500/30' },
  draft:     { label: 'Draft',    class: 'bg-gray-500/10 text-gray-400 border-gray-500/30' },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function MyPropertiesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get('filter') || searchParams.get('status');
  const sortParam = searchParams.get('sort');
  const queryClient = useQueryClient();

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['seller', 'properties'],
    queryFn: getSellerProperties,
  });

  let filteredProperties = (properties as any[]).filter(p => {
    const status = getStatus(p);
    if (filterParam === 'sold') return status === 'sold';
    if (status === 'sold') return false; // Exclude sold from 'all' view
    if (!filterParam || filterParam === 'all') return true;
    return status === filterParam;
  });

  if (sortParam === 'views') {
    filteredProperties.sort((a, b) => (b.viewsCount ?? b.viewCount ?? 0) - (a.viewsCount ?? a.viewCount ?? 0));
  } else if (sortParam === 'inquiries') {
    // Mock inquiries as 5% of views for now if not present
    filteredProperties.sort((a, b) => {
      const aInquiries = a.inquiries ?? Math.floor((a.viewsCount ?? a.viewCount ?? 0) * 0.05);
      const bInquiries = b.inquiries ?? Math.floor((b.viewsCount ?? b.viewCount ?? 0) * 0.05);
      return bInquiries - aInquiries;
    });
  } else {
    // Default sort by latest
    filteredProperties.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

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

  const soldMutation = useMutation({
    mutationFn: markPropertySold,
    onSuccess: () => {
      toast.success('Property marked as sold.');
      queryClient.invalidateQueries({ queryKey: ['seller'] });
    },
    onError: () => toast.error('Failed to mark property as sold.'),
  });

  const handleMarkSold = (propertyId: string, title: string) => {
    if (!window.confirm(`Mark "${title}" as sold? This will remove it from active listings.`)) return;
    soldMutation.mutate(propertyId);
  };

  return (
    <div className="min-h-screen text-white bg-dark">
      
      {/* Header Area */}
      <div className="bg-gradient-to-b from-black to-dark border-b border-dark-border pb-8 pt-12 px-4 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p className="text-primary text-xs uppercase font-bold tracking-widest mb-2">Portfolio</p>
            <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-white mb-2">
              My Properties
            </h1>
            <p className="text-muted text-sm max-w-lg">
              Manage your real estate listings, update details, upload legal documents, and track approval status.
            </p>
          </div>
          <button
            onClick={() => navigate('/seller/add-property')}
            className="bg-primary text-black font-bold uppercase tracking-widest px-6 py-3.5 hover:bg-yellow-400 transition-colors flex items-center gap-2 rounded-xl text-sm"
          >
            <Plus size={18} /> Add Property
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 md:px-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-dark-card border border-dark-border rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-dark-border bg-dark-card rounded-2xl">
            <Building2 size={64} className="mx-auto mb-6 text-muted opacity-20" />
            <h3 className="text-2xl font-display font-bold text-white mb-2">
              {filterParam && filterParam !== 'all' ? `No ${filterParam} properties` : 'No Properties Listed'}
            </h3>
            <p className="text-muted tracking-wide mb-6 max-w-md mx-auto">
              {filterParam && filterParam !== 'all'
                ? `You don't have any properties matching "${filterParam}".` 
                : "You haven't added any properties to your portfolio yet. Start by creating your first listing."}
            </p>
            <button
              onClick={() => navigate('/seller/add-property')}
              className="text-black bg-primary px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-yellow-400 transition-colors"
            >
              Add First Property
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property: any) => {
              const verStatus = getStatus(property);
              const verCfg = statusConfig[verStatus] ?? statusConfig.pending;
              const { uploaded, total } = getDocsCount(property);
              const allDocsDone = uploaded >= total;
              const feePaid = !!property.platformFeePaid;

              return (
                <div
                  key={property.propertyId}
                  className="flex flex-col bg-dark-card border border-dark-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all group shadow-lg"
                >
                  {/* Thumbnail Container */}
                  <div className="relative h-48 bg-black overflow-hidden">
                    {property.images?.[0] ? (
                      <img src={property.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted">
                        <Building2 size={40} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border uppercase tracking-wider backdrop-blur-md ${verCfg.class}`}>
                        {verCfg.label}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                      <p className="text-xl font-display font-bold text-white shadow-sm">{getPrice(property)}</p>
                      <div className="flex items-center gap-1 text-xs font-bold text-white bg-black/60 px-2 py-1 rounded backdrop-blur-md">
                        <Eye size={12} className="text-primary" /> {property.viewsCount ?? property.viewCount ?? 0}
                      </div>
                    </div>
                  </div>

                  {/* Content Body */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-display font-bold text-lg text-white line-clamp-1 mb-2 group-hover:text-primary transition-colors">{property.title}</h3>
                    
                    <div className="space-y-2 mb-6 text-sm text-muted">
                      <p className="flex items-center gap-2">
                        <MapPin size={14} className="text-primary/70" /> {getCity(property)}, {getState(property)}
                      </p>
                      <p className="flex items-center gap-2">
                        <Calendar size={14} className="text-primary/70" /> Listed: {new Date(property.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="mt-auto space-y-2">
                      {/* Status row */}
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${
                          feePaid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                        }`}>
                          <CreditCard size={12} /> {feePaid ? 'Fee Paid' : 'Fee Pending'}
                        </div>

                        <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${
                          allDocsDone ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                        }`}>
                          {allDocsDone ? <><ShieldCheck size={12} /> Docs Complete</> : <><ShieldAlert size={12} /> Docs: {uploaded}/{total}</>}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-4 border-t border-dark-border">
                        <button
                          onClick={() => navigate(`/properties/${property.propertyId}`)}
                          className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-white bg-dark-hover border border-dark-border rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <Eye size={14} /> View
                        </button>
                        <button
                          onClick={() => navigate(`/seller/add-property?edit=${property.propertyId}`)}
                          className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-white bg-dark-hover border border-dark-border rounded-lg hover:bg-white/10 hover:text-primary hover:border-primary/50 transition-colors"
                        >
                          <Pencil size={14} /> Edit
                        </button>
                        <button
                          onClick={() => navigate(`/seller/add-property`)} // Wait, docs upload is via add-property currently or maybe a dedicated page? The existing code routed to /seller/add-property
                          className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-white bg-dark-hover border border-dark-border rounded-lg hover:bg-white/10 hover:text-secondary hover:border-secondary/50 transition-colors"
                        >
                          <FileText size={14} /> Docs
                        </button>
                        <button
                          onClick={() => handleDelete(property.propertyId, property.title)}
                          disabled={deleteMutation.isPending}
                          className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-white bg-dark-hover border border-dark-border rounded-lg hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                      
                      {verStatus === 'approved' && (
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <button
                            onClick={() => navigate(`/seller/auctions/${property.propertyId}`)}
                            className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-black bg-primary rounded-lg hover:bg-yellow-400 transition-colors"
                          >
                            <Gavel size={14} /> Auction
                          </button>
                          <button
                            onClick={() => handleMarkSold(property.propertyId, property.title)}
                            disabled={soldMutation.isPending}
                            className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle size={14} /> Mark Sold
                          </button>
                        </div>
                      )}
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
