import { Product, PriceDropAlert, PriceDropNotification } from '../types';

const ALERTS_STORAGE_KEY = 'elan_price_drop_alerts';
const NOTIFICATIONS_STORAGE_KEY = 'elan_price_drop_notifications';

export const getSavedPriceDropAlerts = (): PriceDropAlert[] => {
  try {
    const raw = localStorage.getItem(ALERTS_STORAGE_KEY);
    if (!raw) {
      // Default sample alerts for initial wishlist items
      return [
        {
          productId: 'elan-02',
          productName: 'Pure Cashmere Mock-Neck Knit',
          initialPrice: 285,
          trackedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          active: true,
        },
        {
          productId: 'elan-05',
          productName: 'Structured Pleated Midi Skirt',
          initialPrice: 220,
          trackedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          active: true,
        },
      ];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse price drop alerts', e);
    return [];
  }
};

export const savePriceDropAlerts = (alerts: PriceDropAlert[]): void => {
  try {
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
  } catch (e) {
    console.error('Failed to save price drop alerts', e);
  }
};

export const getSavedPriceDropNotifications = (): PriceDropNotification[] => {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) {
      return [
        {
          id: 'pdrop-init-1',
          productId: 'elan-01',
          productName: 'Atelier Wool Blend Overcoat',
          productImage: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=1000&q=80',
          oldPrice: 495,
          newPrice: 420,
          savings: 75,
          percentDrop: 15,
          timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
          read: false,
        },
      ];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse price drop notifications', e);
    return [];
  }
};

export const savePriceDropNotifications = (notifs: PriceDropNotification[]): void => {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifs));
  } catch (e) {
    console.error('Failed to save price drop notifications', e);
  }
};
