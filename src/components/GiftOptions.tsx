import React from 'react';
import { Gift, Check, Sparkles, Tag } from 'lucide-react';
import { formatCurrency } from '../data/currency';

interface GiftOptionsProps {
  isGift: boolean;
  setIsGift: (isGift: boolean) => void;
  giftRecipient: string;
  setGiftRecipient: (name: string) => void;
  giftMessage: string;
  setGiftMessage: (message: string) => void;
  giftWrappingCost: number;
  currency?: string;
}

export const GiftOptions: React.FC<GiftOptionsProps> = ({
  isGift,
  setIsGift,
  giftRecipient,
  setGiftRecipient,
  giftMessage,
  setGiftMessage,
  giftWrappingCost,
  currency = 'USD',
}) => {
  return (
    <div className={`p-4 rounded-2xl border transition-all ${
      isGift ? 'bg-amber-950/20 border-amber-500/50 shadow-lg' : 'bg-neutral-950 border-neutral-800'
    }`}>
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsGift(!isGift)}>
        <div className="flex items-center gap-2.5">
          <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
            isGift ? 'bg-amber-400 border-amber-400 text-neutral-950' : 'border-neutral-700 bg-neutral-900'
          }`}>
            {isGift && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-serif font-bold text-white tracking-wide">Signature Gift Packaging & Note</span>
            </div>
            <p className="text-[11px] text-neutral-400 font-light mt-0.5">
              Includes signature gift box, silk ribbon & handwritten calligraphy greeting card
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono uppercase bg-neutral-800 text-amber-300 border border-neutral-700 px-2 py-0.5 rounded-full">
          {giftWrappingCost > 0 ? formatCurrency(giftWrappingCost, currency) : 'FREE'}
        </span>
      </div>

      {isGift && (
        <div className="mt-4 pt-4 border-t border-neutral-800/80 space-y-3">
          <div>
            <label className="block text-[11px] font-mono text-neutral-400 mb-1">Recipient Name</label>
            <input
              type="text"
              value={giftRecipient}
              onChange={(e) => setGiftRecipient(e.target.value)}
              placeholder="e.g. Clara Dupont"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[11px] font-mono text-neutral-400">Gift Card Message</label>
              <span className="text-[10px] font-mono text-neutral-500">{giftMessage.length}/250</span>
            </div>
            <textarea
              value={giftMessage}
              maxLength={250}
              onChange={(e) => setGiftMessage(e.target.value)}
              placeholder="Write your heartfelt note... (e.g. Wishing you timeless happiness and sophistication!)"
              rows={3}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-400 focus:outline-none resize-none font-sans"
            />
          </div>

          {/* Elegant Calligraphy Note Preview */}
          {giftMessage.trim() && (
            <div className="p-3 bg-neutral-950 rounded-xl border border-amber-400/30 relative overflow-hidden">
              <div className="text-[10px] font-mono uppercase text-amber-300/80 mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Maison Calligraphy Card Preview</span>
              </div>
              <p className="text-xs font-serif italic text-neutral-200 leading-relaxed pl-2 border-l-2 border-amber-400/60">
                "{giftMessage}"
              </p>
              {giftRecipient && (
                <p className="text-[10px] font-mono text-amber-400/90 text-right mt-1.5">
                  — Prepared for {giftRecipient}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
