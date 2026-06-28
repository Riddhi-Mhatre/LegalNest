import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { LocationClient, SearchPlaceIndexForTextCommand } from '@aws-sdk/client-location';
import dotenv from 'dotenv';

dotenv.config();

const region = process.env.AWS_REGION || 'ap-south-1';
const tableName = process.env.DYNAMODB_PROPERTIES_TABLE || 'LegalNest-Properties';
const indexName = process.env.LOCATION_INDEX_NAME || 'LegalNestPlaceIndex';

const ddbRaw = new DynamoDBClient({ region });
const ddbDoc = DynamoDBDocumentClient.from(ddbRaw);
const locationClient = new LocationClient({ region });

async function run() {
  console.log('Fetching all properties...');
  const { Items } = await ddbDoc.send(new ScanCommand({ TableName: tableName }));
  
  if (!Items || Items.length === 0) {
    console.log('No properties found.');
    return;
  }
  
  let updatedCount = 0;
  
  for (const item of Items) {
    if (item.lat !== undefined && item.lng !== undefined) {
      console.log(`Skipping ${item.propertyId}, already has coordinates.`);
      continue;
    }
    
    const addressString = `${item.address || ''}, ${item.city || ''}, ${item.state || ''} ${item.pincode || ''}`.trim();
    if (addressString.length < 5) {
      console.log(`Skipping ${item.propertyId}, address too short: ${addressString}`);
      continue;
    }
    
    console.log(`Geocoding ${item.propertyId} -> ${addressString}`);
    try {
      const command = new SearchPlaceIndexForTextCommand({
        IndexName: indexName,
        Text: addressString,
        MaxResults: 1
      });
      
      const response = await locationClient.send(command);
      
      if (response.Results && response.Results.length > 0) {
        const [lng, lat] = response.Results[0].Place.Geometry.Point;
        
        await ddbDoc.send(new UpdateCommand({
          TableName: tableName,
          Key: { propertyId: item.propertyId },
          UpdateExpression: 'SET lat = :lat, lng = :lng',
          ExpressionAttributeValues: {
            ':lat': lat,
            ':lng': lng
          }
        }));
        
        console.log(`Successfully updated ${item.propertyId} with lat=${lat}, lng=${lng}`);
        updatedCount++;
      } else {
        console.log(`No results found for ${addressString}`);
      }
    } catch (err) {
      console.error(`Failed to geocode ${item.propertyId}: ${err.message}`);
    }
  }
  
  console.log(`Finished. Updated ${updatedCount} properties.`);
}

run();
