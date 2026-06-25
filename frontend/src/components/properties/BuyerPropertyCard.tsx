import { Heart, Scale, ShieldCheck, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatShortPrice } from '../../utils/formatters';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSavedProperties, saveProperty, removeSavedProperty } from '../../services/userService';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'sonner';

// Accepts the raw DynamoDB property shape returned by GET /v1/properties
interface Property {
  propertyId: string;
  title: string;
  address?: string;
  city?: string;
  state?: string;
  salePrice?: number;
  price?: number;
  type: string;
  listingType?: string;
  images?: string[];
  verificationStatus?: string;
  isVerified?: boolean;
}

interface BuyerPropertyCardProps {
  property: Property;
}

const PLACEHOLDER = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';

export function BuyerPropertyCard({ property }: BuyerPropertyCardProps) {
  const image = property.images?.[0] || PLACEHOLDER;
  const location = [property.city, property.state].filter(Boolean).join(', ') || property.address || 'Location not specified';
  const price = property.salePrice ?? property.price ?? 0;
  const verified = property.isVerified || property.verificationStatus === 'verified';

  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isBuyer = user?.role === 'buyer';

  const { data: savedItems = [] } = useQuery({
    queryKey: ['savedProperties'],
    queryFn: getSavedProperties,
    enabled: isBuyer,
  });

  const isSaved = savedItems.some((item: any) => item.propertyId === property.propertyId);

  const { mutate: toggleSave, isPending } = useMutation({
    mutationFn: async () => {
      if (!isBuyer) throw new Error('Must be a logged in buyer');
      if (isSaved) {
        await removeSavedProperty(property.propertyId);
      } else {
        await saveProperty(property.propertyId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedProperties'] });
      toast.success(isSaved ? 'Removed from saved properties' : 'Property saved successfully');
    },
    onError: (err: any) => {
      if (err.response?.status === 409) {
        // Already saved in backend, sync frontend state
        queryClient.invalidateQueries({ queryKey: ['savedProperties'] });
      } else {
        toast.error(err.response?.data?.error?.message || err.message || 'Failed to update saved properties');
      }
    }
  });

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden group hover:shadow-gold transition-all duration-500 hover:-translate-y-1 relative">
      {/* Image */}
      <div className="h-48 relative overflow-hidden bg-dark-border">
        <img
          src={image}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {verified && (
            <span className="bg-secondary/90 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 uppercase tracking-wider backdrop-blur-sm">
              <ShieldCheck size={12} /> Verified
            </span>
          )}
          <span className="bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider backdrop-blur-sm border border-white/10">
            {property.type}
          </span>
        </div>

        {/* Hover Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); if(isPending) return; toggleSave(); }}
            disabled={isPending}
            className={`p-2 bg-black/60 hover:bg-primary text-white hover:text-black rounded-full backdrop-blur-sm transition-colors shadow-lg ${isSaved ? 'text-primary' : ''} ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`} 
            title="Save Property"
          >
            <Heart size={16} className={isSaved ? 'fill-primary text-primary' : ''} />
          </button>
          <button className="p-2 bg-black/60 hover:bg-accent text-white rounded-full backdrop-blur-sm transition-colors shadow-lg" title="Compare">
            <Scale size={16} />
          </button>
        </div>

        {/* Price + Title overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          <div>
            <h3 className="text-white font-bold text-lg leading-tight drop-shadow-md line-clamp-1">{property.title}</h3>
            <div className="flex items-center gap-1 text-gray-300 text-xs mt-1 drop-shadow-md">
              <MapPin size={10} className="text-primary" />
              <span className="line-clamp-1">{location}</span>
            </div>
          </div>
          <div className="text-primary font-display font-black text-xl drop-shadow-lg ml-2 shrink-0">
            {formatShortPrice(price)}
          </div>
        </div>
      </div>

      <div className="p-4">
        <Link
          to={`/properties/${property.propertyId}`}
          className="block w-full text-center bg-white/5 hover:bg-primary text-white hover:text-black py-2 rounded text-xs font-bold uppercase tracking-widest transition-colors border border-dark-border hover:border-primary"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
