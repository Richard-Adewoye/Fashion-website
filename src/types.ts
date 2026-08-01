export type GenderCategory = 'women' | 'men' | 'unisex';

export type ProductCategory = 'outerwear' | 'knitwear' | 'dresses' | 'tailoring' | 'footwear' | 'accessories' | 'bags' | 'tops' | 'bottoms';

export interface ProductColor {
  name: string;
  hex: string;
  image?: string;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  price: number;
  originalPrice?: number;
  category: ProductCategory;
  gender: GenderCategory;
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  description: string;
  details: string[];
  composition: string;
  careInstructions: string;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isSustainable?: boolean;
  rating: number;
  reviewCount: number;
  reviews: ProductReview[];
}

export interface CartItem {
  product: Product;
  selectedColor: ProductColor;
  selectedSize: string;
  quantity: number;
}

export interface FilterState {
  category: ProductCategory | 'all';
  gender: GenderCategory | 'all';
  priceRange: [number, number];
  colors: string[];
  sizes: string[];
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
  searchQuery: string;
  onlySale: boolean;
  onlySustainable: boolean;
}

export interface LookbookHotspot {
  x: number; // percentage from left
  y: number; // percentage from top
  productId: string;
}

export interface LookbookSlide {
  id: string;
  title: string;
  season: string;
  image: string;
  description: string;
  hotspots: LookbookHotspot[];
}

export interface OrderDetails {
  orderId: string;
  date: string;
  items: CartItem[];
  shippingAddress: {
    fullName: string;
    email: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
  };
  shippingMethod: string;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
}

export interface ProductTrendingData {
  productId: string;
  name: string;
  category: string;
  price: number;
  views: number;
  cartAdditions: number;
  orders: number;
  popularityScore: number;
  trendingDelta: number;
}

export interface ChatActionPayload {
  type: 'RECOMMEND_PRODUCTS' | 'ADD_TO_CART' | 'CREATE_ORDER' | 'SHOW_INFO' | 'NONE';
  productIds?: string[];
  suggestedItems?: {
    productId: string;
    size?: string;
    colorName?: string;
    quantity?: number;
  }[];
  orderSummary?: {
    orderId: string;
    customerName: string;
    items: { productName: string; price: number; size: string; quantity: number }[];
    totalAmount: number;
    shippingAddress: string;
    estimatedDelivery: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  products?: Product[];
  action?: ChatActionPayload;
  orderConfirmation?: {
    orderId: string;
    customerName: string;
    items: { productName: string; price: number; size: string; quantity: number }[];
    totalAmount: number;
    shippingAddress: string;
    estimatedDelivery: string;
  };
}
