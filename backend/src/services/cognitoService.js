import {
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  GlobalSignOutCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  AdminAddUserToGroupCommand,
  AdminListGroupsForUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient } from '../config/aws.js';
import { env } from '../config/env.js';

export const signUp = async (input) => {
  const command = new SignUpCommand({
    ClientId: env.COGNITO_CLIENT_ID,
    Username: input.email,
    Password: input.password,
    UserAttributes: [
      { Name: 'email', Value: input.email },
      { Name: 'name', Value: input.name },
      ...(input.phone ? [{ Name: 'phone_number', Value: input.phone }] : []),
    ],
  });
  return cognitoClient.send(command);
};

export const signIn = async ({ email, password }) => {
  const params = {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: env.COGNITO_CLIENT_ID,
    AuthParameters: { USERNAME: email, PASSWORD: password },
  };
  const result = await cognitoClient.send(new InitiateAuthCommand(params));
  const role = await getUserRole(email);
  return { ...result.AuthenticationResult, role };
};

export const refreshSession = async (refreshToken) => {
  const params = {
    AuthFlow: 'REFRESH_TOKEN_AUTH',
    ClientId: env.COGNITO_CLIENT_ID,
    AuthParameters: { REFRESH_TOKEN: refreshToken },
  };
  const result = await cognitoClient.send(new InitiateAuthCommand(params));
  return result.AuthenticationResult;
};

export const signOut = async (accessToken) => {
  return cognitoClient.send(new GlobalSignOutCommand({ AccessToken: accessToken }));
};

export const requestOtp = async (phone) => {
  // Cognito custom auth flow or SMS OTP via SNS
  // Placeholder implementation
  return { message: `OTP sent to ${phone}` };
};

export const verifyOtp = async (phone, code) => {
  // Placeholder: verify code via Cognito custom auth
  return { verified: true, phone };
};

export const confirmSignUp = async (email, code) => {
  return cognitoClient.send(
    new ConfirmSignUpCommand({
      ClientId: env.COGNITO_CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
    })
  );
};

export const addUserToGroup = async (email, role) => {
  const groupName = role === 'buyer' ? 'Buyer' : 'Seller';

  return cognitoClient.send(
    new AdminAddUserToGroupCommand({
      UserPoolId: env.COGNITO_USER_POOL_ID,
      Username: email,
      GroupName: groupName,
    })
  );
};

export const getUserRole = async (email) => {
  const result = await cognitoClient.send(
    new AdminListGroupsForUserCommand({
      UserPoolId: env.COGNITO_USER_POOL_ID,
      Username: email,
    })
  );

  return result.Groups?.[0]?.GroupName || null;
};

export const forgotPassword = async (email) => {
  return cognitoClient.send(
    new ForgotPasswordCommand({
      ClientId: env.COGNITO_CLIENT_ID,
      Username: email,
    })
  );
};

export const confirmForgotPassword = async (email, code, newPassword) => {
  return cognitoClient.send(
    new ConfirmForgotPasswordCommand({
      ClientId: env.COGNITO_CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword,
    })
  );
};
