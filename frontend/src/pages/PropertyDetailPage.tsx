import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getProperty, expressInterest } from '../services/propertyService';
import { useAuthStore } from '../store/authStore';
import { ImageGallery } from '../components/properties/ImageGallery';
import { PropertyMap } from '../components/properties/PropertyMap';
import { FullPageLoader } from '../components/common/Loader';
import { formatPrice } from '../utils/formatters';
import { toast } from 'sonner';
import { MapPin, Bed, Bath, Square, CheckCircle, Handshake, Heart } from 'lucide-react';
import { ROUTES } from '../utils/constants';

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuthStore();

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => getProperty(id!),
    enabled: !!id,
  });

  const interestMutation = useMutation({
    mutationFn: () => expressInterest(id!),
    onSuccess: () => toast.success('Interest expressed! The seller will be notified.'),
    onError: () => toast.error('Failed to express interest.'),
  });

  if (isLoading) return <FullPageLoader />;
  if (!property) return <div className="text-center py-20 text-muted">Property not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Top Gallery */}
      <ImageGallery images={property.images} title={property.title} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {property.verificationStatus === 'verified' && (
                <span className="badge-verified"><CheckCircle size={12} /> Verified by GharBid</span>
              )}
              {property.isAuctionRequested && (
                <span className="badge-live text-[10px]">Auction Available</span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">{property.title}</h1>
            <p className="text-muted flex items-center gap-1"><MapPin size={16} /> {property.location.address}, {property.location.city}</p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 py-6 border-y border-dark-border">
            <div className="text-center border-r border-dark-border last:border-0">
              <Bed size={20} className="mx-auto mb-2 text-muted" />
              <p className="font-semibold text-lg">{property.bedrooms || '-'}</p>
              <p className="text-xs text-muted">Bedrooms</p>
            </div>
            <div className="text-center border-r border-dark-border last:border-0">
              <Bath size={20} className="mx-auto mb-2 text-muted" />
              <p className="font-semibold text-lg">{property.bathrooms || '-'}</p>
              <p className="text-xs text-muted">Bathrooms</p>
            </div>
            <div className="text-center border-r border-dark-border sm:border-r">
              <Square size={20} className="mx-auto mb-2 text-muted" />
              <p className="font-semibold text-lg">{property.area.toLocaleString()}</p>
              <p className="text-xs text-muted">Sq Ft</p>
            </div>
            <div className="text-center hidden sm:block">
              <Building2Icon size={20} className="mx-auto mb-2 text-muted" />
              <p className="font-semibold text-lg capitalize">{property.type}</p>
              <p className="text-xs text-muted">Type</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-bold mb-4 font-display">About this property</h2>
            <p className="text-muted leading-relaxed whitespace-pre-wrap">{property.description}</p>
          </div>

          {/* Amenities */}
          <div>
            <h2 className="text-xl font-bold mb-4 font-display">Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3">
              {property.amenities.map((a: string) => (
                <div key={a} className="flex items-center gap-2 text-sm text-white/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                  {a.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div>
            <h2 className="text-xl font-bold mb-4 font-display">Location</h2>
            <PropertyMap properties={[property]} center={{ lat: property.location.lat, lng: property.location.lng }} />
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="lg:col-span-1">
          <div className="card-gold p-6 sticky top-24 space-y-6">
            <div className="text-center pb-6 border-b border-white/10">
              <p className="text-muted text-sm mb-1 uppercase tracking-wider">Asking Price</p>
              <p className="text-4xl font-display font-bold text-gradient-gold">{formatPrice(property.price)}</p>
              <p className="text-xs text-muted mt-2">Est. EMI: {formatPrice(property.price * 0.0085)}/mo</p>
            </div>

            <div className="space-y-3">
              {user?.role !== 'seller' && (
                <>
                  {isAuthenticated ? (
                    <button
                      onClick={() => interestMutation.mutate()}
                      disabled={interestMutation.isPending}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      <Handshake size={18} /> Express Interest
                    </button>
                  ) : (
                    <Link to={ROUTES.LOGIN} className="btn-primary w-full flex items-center justify-center gap-2">
                      Log in to Express Interest
                    </Link>
                  )}

                  <button className="btn-ghost border border-dark-border w-full flex items-center justify-center gap-2 text-sm">
                    <Heart size={16} /> Save for later
                  </button>
                </>
              )}
            </div>

            <div className="pt-4 text-xs text-muted text-center space-y-2">
              <p>📍 {property.viewCount} people viewed this recently</p>
              <p>🛡️ Zero brokerage on GharBid</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Building2Icon = ({ size, className }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
);
