import { z } from 'zod';
import { HTTP } from '../utils/constants.js';

// ─── Schemas ─────────────────────────────────────────────────────────────────

export const bidSchema = z.object({
  amount: z.number({ required_error: 'amount is required', invalid_type_error: 'amount must be a number' })
    .positive('amount must be positive')
    .int('amount must be a whole number')
    .max(10_000_000_000, 'amount exceeds maximum allowed value'),
});

export const autoBidSchema = z.object({
  maxAmount: z.number({ required_error: 'maxAmount is required', invalid_type_error: 'maxAmount must be a number' })
    .positive('maxAmount must be positive')
    .int('maxAmount must be a whole number')
    .max(10_000_000_000, 'maxAmount exceeds maximum allowed value'),
});

export const scheduleAuctionSchema = z.object({
  startingPrice: z.number({ required_error: 'startingPrice is required', invalid_type_error: 'startingPrice must be a number' })
    .positive('startingPrice must be positive')
    .max(10_000_000_000),
  reservePrice: z.number({ required_error: 'reservePrice is required', invalid_type_error: 'reservePrice must be a number' })
    .positive('reservePrice must be positive')
    .max(10_000_000_000),
  bidIncrement: z.number({ required_error: 'bidIncrement is required', invalid_type_error: 'bidIncrement must be a number' })
    .positive('bidIncrement must be positive')
    .max(100_000_000),
  startTime: z.string({ required_error: 'startTime is required' }).datetime({ message: 'startTime must be a valid ISO-8601 datetime' }),
  endTime: z.string({ required_error: 'endTime is required' }).datetime({ message: 'endTime must be a valid ISO-8601 datetime' }),
}).refine(data => new Date(data.endTime) > new Date(data.startTime), {
  message: 'endTime must be after startTime',
  path: ['endTime'],
}).refine(data => data.reservePrice >= data.startingPrice, {
  message: 'reservePrice must be >= startingPrice',
  path: ['reservePrice'],
});

// ─── Middleware Factory ───────────────────────────────────────────────────────
/**
 * Returns an Express middleware that validates req.body against the given Zod schema.
 * On failure it responds 400 with the first validation error message.
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const first = result.error.errors[0];
    return res.status(HTTP.BAD_REQUEST).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: first.message,
        field: first.path.join('.'),
      },
    });
  }
  // Replace req.body with coerced/validated data
  req.body = result.data;
  next();
};
