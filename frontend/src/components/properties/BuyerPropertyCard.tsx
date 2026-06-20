import { Heart, Scale, ShieldCheck, MapPin } from 'lucide-react';
import { formatShortPrice } from '../../utils/formatters';

interface BuyerPropertyCardProps {
  property: {
    id: string;
    title: string;
    location: string;
    price: number;
    type: string;
    image: string;
    isVerified: boolean;
  };
}

export function BuyerPropertyCard({ property }: BuyerPropertyCardProps) {
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden group hover:shadow-gold transition-all duration-500 hover:-translate-y-1 relative">
      {/* Image */}
      <div className="h-48 relative overflow-hidden">
        <img 
          src={property.image} 
          alt={property.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {property.isVerified && (
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
          <button className="p-2 bg-black/60 hover:bg-primary text-white hover:text-black rounded-full backdrop-blur-sm transition-colors shadow-lg" title="Save Property">
            <Heart size={16} />
          </button>
          <button className="p-2 bg-black/60 hover:bg-accent text-white rounded-full backdrop-blur-sm transition-colors shadow-lg" title="Compare">
            <Scale size={16} />
          </button>
        </div>

        {/* Price on Image */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          <div>
            <h3 className="text-white font-bold text-lg leading-tight drop-shadow-md">{property.title}</h3>
            <div className="flex items-center gap-1 text-gray-300 text-xs mt-1 drop-shadow-md">
              <MapPin size={10} className="text-primary" />
              <span>{property.location}</span>
            </div>
          </div>
          <div className="text-primary font-display font-black text-xl drop-shadow-lg">
            {formatShortPrice(property.price)}
          </div>
        </div>
      </div>

      <div className="p-4 flex gap-2">
         <button className="flex-1 bg-white/5 hover:bg-primary text-white hover:text-black py-2 rounded text-xs font-bold uppercase tracking-widest transition-colors border border-dark-border hover:border-primary">
            View Details
         </button>
      </div>
    </div>
  );
}
