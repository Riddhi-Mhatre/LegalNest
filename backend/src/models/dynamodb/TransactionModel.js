import * as dynamo from '../../services/dynamoService.js';
import { env } from '../../config/env.js';

const TABLE = env.DYNAMODB_TRANSACTIONS_TABLE;

export const createTransaction = (tx) =>
  dynamo.putItem(TABLE, tx);

export const getTransaction = (transactionId) =>
  dynamo.getItem(TABLE, { transactionId });

export const updateStatus = (transactionId, status, extra) =>
  dynamo.updateItem(TABLE, { transactionId }, { status, ...extra });
