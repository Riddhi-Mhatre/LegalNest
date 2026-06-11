import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { env } from '../config/env';

// Verifier for Cognito ID Tokens
export const cognitoVerifier = CognitoJwtVerifier.create({
  userPoolId: env.COGNITO_USER_POOL_ID,
  tokenUse: 'id',
  clientId: env.COGNITO_CLIENT_ID,
});

export const verifyJwt = async (token: string) => {
  return await cognitoVerifier.verify(token);
};
