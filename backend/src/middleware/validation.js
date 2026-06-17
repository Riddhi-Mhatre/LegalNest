import { HTTP } from '../utils/constants.js';

export const validate = (schema) => {
  return (req, res, next) => {
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
