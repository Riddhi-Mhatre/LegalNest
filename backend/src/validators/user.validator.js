import { z } from 'zod';

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^\+91[0-9]{10}$/).optional(),
  profileImage: z.string().url().optional(),
});
