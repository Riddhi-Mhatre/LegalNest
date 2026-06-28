import { Router } from 'express';
import * as authController from '../../controllers/authController.js';
import { validate } from '../../middleware/validation.js';
import { authLimiter } from '../../middleware/rateLimit.js';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from '../../validators/auth.validator.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/verify-email', authController.verifyEmail);
router.post('/respond-challenge', authLimiter, authController.respondToChallenge);

export default router;
