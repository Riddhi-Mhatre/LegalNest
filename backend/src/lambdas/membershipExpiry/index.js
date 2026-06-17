import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { sendMembershipExpiryEmail } from '../../services/emailService.js';

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION }));

// Triggered daily by EventBridge
export const handler = async () => {
  const now = new Date().toISOString();

  const { Items: users = [] } = await dynamo.send(new ScanCommand({
    TableName: process.env.DYNAMODB_USERS_TABLE,
    FilterExpression: 'membershipStatus = :active AND membershipExpiry < :now',
    ExpressionAttributeValues: { ':active': 'active', ':now': now },
  }));

  for (const user of users) {
    // Expire membership
    await dynamo.send(new UpdateCommand({
      TableName: process.env.DYNAMODB_USERS_TABLE,
      Key: { userId: user.userId },
      UpdateExpression: 'SET membershipStatus = :expired',
      ExpressionAttributeValues: { ':expired': 'expired' },
    }));

    // Send expiry email
    if (user.email) {
      await sendMembershipExpiryEmail(user.email, user.name, user.membershipExpiry);
    }
  }

  return { expired: users.length };
};
