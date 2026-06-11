import 'dotenv/config';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { v4 as uuid } from 'uuid';

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' }));

const seedUsers = async () => {
  const users = [
    { userId: uuid(), email: 'admin@gharbid.com', name: 'Admin User', role: 'admin', isVerified: true, membershipStatus: 'active', cognitoSub: 'admin-cognito-sub', createdAt: new Date().toISOString() },
    { userId: uuid(), email: 'buyer@gharbid.com', name: 'Test Buyer', role: 'buyer', isVerified: true, membershipStatus: 'active', cognitoSub: 'buyer-cognito-sub', createdAt: new Date().toISOString() },
    { userId: uuid(), email: 'seller@gharbid.com', name: 'Test Seller', role: 'seller', isVerified: true, membershipStatus: 'active', cognitoSub: 'seller-cognito-sub', createdAt: new Date().toISOString() },
  ];

  for (const user of users) {
    await dynamo.send(new PutCommand({ TableName: 'GharBid-Users', Item: user }));
    console.log(`✅ Seeded user: ${user.email}`);
  }
};

const seedProperties = async () => {
  const property = {
    propertyId: uuid(),
    sellerId: 'seller-id-placeholder',
    title: '3BHK Premium Apartment in Koramangala',
    description: 'Luxurious 3BHK apartment with modern amenities in the heart of Bangalore.',
    type: 'apartment',
    price: 7500000,
    area: 1450,
    bedrooms: 3,
    bathrooms: 2,
    location: {
      address: '123, 5th Block, Koramangala',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560034',
      lat: 12.9352,
      lng: 77.6245,
      geohash: 'tdr1u',
    },
    amenities: ['parking', 'gym', 'swimming_pool', 'security'],
    images: [],
    videos: [],
    documents: [],
    verificationStatus: 'verified',
    isAuctionRequested: false,
    viewCount: 0,
    interestedBuyers: [],
    createdAt: new Date().toISOString(),
  };

  await dynamo.send(new PutCommand({ TableName: 'GharBid-Properties', Item: property }));
  console.log(`✅ Seeded property: ${property.title}`);
};

async function seed() {
  await seedUsers();
  await seedProperties();
  console.log('🌱 Database seeded successfully');
}

seed();
