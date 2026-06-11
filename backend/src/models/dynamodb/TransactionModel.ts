import * as dynamo from '../../services/dynamoService';
import { env } from '../../config/env';
import { Transaction } from '../entities/Transaction';

const TABLE = env.DYNAMODB_TRANSACTIONS_TABLE;

export const createTransaction = (tx: Partial<Transaction>) =>
  dynamo.putItem(TABLE, tx) as Promise<Transaction>;

export const getTransaction = (transactionId: string) =>
  dynamo.getItem(TABLE, { transactionId }) as Promise<Transaction | undefined>;

export const updateStatus = (transactionId: string, status: string, extra?: Partial<Transaction>) =>
  dynamo.updateItem(TABLE, { transactionId }, { status, ...extra });
