export interface CurrencyInfo {
  code: string;
  symbol: string;
  rate: number;
  label: string;
  flag: string;
  region: string;
}

export const CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', rate: 1, label: 'USD ($)', flag: '🇺🇸', region: 'United States & Americas' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92, label: 'EUR (€)', flag: '🇪🇺', region: 'Europe' },
  GBP: { code: 'GBP', symbol: '£', rate: 0.78, label: 'GBP (£)', flag: '🇬🇧', region: 'United Kingdom' },
  JPY: { code: 'JPY', symbol: '¥', rate: 155, label: 'JPY (¥)', flag: '🇯🇵', region: 'Japan' },
  CAD: { code: 'CAD', symbol: 'CA$', rate: 1.36, label: 'CAD (CA$)', flag: '🇨🇦', region: 'Canada' },
  AUD: { code: 'AUD', symbol: 'A$', rate: 1.52, label: 'AUD (A$)', flag: '🇦🇺', region: 'Australia' },
};

export const CURRENCY_LIST = Object.values(CURRENCIES);

export const STORAGE_KEY_CURRENCY = 'elan_store_currency';
export const STORAGE_KEY_AUTO_DETECTED = 'elan_currency_auto_detected_v1';
export const STORAGE_KEY_MANUAL_OVERRIDE = 'elan_currency_manual_override';

export interface GeolocationDetectionResult {
  currencyCode: string;
  regionName: string;
  confidence: 'high' | 'medium';
  method: 'timezone' | 'locale' | 'coordinates' | 'fallback';
}

/**
 * Detects visitor location and returns corresponding currency based on
 * browser timezone, locales, and environment.
 */
export const detectBrowserCurrency = (): GeolocationDetectionResult => {
  try {
    // 1. Timezone detection (zero-latency, standard across modern browsers)
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const tzLower = timeZone.toLowerCase();

    // UK timezones
    if (
      tzLower.includes('london') ||
      tzLower.includes('belfast') ||
      tzLower.startsWith('europe/london') ||
      tzLower.startsWith('europe/belfast') ||
      tzLower === 'gb'
    ) {
      return {
        currencyCode: 'GBP',
        regionName: 'United Kingdom',
        confidence: 'high',
        method: 'timezone',
      };
    }

    // European continent timezones
    if (tzLower.startsWith('europe/')) {
      return {
        currencyCode: 'EUR',
        regionName: 'Europe',
        confidence: 'high',
        method: 'timezone',
      };
    }

    // Japan timezones
    if (tzLower.includes('tokyo') || tzLower.startsWith('asia/tokyo')) {
      return {
        currencyCode: 'JPY',
        regionName: 'Japan',
        confidence: 'high',
        method: 'timezone',
      };
    }

    // Canada
    if (
      tzLower.includes('toronto') ||
      tzLower.includes('vancouver') ||
      tzLower.includes('montreal') ||
      tzLower.includes('edmonton') ||
      tzLower.includes('halifax') ||
      tzLower.includes('winnipeg')
    ) {
      return {
        currencyCode: 'CAD',
        regionName: 'Canada',
        confidence: 'high',
        method: 'timezone',
      };
    }

    // Australia
    if (tzLower.startsWith('australia/')) {
      return {
        currencyCode: 'AUD',
        regionName: 'Australia',
        confidence: 'high',
        method: 'timezone',
      };
    }

    // 2. Fallback to navigator languages
    const languages = typeof navigator !== 'undefined' ? navigator.languages || [navigator.language] : [];
    for (const lang of languages) {
      const langLower = (lang || '').toLowerCase();
      if (langLower === 'en-gb') {
        return {
          currencyCode: 'GBP',
          regionName: 'United Kingdom',
          confidence: 'medium',
          method: 'locale',
        };
      }
      if (
        langLower.endsWith('-fr') ||
        langLower.endsWith('-de') ||
        langLower.endsWith('-es') ||
        langLower.endsWith('-it') ||
        langLower.endsWith('-nl') ||
        langLower.endsWith('-be') ||
        langLower.endsWith('-at') ||
        langLower.endsWith('-pt') ||
        langLower.endsWith('-ie')
      ) {
        return {
          currencyCode: 'EUR',
          regionName: 'Europe',
          confidence: 'medium',
          method: 'locale',
        };
      }
      if (langLower.endsWith('-jp') || langLower.startsWith('ja')) {
        return {
          currencyCode: 'JPY',
          regionName: 'Japan',
          confidence: 'medium',
          method: 'locale',
        };
      }
    }
  } catch (e) {
    console.warn('Geolocation currency detection failed, falling back to USD', e);
  }

  return {
    currencyCode: 'USD',
    regionName: 'International / United States',
    confidence: 'medium',
    method: 'fallback',
  };
};

/**
 * Approximate coordinate bounds check if user authorizes navigator.geolocation
 */
export const detectCurrencyFromCoordinates = (
  latitude: number,
  longitude: number
): GeolocationDetectionResult => {
  // UK Bounding Box: approx lat 49.8 to 60.9, lon -8.6 to 1.8
  if (latitude >= 49.8 && latitude <= 60.9 && longitude >= -8.6 && longitude <= 1.8) {
    return {
      currencyCode: 'GBP',
      regionName: 'United Kingdom',
      confidence: 'high',
      method: 'coordinates',
    };
  }

  // Western & Central Europe: approx lat 35 to 71, lon -10 to 35
  if (latitude >= 35 && latitude <= 71 && longitude >= -10 && longitude <= 35) {
    return {
      currencyCode: 'EUR',
      regionName: 'Europe',
      confidence: 'high',
      method: 'coordinates',
    };
  }

  // Japan: approx lat 24 to 46, lon 123 to 146
  if (latitude >= 24 && latitude <= 46 && longitude >= 123 && longitude <= 146) {
    return {
      currencyCode: 'JPY',
      regionName: 'Japan',
      confidence: 'high',
      method: 'coordinates',
    };
  }

  return {
    currencyCode: 'USD',
    regionName: 'Americas / Global',
    confidence: 'medium',
    method: 'coordinates',
  };
};

/**
 * Format numerical USD value to selected currency with symbol
 */
export const formatCurrency = (amountInUSD: number, currencyCode: string = 'USD'): string => {
  const info = CURRENCIES[currencyCode] || CURRENCIES.USD;
  const converted = amountInUSD * info.rate;

  if (currencyCode === 'JPY') {
    return `${info.symbol}${Math.round(converted).toLocaleString()}`;
  }

  return `${info.symbol}${Math.round(converted).toLocaleString()}`;
};
