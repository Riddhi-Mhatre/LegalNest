export const API_BASE = import.meta.env.VITE_API_BASE_URL;
export const WS_URL = import.meta.env.VITE_WS_URL;
export const ADMIN_EMAIL = 'gharbid.admin@gmail.com';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY: '/verify',
  PROPERTIES: '/properties',
  PROPERTY_DETAIL: (id: string) => `/properties/${id}`,
  AUCTION: (id: string) => `/auctions/${id}`,
  BUYER_DASHBOARD: '/buyer/dashboard',
  SELLER_DASHBOARD: '/seller/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
  CHAT: '/chat',
  PROFILE: '/profile',
  MEMBERSHIP: '/membership',
} as const;

export const AMENITIES = [
  'parking', 'gym', 'swimming_pool', 'security', 'elevator',
  'power_backup', 'water_supply', 'garden', 'clubhouse', 'wifi',
];

export const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'villa', label: 'Villa' },
  { value: 'plot', label: 'Plot' },
  { value: 'commercial', label: 'Commercial' },
];
