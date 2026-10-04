import { LoyaltyTier } from '../types';

export interface TierInfo {
  tier: LoyaltyTier;
  minPoints: number;
  maxPoints: number | null;
  multiplier: string;
  discountRate: number; // e.g. 5, 10, 15%
  tagline: string;
  colorHex: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  perks: string[];
}

export const LOYALTY_TIERS: Record<LoyaltyTier, TierInfo> = {
  Silver: {
    tier: 'Silver',
    minPoints: 0,
    maxPoints: 1499,
    multiplier: '1x Points per $1',
    discountRate: 5,
    tagline: 'Initiate Patron of the Maison',
    colorHex: '#94a3b8',
    badgeBg: 'bg-neutral-800',
    badgeText: 'text-neutral-200',
    borderColor: 'border-neutral-700',
    perks: [
      '1x Point per $1 spent on all seasonal collections',
      '5% Welcome atelier credit on archive releases',
      'Complimentary signature ÉLAN archival gift box packaging',
      'Exclusive 24-hour early access to seasonal private sales',
      'Annual birthday luxury celebration voucher ($50 value)',
    ],
  },
  Gold: {
    tier: 'Gold',
    minPoints: 1500,
    maxPoints: 3999,
    multiplier: '1.5x Points per $1',
    discountRate: 10,
    tagline: 'Distinguished Atelier Connoisseur',
    colorHex: '#f59e0b',
    badgeBg: 'bg-amber-950/80',
    badgeText: 'text-amber-300',
    borderColor: 'border-amber-500/50',
    perks: [
      '1.5x Points multiplier on every atelier purchase',
      '10% Maison privilege discount across tailoring and knitwear',
      'Complimentary Express Air Courier delivery worldwide',
      'Priority bespoke alterations at Paris & Tokyo flagship flagships',
      'Seasonal digital lookbook preview with lead artisan notes',
      'Direct WhatsApp concierge line with dedicated personal stylist',
    ],
  },
  Elite: {
    tier: 'Elite',
    minPoints: 4000,
    maxPoints: null,
    multiplier: '2x Points per $1',
    discountRate: 15,
    tagline: 'Haute Couture Circle & Maison Benefactor',
    colorHex: '#e2e8f0',
    badgeBg: 'bg-gradient-to-r from-amber-400/20 to-neutral-800',
    badgeText: 'text-amber-300 font-bold',
    borderColor: 'border-amber-400',
    perks: [
      '2x Double points multiplier on all purchases',
      '15% Permanent maison privilege discount on every collection',
      'Private in-salon fitting suite with champagne service in Paris & New York',
      'Hand-stitched custom artisan monogramming on cashmere and overcoats',
      'Personal invitation to ÉLAN Paris Fashion Week presentations',
      'Zero-wait pre-orders for limited-edition runway sample runs',
      'Complimentary annual cashmere de-pilling and garment restoration',
    ],
  },
};

export interface RedeemableReward {
  id: string;
  name: string;
  pointsCost: number;
  discountPercentage?: number;
  fixedDiscount?: number;
  promoCode: string;
  description: string;
  tierRequired: LoyaltyTier;
  category: 'voucher' | 'service' | 'gift';
}

export const REDEEMABLE_REWARDS: RedeemableReward[] = [
  {
    id: 'reward-50-voucher',
    name: '$50 Atelier Privilege Gift Voucher',
    pointsCost: 500,
    fixedDiscount: 50,
    promoCode: 'ELAN-PRIVILEGE-50',
    description: 'Direct deduction applied to your current checkout order total.',
    tierRequired: 'Silver',
    category: 'voucher',
  },
  {
    id: 'reward-10-archive',
    name: '10% Off Archival Cashmere & Tailoring',
    pointsCost: 1000,
    discountPercentage: 10,
    promoCode: 'ELAN-ARCHIVE-10',
    description: 'Valid across our sovereign coats, double-breasted blazers, and knitwear.',
    tierRequired: 'Silver',
    category: 'voucher',
  },
  {
    id: 'reward-silk-gift',
    name: 'Complimentary Silk Twill Pocket Square',
    pointsCost: 2000,
    fixedDiscount: 95,
    promoCode: 'ELAN-SILK-GIFT',
    description: 'Hand-rolled 100% Mulberry silk pocket square shipped with your next order.',
    tierRequired: 'Gold',
    category: 'gift',
  },
  {
    id: 'reward-15-couture',
    name: '15% Haute Couture Privilege Discount',
    pointsCost: 2500,
    discountPercentage: 15,
    promoCode: 'ELAN-ELITE-15',
    description: 'Full 15% discount across entire cart on any order.',
    tierRequired: 'Gold',
    category: 'voucher',
  },
  {
    id: 'reward-bespoke-fitting',
    name: 'Private Atelier VIP Fitting Session',
    pointsCost: 4000,
    promoCode: 'ELAN-SALON-VIP',
    description: 'Exclusive 90-minute salon appointment with our Master Tailor in Paris, NY, or Tokyo.',
    tierRequired: 'Elite',
    category: 'service',
  },
];

export interface LoyaltyOrderSummary {
  orderId: string;
  date: string;
  total: number;
  pointsEarned: number;
  itemsDescription: string;
  status: string;
}

// Initial mock orders matching OrderStatusModal data
export const INITIAL_LOYALTY_ORDERS: LoyaltyOrderSummary[] = [
  {
    orderId: 'ELAN-8942',
    date: 'July 30, 2026',
    total: 3056.4,
    pointsEarned: 3056,
    itemsDescription: 'The Sovereign Cashmere Coat, Silk-Blend Structured Blazer',
    status: 'Shipped',
  },
  {
    orderId: 'ELAN-7103',
    date: 'June 14, 2026',
    total: 1350.0,
    pointsEarned: 1350,
    itemsDescription: 'Architectural Silk Midi Dress',
    status: 'Delivered',
  },
];

export function calculateLoyaltyTier(lifetimePoints: number): LoyaltyTier {
  if (lifetimePoints >= 4000) return 'Elite';
  if (lifetimePoints >= 1500) return 'Gold';
  return 'Silver';
}

export function getNextTierInfo(currentTier: LoyaltyTier, lifetimePoints: number) {
  if (currentTier === 'Elite') {
    return {
      nextTier: null,
      pointsNeeded: 0,
      progressPercentage: 100,
    };
  }

  if (currentTier === 'Gold') {
    const target = 4000;
    const currentBase = 1500;
    const progress = Math.min(100, Math.max(0, ((lifetimePoints - currentBase) / (target - currentBase)) * 100));
    return {
      nextTier: 'Elite' as LoyaltyTier,
      pointsNeeded: Math.max(0, target - lifetimePoints),
      progressPercentage: Math.round(progress),
    };
  }

  // Silver
  const target = 1500;
  const progress = Math.min(100, Math.max(0, (lifetimePoints / target) * 100));
  return {
    nextTier: 'Gold' as LoyaltyTier,
    pointsNeeded: Math.max(0, target - lifetimePoints),
    progressPercentage: Math.round(progress),
  };
}
