import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(64),
  name: z.string().min(2).max(100),
  phone: z.string().regex(/^\+91[0-9]{10}$/).optional().or(z.literal('')),
  role: z.enum(['buyer', 'seller']),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const otpSchema = z.object({
  phone: z.string().regex(/^\+91[0-9]{10}$/),
  code: z.string().length(6),
});
