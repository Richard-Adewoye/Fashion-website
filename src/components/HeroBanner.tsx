import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

interface HeroBannerProps {
  onShopNow: () => void;
  onOpenStylist: () => void;
  onOpenLookbook: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onShopNow,
  onOpenStylist,
  onOpenLookbook,
}) => {
  return (
    <div className="relative bg-neutral-950 text-white overflow-hidden">
      {/* Background Hero Banner Image */}
      <div className="absolute inset-0 z-0 opacity-40">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=80"
          alt="ÉLAN Fashion Editorial"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/40" />
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 flex flex-col justify-center min-h-[560px]">
        <div className="max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono uppercase tracking-widest rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Autumn / Winter 2026 Archive</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-serif font-light text-white tracking-tight leading-none">
            Architectural Lines & <span className="italic font-normal text-amber-100">Tactile Luxury</span>
          </h2>

          <p className="text-neutral-300 text-base sm:text-lg font-light leading-relaxed max-w-xl">
            Sustainably harvested Mongolian cashmere, Italian virgin wool tailoring, and full-grain calfskin leather essentials crafted in limited artisanal batches.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              id="hero-shop-collection-btn"
              onClick={onShopNow}
              className="px-7 py-3.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-medium text-sm tracking-wider uppercase rounded-full transition-all flex items-center gap-2 shadow-lg hover:shadow-amber-400/20 group"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              id="hero-ai-stylist-btn"
              onClick={onOpenStylist}
              className="px-6 py-3.5 bg-neutral-900/80 hover:bg-neutral-800 text-white border border-neutral-700 hover:border-amber-400/50 font-light text-sm tracking-wider uppercase rounded-full transition-all flex items-center gap-2 backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI Outfit Stylist</span>
            </button>

            <button
              id="hero-lookbook-btn"
              onClick={onOpenLookbook}
              className="px-5 py-3.5 text-neutral-300 hover:text-white text-xs font-mono tracking-widest uppercase hover:underline underline-offset-4 transition-colors"
            >
              View Shoppable Lookbook →
            </button>
          </div>
        </div>
      </div>

      {/* Brand Value Propositions Ribbon */}
      <div className="relative z-10 border-t border-neutral-800/80 bg-neutral-900/80 backdrop-blur-md py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 text-neutral-300">
              <Truck className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-xs font-medium text-white uppercase tracking-wider">Express Delivery</h4>
                <p className="text-[11px] text-neutral-400 font-light">Complimentary over $200</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3 text-neutral-300">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-xs font-medium text-white uppercase tracking-wider">Artisanal Guarantee</h4>
                <p className="text-[11px] text-neutral-400 font-light">Italian & Japanese Textiles</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3 text-neutral-300">
              <RefreshCw className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-xs font-medium text-white uppercase tracking-wider">30-Day Doorstep Returns</h4>
                <p className="text-[11px] text-neutral-400 font-light">Hassle-free global pickup</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3 text-neutral-300">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-xs font-medium text-white uppercase tracking-wider">AI Personal Styling</h4>
                <p className="text-[11px] text-neutral-400 font-light">Instant custom wardrobe matches</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
