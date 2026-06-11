import { Request, Response, NextFunction } from 'express';
import * as cognitoService from '../services/cognitoService';
import * as UserModel from '../models/dynamodb/UserModel';
import { generateUUID } from '../utils/helpers';
import { logger } from '../utils/logger';
import { HTTP } from '../utils/constants';

// POST /v1/auth/register
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, phone, name, role } = req.body;
    // Sign up in Cognito
    const cognitoUser = await cognitoService.signUp({
  email,
  password,
  phone,
  name,
  role
});
    // Create user record in DynamoDB
    const userId = generateUUID();
    const userData: any = {
      userId,
      email,
      name,
      role,
      cognitoSub: cognitoUser.UserSub!,
      membershipStatus: 'none',
      createdAt: new Date().toISOString(),
      isVerified: false,
    };
    if (phone) {
      userData.phone = phone;
    }
    await UserModel.putUser(userData);
    res.status(HTTP.CREATED).json({ success: true, data: { userId, email, role } });
  } catch (err) {
    next(err);
  }
};

// POST /v1/auth/login
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const tokens = await cognitoService.signIn({ email, password });
    const user = await UserModel.getUserByEmail(email);
    res.json({ success: true, data: { token: tokens?.IdToken, user, cognitoTokens: tokens } });
  } catch (err) {
    next(err);
  }
};

// POST /v1/auth/otp/request
export const requestOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone } = req.body;
    await cognitoService.requestOtp(phone);
    res.json({ success: true, data: { message: 'OTP sent to ' + phone } });
  } catch (err) {
    next(err);
  }
};

// POST /v1/auth/otp/verify
export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, code } = req.body;
    const result = await cognitoService.verifyOtp(phone, code);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// POST /v1/auth/refresh
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await cognitoService.refreshSession(refreshToken);
    res.json({ success: true, data: tokens });
  } catch (err) {
    next(err);
  }
};

// POST /v1/auth/logout
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) await cognitoService.signOut(token);
    res.json({ success: true, data: { message: 'Logged out' } });
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, code } = req.body;

    await cognitoService.confirmSignUp(
      email,
      code
    );

    const user =
    await UserModel.getUserByEmail(email);
    
  await cognitoService.addUserToGroup(
    email,
    user.role as 'buyer' | 'seller'
);

    res.json({
      success: true,
      data: {
        message:
          'Email verified successfully'
      }
    });

  } catch (err) {
    next(err);
  }
};
