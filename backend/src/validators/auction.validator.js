import { z } from 'zod';

export const bidSchema = z.object({
  amount: z.number().positive().int().max(10_000_000_000),
});

export const autoBidSchema = z.object({
  maxAmount: z.number().positive().int().max(10_000_000_000),
});
