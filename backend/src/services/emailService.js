import { SendEmailCommand } from '@aws-sdk/client-ses';
import { sesClient } from '../config/aws.js';
import { env } from '../config/env.js';

const sendEmail = async ({ to, subject, html, text }) => {
  const command = new SendEmailCommand({
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject, Charset: 'UTF-8' },
      Body: {
        Html: { Data: html, Charset: 'UTF-8' },
        ...(text ? { Text: { Data: text, Charset: 'UTF-8' } } : {}),
      },
    },
    Source: env.SES_FROM_EMAIL,
  });
  return sesClient.send(command);
};

export const sendWelcomeEmail = (to, name) =>
  sendEmail({
    to,
    subject: 'Welcome to GharBid 🏠',
    html: `<h1>Welcome, ${name}!</h1><p>Your account is ready. Start exploring verified properties.</p>`,
  });

export const sendOutbidEmail = (to, auctionId, currentBid) =>
  sendEmail({
    to,
    subject: '⚡ You\'ve been outbid on GharBid',
    html: `<p>Someone placed a higher bid of ₹${currentBid.toLocaleString('en-IN')} on auction ${auctionId}. Bid again to stay in!</p>`,
  });

export const sendAuctionWinnerEmail = (to, propertyName) =>
  sendEmail({
    to,
    subject: '🏆 Congratulations! You won the auction',
    html: `<p>You are the highest bidder for <strong>${propertyName}</strong>. Admin will unlock the chat shortly.</p>`,
  });

export const sendMembershipExpiryEmail = (to, name, expiryDate) =>
  sendEmail({
    to,
    subject: '⚠️ Your GharBid membership is expiring',
    html: `<p>Hi ${name}, your membership expires on ${expiryDate}. Renew now to continue accessing listings.</p>`,
  });
