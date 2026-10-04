import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, X, Check, Globe, Sparkles, Navigation } from 'lucide-react';
import { CURRENCIES } from '../data/currency';

interface CurrencyGeoBannerProps {
  isVisible: boolean;
  detectedRegion: string;
  currencyCode: string;
  detectionMethod: string;
  onConfirm: () => void;
  onOpenSelector: () => void;
  onRequestGpsDetect?: () => void;
}

export const CurrencyGeoBanner: React.FC<CurrencyGeoBannerProps> = ({
  isVisible,
  detectedRegion,
  currencyCode,
  detectionMethod,
  onConfirm,
  onOpenSelector,
  onRequestGpsDetect,
}) => {
  if (!isVisible) return null;

  const currencyInfo = CURRENCIES[currencyCode] || CURRENCIES.USD;

  return (
    <AnimatePresence>
      <motion.div
        id="currency-geo-banner"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="bg-gradient-to-r from-neutral-950 via-amber-950/40 to-neutral-950 border-b border-amber-500/30 text-neutral-200 text-xs py-2.5 px-4 relative z-40 overflow-hidden shadow-lg"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-2.5 text-center sm:text-left">
            <span className="w-6 h-6 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
              <MapPin className="w-3.5 h-3.5 animate-bounce" />
            </span>
            <div className="text-[11px] sm:text-xs">
              <span className="text-neutral-400">Welcome to Maison Élan. We detected your location as </span>
              <strong className="text-white font-semibold">{detectedRegion}</strong>
              <span className="text-neutral-400"> — prices are set to </span>
              <span className="text-amber-300 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/30">
                {currencyInfo.flag} {currencyInfo.code} ({currencyInfo.symbol})
              </span>
              <span className="text-neutral-500 text-[10px] hidden md:inline ml-1.5">
                (via browser {detectionMethod})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onRequestGpsDetect && (
              <button
                type="button"
                onClick={onRequestGpsDetect}
                className="hidden lg:flex items-center gap-1 px-2 py-1 bg-neutral-900 hover:bg-neutral-850 text-neutral-300 hover:text-white rounded-lg border border-neutral-800 text-[10px] transition-colors"
                title="Verify location with browser GPS"
              >
                <Navigation className="w-3 h-3 text-amber-400" />
                <span>Verify GPS</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenSelector}
              className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-850 text-neutral-300 hover:text-white rounded-lg border border-neutral-750 text-[11px] transition-colors"
            >
              Change
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-lg text-[11px] transition-all flex items-center gap-1 shadow"
            >
              <Check className="w-3 h-3" />
              <span>Keep {currencyInfo.code}</span>
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="text-neutral-500 hover:text-white p-1 rounded-full hover:bg-neutral-800 transition-colors ml-1"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
