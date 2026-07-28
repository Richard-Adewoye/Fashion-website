import React, { useState } from 'react';
import { X, Sparkles, ShoppingBag, Check, ArrowRight, RefreshCw, Wand2 } from 'lucide-react';
import { Product, ProductColor } from '../types';

interface AIStylistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddMultipleToCart: (items: { product: Product; size: string; color: ProductColor }[]) => void;
}

interface StylistResponse {
  outfitTitle: string;
  concept: string;
  recommendedProductIds: string[];
  stylingTip: string;
  vibeKeywords: string[];
}

export const AIStylistDrawer: React.FC<AIStylistDrawerProps> = ({
  isOpen,
  onClose,
  products,
  onAddMultipleToCart,
}) => {
  if (!isOpen) return null;

  const [occasion, setOccasion] = useState('Cocktail Soirée');
  const [styleVibe, setStyleVibe] = useState('Quiet Luxury');
  const [gender, setGender] = useState('Women');
  const [season, setSeason] = useState('Autumn/Winter');
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<StylistResponse | null>(null);
  const [sourceTag, setSourceTag] = useState('');
  const [addedAllAnimation, setAddedAllAnimation] = useState(false);

  const occasions = [
    'Cocktail Soirée',
    'Executive Business Meeting',
    'Weekend Getaway in Kyoto',
    'Gallery Opening',
    'Minimalist Daily Wear',
  ];

  const vibes = [
    'Quiet Luxury',
    'Parisian Chic',
    'Sculptural Minimalist',
    'Cozy Oversized',
    'Sharp Tailored',
  ];

  const handleGenerateOutfit = async () => {
    setLoading(true);
    setRecommendation(null);

    try {
      const response = await fetch('/api/stylist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ occasion, styleVibe, gender, season }),
      });

      const data = await response.json();
      if (data.success && data.recommendation) {
        setRecommendation(data.recommendation);
        setSourceTag(data.source === 'gemini-ai' ? 'Powered by Gemini AI' : 'ÉLAN Atelier Engine');
      }
    } catch (err) {
      console.error('AI Stylist Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const recommendedProducts = recommendation
    ? products.filter((p) => recommendation.recommendedProductIds.includes(p.id))
    : [];

  const outfitTotalPrice = recommendedProducts.reduce((acc, p) => acc + p.price, 0);

  const handleAddEntireLook = () => {
    if (recommendedProducts.length === 0) return;

    const itemsToAdd = recommendedProducts.map((p) => ({
      product: p,
      size: p.sizes[0],
      color: p.colors[0],
    }));

    onAddMultipleToCart(itemsToAdd);
    setAddedAllAnimation(true);
    setTimeout(() => setAddedAllAnimation(false), 2500);
  };

  return (
    <div id="ai-stylist-drawer-overlay" className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex justify-end">
      <div 
        id="ai-stylist-drawer-content"
        className="w-full max-w-lg bg-neutral-900 border-l border-neutral-800 text-white h-full flex flex-col justify-between shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-400/20 border border-amber-400/30 rounded-full">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-serif tracking-wider uppercase">AI Personal Stylist</h3>
              <p className="text-[10px] text-neutral-400 font-mono">Artisanal outfit curation powered by Gemini</p>
            </div>
          </div>

          <button
            id="close-ai-stylist-btn"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Form Inputs */}
          <div className="space-y-4 bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
            {/* Occasion */}
            <div>
              <label className="block text-xs font-mono uppercase text-amber-300 mb-1.5">
                What is the occasion?
              </label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full bg-neutral-900 text-white text-xs border border-neutral-800 rounded-xl p-2.5 focus:border-amber-400 focus:outline-none"
              >
                {occasions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            {/* Aesthetic Vibe */}
            <div>
              <label className="block text-xs font-mono uppercase text-amber-300 mb-1.5">
                Style Vibe & Aesthetic
              </label>
              <select
                value={styleVibe}
                onChange={(e) => setStyleVibe(e.target.value)}
                className="w-full bg-neutral-900 text-white text-xs border border-neutral-800 rounded-xl p-2.5 focus:border-amber-400 focus:outline-none"
              >
                {vibes.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            {/* Preference */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase text-amber-300 mb-1.5">
                  Gender Preference
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-neutral-900 text-white text-xs border border-neutral-800 rounded-xl p-2.5 focus:border-amber-400"
                >
                  <option value="Women">Women</option>
                  <option value="Men">Men</option>
                  <option value="Unisex">Unisex / All</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-amber-300 mb-1.5">
                  Season
                </label>
                <select
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  className="w-full bg-neutral-900 text-white text-xs border border-neutral-800 rounded-xl p-2.5 focus:border-amber-400"
                >
                  <option value="Autumn/Winter">Autumn / Winter</option>
                  <option value="Spring/Summer">Spring / Summer</option>
                </select>
              </div>
            </div>

            <button
              id="generate-ai-look-btn"
              onClick={handleGenerateOutfit}
              disabled={loading}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-neutral-950" />
                  <span>Curating Head-to-Toe Look...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Curate Custom Outfit</span>
                </>
              )}
            </button>
          </div>

          {/* AI Recommendation Result Card */}
          {recommendation && (
            <div id="ai-recommendation-card" className="bg-neutral-950 p-5 rounded-2xl border border-amber-400/30 space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    {sourceTag}
                  </span>
                  <h4 className="text-lg font-serif text-white mt-1">{recommendation.outfitTitle}</h4>
                </div>
              </div>

              <p className="text-xs text-neutral-300 font-light leading-relaxed">
                {recommendation.concept}
              </p>

              {/* Vibe Tags */}
              <div className="flex flex-wrap gap-1.5">
                {recommendation.vibeKeywords?.map((kw, i) => (
                  <span key={i} className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-2.5 py-0.5 rounded-full border border-neutral-800">
                    #{kw}
                  </span>
                ))}
              </div>

              {/* Curated Products List */}
              <div className="space-y-3 pt-2">
                <p className="text-xs font-mono uppercase text-amber-200">Recommended Ensemble Pieces:</p>
                {recommendedProducts.map((p) => (
                  <div key={p.id} className="flex gap-3 bg-neutral-900 p-2.5 rounded-xl border border-neutral-800 items-center">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-14 object-cover rounded-lg bg-neutral-950"
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-medium text-white truncate">{p.name}</h5>
                      <p className="text-[10px] text-neutral-400 font-mono capitalize">{p.category}</p>
                    </div>
                    <span className="text-xs font-mono font-semibold text-amber-300">${p.price}</span>
                  </div>
                ))}
              </div>

              {/* Styling Advice */}
              <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800 text-[11px] text-neutral-300 font-light">
                <strong className="text-amber-300 font-mono block mb-0.5">Styling Tip:</strong>
                {recommendation.stylingTip}
              </div>

              {/* Add Entire Look Button */}
              <button
                id="add-entire-look-btn"
                onClick={handleAddEntireLook}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                {addedAllAnimation ? (
                  <>
                    <Check className="w-4 h-4 text-neutral-950" />
                    <span>Entire Look Added to Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add Entire Look to Bag (${outfitTotalPrice})</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
