import * as dynamo from '../../services/dynamoService.js';
import { env } from '../../config/env.js';

const TABLE = env.DYNAMODB_MEMBERSHIPS_TABLE;

export const getMembership = (userId) =>
  dynamo.getItem(TABLE, { userId });

export const upsertMembership = (membership) =>
  dynamo.putItem(TABLE, membership);

export const updateMembership = (userId, updates) =>
  dynamo.updateItem(TABLE, { userId }, updates);
