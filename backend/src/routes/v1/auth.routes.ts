import { Router } from 'express';
import * as authController from '../../controllers/authController';
import { validate } from '../../middleware/validation';
import { authLimiter } from '../../middleware/rateLimit';
import { loginSchema, registerSchema, otpSchema } from '../../validators/auth.validator';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/otp/request', authLimiter, authController.requestOtp);
router.post('/otp/verify', authLimiter, validate(otpSchema), authController.verifyOtp);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);

export default router;
router.post(
 '/verify-email',
 authController.verifyEmail
);