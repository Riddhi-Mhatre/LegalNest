import { z } from 'zod';

export const createPropertySchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().min(50).max(5000),
  type: z.enum(['apartment', 'house', 'villa', 'plot', 'commercial']),
  price: z.number().positive().max(1_000_000_000),
  area: z.number().positive(),
  bedrooms: z.number().int().min(0).max(20).optional(),
  bathrooms: z.number().int().min(0).max(20).optional(),
  location: z.object({
    address: z.string().min(10),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().regex(/^[0-9]{6}$/),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    geohash: z.string(),
  }),
  amenities: z.array(z.string()).default([]),
});

export const updatePropertySchema = createPropertySchema.partial();
