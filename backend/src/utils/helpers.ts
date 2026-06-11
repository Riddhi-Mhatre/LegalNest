import { v4 as uuidv4 } from 'uuid';

export const generateUUID = (): string => uuidv4();

export const calculateCommission = (price: number, ratePercent = 2): number =>
  Math.round(price * (ratePercent / 100));

// Simple geohash encoder (precision 6 = ~1.2km)
const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
export const geohashEncode = (lat: number, lng: number, precision = 6): string => {
  let isEven = true;
  let bit = 0;
  let ch = 0;
  let geohash = '';
  let minLat = -90, maxLat = 90, minLng = -180, maxLng = 180;

  while (geohash.length < precision) {
    const mid = isEven ? (minLng + maxLng) / 2 : (minLat + maxLat) / 2;
    const val = isEven ? lng : lat;
    if (val >= mid) {
      ch |= 1 << (4 - bit);
      if (isEven) minLng = mid; else minLat = mid;
    } else {
      if (isEven) maxLng = mid; else maxLat = mid;
    }
    isEven = !isEven;
    if (bit < 4) { bit++; } else { geohash += BASE32[ch]; bit = 0; ch = 0; }
  }
  return geohash;
};

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
