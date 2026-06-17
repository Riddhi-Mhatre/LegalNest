import { Router } from 'express';
import * as authController from '../../controllers/authController.js';
import { validate } from '../../middleware/validation.js';
import { authLimiter } from '../../middleware/rateLimit.js';
import { loginSchema, registerSchema, otpSchema } from '../../validators/auth.validator.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/otp/request', authLimiter, authController.requestOtp);
router.post('/otp/verify', authLimiter, validate(otpSchema), authController.verifyOtp);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/verify-email', authController.verifyEmail);

export default router;
