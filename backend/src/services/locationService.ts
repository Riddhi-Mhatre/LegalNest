import { SearchPlaceIndexForTextCommand, SearchPlaceIndexForPositionCommand } from '@aws-sdk/client-location';
import { locationClient } from '../config/aws';
import { env } from '../config/env';

export const geocodeAddress = async (query: string) => {
  const command = new SearchPlaceIndexForTextCommand({
    IndexName: env.LOCATION_INDEX_NAME,
    Text: query,
    MaxResults: 5,
  });
  const result = await locationClient.send(command);
  return result.Results;
};

export const reverseGeocode = async (lat: number, lng: number) => {
  const command = new SearchPlaceIndexForPositionCommand({
    IndexName: env.LOCATION_INDEX_NAME,
    Position: [lng, lat],
    MaxResults: 1,
  });
  const result = await locationClient.send(command);
  return result.Results?.[0];
};

export const searchNearbyPlaces = async (lat: number, lng: number, category: string) => {
  const command = new SearchPlaceIndexForTextCommand({
    IndexName: env.LOCATION_INDEX_NAME,
    Text: category,
    BiasPosition: [lng, lat],
    MaxResults: 10,
  });
  const result = await locationClient.send(command);
  return result.Results;
};
