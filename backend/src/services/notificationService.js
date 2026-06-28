import { generateUUID } from '../utils/helpers.js';
import * as dynamoService from './dynamoService.js';
import { env } from '../config/env.js';
import { snsClient } from '../config/aws.js';
import { PublishCommand } from '@aws-sdk/client-sns';

export const createNotification = async (userId, type, title, body, metadata) => {
  const notificationId = generateUUID();
  const notification = {
    userId,
    notificationId,
    type,
    title,
    body,
    metadata,
    isRead: false,
    createdAt: new Date().toISOString(),
    ttl: Math.floor(Date.now() / 1000) + 30 * 24 * 3600, // 30 days TTL
  };
  await dynamoService.putItem(env.DYNAMODB_NOTIFICATIONS_TABLE, notification);

  if (env.SNS_TOPIC_ARN) {
    try {
      await snsClient.send(new PublishCommand({
        TopicArn: env.SNS_TOPIC_ARN,
        Message: body,
        Subject: title,
        MessageAttributes: {
          Type: { DataType: 'String', StringValue: type },
          UserId: { DataType: 'String', StringValue: userId }
        }
      }));
    } catch (error) {
      console.error('Failed to publish notification to SNS:', error);
    }
  }

  return notification;
};

export const getUserNotifications = async (userId) => {
  return dynamoService.queryItems({
    tableName: env.DYNAMODB_NOTIFICATIONS_TABLE,
    keyCondition: 'userId = :uid',
    expressionValues: { ':uid': userId },
  });
};
