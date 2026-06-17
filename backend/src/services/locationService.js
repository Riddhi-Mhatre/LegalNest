import { SearchPlaceIndexForTextCommand, SearchPlaceIndexForPositionCommand } from '@aws-sdk/client-location';
import { locationClient } from '../config/aws.js';
import { env } from '../config/env.js';

export const geocodeAddress = async (query) => {
  const command = new SearchPlaceIndexForTextCommand({
    IndexName: env.LOCATION_INDEX_NAME,
    Text: query,
    MaxResults: 5,
  });
  const result = await locationClient.send(command);
  return result.Results;
};

export const reverseGeocode = async (lat, lng) => {
  const command = new SearchPlaceIndexForPositionCommand({
    IndexName: env.LOCATION_INDEX_NAME,
    Position: [lng, lat],
    MaxResults: 1,
  });
  const result = await locationClient.send(command);
  return result.Results?.[0];
};

export const searchNearbyPlaces = async (lat, lng, category) => {
  const command = new SearchPlaceIndexForTextCommand({
    IndexName: env.LOCATION_INDEX_NAME,
    Text: category,
    BiasPosition: [lng, lat],
    MaxResults: 10,
  });
  const result = await locationClient.send(command);
  return result.Results;
};
