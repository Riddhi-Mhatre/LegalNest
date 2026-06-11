export interface Property {
  propertyId: string;
  sellerId: string;
  title: string;
  description: string;
  type: 'apartment' | 'house' | 'villa' | 'plot' | 'commercial';
  price: number;
  area: number; // sq ft
  bedrooms?: number;
  bathrooms?: number;
  location: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    lat: number;
    lng: number;
    geohash: string;
  };
  amenities: string[];
  images: string[]; // S3 keys
  videos: string[]; // S3 keys
  documents: string[]; // S3 keys (private)
  verificationStatus: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  verifiedAt?: string;
  isAuctionRequested: boolean;
  viewCount: number;
  interestedBuyers: string[];
  createdAt: string;
  updatedAt?: string;
}
