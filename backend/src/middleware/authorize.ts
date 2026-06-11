import {
  Request,
  Response,
  NextFunction
} from 'express';

export const authorize =
(...roles: string[]) =>
(
 req: Request,
 res: Response,
 next: NextFunction
) => {

  const role =
   (req as any).user?.role;

 if (
  !role ||
  !roles.includes(role)
 ) {

  return res.status(403).json({
   message:
   'Access denied'
  });

 }

 next();
};