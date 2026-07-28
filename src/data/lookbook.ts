import { LookbookSlide } from '../types';

export const LOOKBOOK_SLIDES: LookbookSlide[] = [
  {
    id: 'lb-1',
    title: 'The Paris Monochrome Collection',
    season: 'Autumn / Winter 2026 Editorial',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80',
    description: 'Understated elegance anchored in architectural lines, tonal wools, and refined calfskin leather accessories.',
    hotspots: [
      { x: 35, y: 32, productId: 'elan-01' }, // Atelier Wool Blend Overcoat
      { x: 55, y: 55, productId: 'elan-05' }, // Calfskin City Tote
      { x: 42, y: 80, productId: 'elan-08' }, // Lug-Sole Chelsea Boot
    ],
  },
  {
    id: 'lb-2',
    title: 'Warm Layers & Cashmere Drapes',
    season: 'High-Winter Capsule',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80',
    description: 'Tactile knitwear layered with relaxed tailoring for effortlessly cozy sophistication.',
    hotspots: [
      { x: 45, y: 38, productId: 'elan-02' }, // Cashmere Mock-Neck
      { x: 62, y: 25, productId: 'elan-09' }, // Acetate Sunglasses
      { x: 30, y: 70, productId: 'elan-12' }, // Pleated Trousers
    ],
  },
  {
    id: 'lb-3',
    title: 'Gentleman Tailoring & Outerwear',
    season: 'Menswear Archive',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=80',
    description: 'Crisp outerwear silhouettes paired with Italian merino ribbed knits and Portuguese leather loafers.',
    hotspots: [
      { x: 48, y: 30, productId: 'elan-06' }, // Urban Trench Coat
      { x: 52, y: 50, productId: 'elan-07' }, // Heavyweight Ribbed Merino Sweater
      { x: 45, y: 85, productId: 'elan-10' }, // Penny Loafer
    ],
  },
];
