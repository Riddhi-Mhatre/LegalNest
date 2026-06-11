import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { HTTP } from '../utils/constants';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(HTTP.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VAL_001',
          message: 'Validation failed',
          details: result.error.flatten().fieldErrors,
        },
      });
    }
    req.body = result.data;
    next();
  };
};
