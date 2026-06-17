import { sendOutbidEmail } from '../../services/emailService.js';
import { createNotification } from '../../services/notificationService.js';
import * as UserModel from '../../models/dynamodb/UserModel.js';

// Triggered by DynamoDB Streams on Bids table
export const handler = async (event) => {
  for (const record of event.Records) {
    if (record.eventName !== 'INSERT') continue;

    const newBid = record.dynamodb?.NewImage;
    if (!newBid) continue;

    const auctionId = newBid.auctionId?.S;
    const newBidderId = newBid.userId?.S;
    const amount = Number(newBid.amount?.N);

    // TODO: Find previous highest bidder and notify them of being outbid
    // This requires querying previous state – simplified here
    console.log(`New bid: ${amount} on auction ${auctionId} by ${newBidderId}`);

    await createNotification(
      newBidderId,
      'bid_placed',
      'Bid Placed Successfully',
      `Your bid of ₹${amount.toLocaleString('en-IN')} was placed on auction ${auctionId}`
    );
  }
};
