import * as cognitoService from '../services/cognitoService.js';
import * as UserModel from '../models/dynamodb/UserModel.js';
import { generateUUID } from '../utils/helpers.js';
import { logger } from '../utils/logger.js';
import { HTTP } from '../utils/constants.js';

// POST /v1/auth/register
export const register = async (req, res, next) => {
  try {
    const { email, password, phone, name, role } = req.body;
    // Sign up in Cognito
    const cognitoUser = await cognitoService.signUp({ email, password, phone, name, role });
    // Create user record in DynamoDB
    const userId = generateUUID();
    const userData = {
      userId,
      email,
      name,
      role,
      cognitoSub: cognitoUser.UserSub,
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
export const login = async (req, res, next) => {
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
export const requestOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;
    await cognitoService.requestOtp(phone);
    res.json({ success: true, data: { message: 'OTP sent to ' + phone } });
  } catch (err) {
    next(err);
  }
};

// POST /v1/auth/otp/verify
export const verifyOtp = async (req, res, next) => {
  try {
    const { phone, code } = req.body;
    const result = await cognitoService.verifyOtp(phone, code);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// POST /v1/auth/refresh
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await cognitoService.refreshSession(refreshToken);
    res.json({ success: true, data: tokens });
  } catch (err) {
    next(err);
  }
};

// POST /v1/auth/logout
export const logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) await cognitoService.signOut(token);
    res.json({ success: true, data: { message: 'Logged out' } });
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    await cognitoService.confirmSignUp(email, code);

    const user = await UserModel.getUserByEmail(email);

    await cognitoService.addUserToGroup(email, user.role);

    res.json({
      success: true,
      data: { message: 'Email verified successfully' },
    });
  } catch (err) {
    next(err);
  }
};
