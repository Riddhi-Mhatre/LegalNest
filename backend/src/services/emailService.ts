import { SendEmailCommand } from '@aws-sdk/client-ses';
import { sesClient } from '../config/aws';
import { env } from '../config/env';

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const sendEmail = async ({ to, subject, html, text }: EmailParams) => {
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

export const sendWelcomeEmail = (to: string, name: string) =>
  sendEmail({
    to,
    subject: 'Welcome to GharBid 🏠',
    html: `<h1>Welcome, ${name}!</h1><p>Your account is ready. Start exploring verified properties.</p>`,
  });

export const sendOutbidEmail = (to: string, auctionId: string, currentBid: number) =>
  sendEmail({
    to,
    subject: '⚡ You\'ve been outbid on GharBid',
    html: `<p>Someone placed a higher bid of ₹${currentBid.toLocaleString('en-IN')} on auction ${auctionId}. Bid again to stay in!</p>`,
  });

export const sendAuctionWinnerEmail = (to: string, propertyName: string) =>
  sendEmail({
    to,
    subject: '🏆 Congratulations! You won the auction',
    html: `<p>You are the highest bidder for <strong>${propertyName}</strong>. Admin will unlock the chat shortly.</p>`,
  });

export const sendMembershipExpiryEmail = (to: string, name: string, expiryDate: string) =>
  sendEmail({
    to,
    subject: '⚠️ Your GharBid membership is expiring',
    html: `<p>Hi ${name}, your membership expires on ${expiryDate}. Renew now to continue accessing listings.</p>`,
  });
