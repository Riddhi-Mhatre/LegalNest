import { Link } from 'react-router-dom';
import { CheckCircle, MapPin, Bed, Bath, Square } from 'lucide-react';
import type { Property } from '../../types/property.types';
import { formatShortPrice } from '../../utils/formatters';
import { ROUTES } from '../../utils/constants';

interface PropertyCardProps {
  property: Property;
  featured?: boolean;
}

export const PropertyCard = ({ property, featured }: PropertyCardProps) => {
  const isVerified =
    property.verificationStatus === 'approved' ||
    (property.verificationStatus as string) === 'verified' ||
    (property as any).status === 'approved';

  // Support both nested location object and flat city/state fields
  const city  = property.location?.city  ?? (property as any).city  ?? '';
  const state = property.location?.state ?? (property as any).state ?? '';
  const price = property.price ?? (property as any).salePrice ?? (property as any).rentPrice ?? 0;
  const area  = property.area  ?? (property as any).areasqft ?? 0;

  return (
    <Link
      to={ROUTES.PROPERTY_DETAIL(property.propertyId)}
      id={`property-card-${property.propertyId}`}
      className={`card group overflow-hidden block transition-all duration-300 hover:-translate-y-1 hover:shadow-gold ${featured ? 'card-gold' : ''}`}
      aria-label={`View ${property.title}`}
    >
      {/* Image */}
      <div className="relative overflow-hidden h-48 bg-dark-hover">
        {property.images[0] ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted">
            <Square size={32} />
          </div>
        )}
        {/* Verified Badge */}
        {isVerified && (
          <div className="absolute top-3 left-3">
            <span className="badge-verified">
              <CheckCircle size={10} />
              Verified
            </span>
          </div>
        )}
        {/* Price */}
        <div className="absolute bottom-3 right-3 bg-dark-card/90 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-dark-border">
          <span className="text-primary font-bold text-sm">{formatShortPrice(price)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-sm text-white line-clamp-1 mb-1">{property.title}</h3>
        <div className="flex items-center gap-1 text-muted text-xs mb-3">
          <MapPin size={11} />
          <span>{city}{city && state ? ', ' : ''}{state}</span>
        </div>

        {/* Property details */}
        <div className="flex items-center gap-3 text-muted text-xs">
          {property.bedrooms !== undefined && (
            <span className="flex items-center gap-1"><Bed size={11} /> {property.bedrooms} bed</span>
          )}
          {property.bathrooms !== undefined && (
            <span className="flex items-center gap-1"><Bath size={11} /> {property.bathrooms} bath</span>
          )}
          <span className="flex items-center gap-1"><Square size={11} /> {area.toLocaleString()} sqft</span>
        </div>
      </div>
    </Link>
  );
};
