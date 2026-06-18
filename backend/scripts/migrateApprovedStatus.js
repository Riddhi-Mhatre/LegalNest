import 'dotenv/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const dynamo = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' })
);

const TABLE_NAME = process.env.DYNAMODB_PROPERTIES_TABLE || 'GharBid-Properties';

async function migrate() {
  console.log(`Starting migration on table: ${TABLE_NAME}`);
  
  try {
    let lastEvaluatedKey = undefined;
    let migratedCount = 0;

    do {
      const response = await dynamo.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: 'verificationStatus = :verified',
          ExpressionAttributeValues: {
            ':verified': 'verified',
          },
          ExclusiveStartKey: lastEvaluatedKey,
        })
      );

      const items = response.Items || [];

      for (const item of items) {
        await dynamo.send(
          new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { propertyId: item.propertyId },
            UpdateExpression: 'SET verificationStatus = :approved',
            ExpressionAttributeValues: {
              ':approved': 'approved',
            },
          })
        );
        console.log(`Migrated property: ${item.propertyId}`);
        migratedCount++;
      }

      lastEvaluatedKey = response.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    console.log(`Migration completed successfully. Migrated ${migratedCount} properties.`);
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrate();
