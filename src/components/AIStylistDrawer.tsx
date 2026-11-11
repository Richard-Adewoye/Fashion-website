import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  ShoppingBag,
  Check,
  RefreshCw,
  Wand2,
  Layers,
  Plus,
  Trash2,
  Tag,
  Percent,
  SlidersHorizontal,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Product, ProductColor, ProductCategory, ProductStyle } from '../types';
import { formatCurrency } from '../data/currency';
import { StylePersonalityQuiz } from './StylePersonalityQuiz';

interface AIStylistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddMultipleToCart: (items: { product: Product; size: string; color: ProductColor }[]) => void;
  onAddToCart?: (product: Product, size: string, color: ProductColor, quantity?: number) => void;
  onSelectProduct?: (product: Product) => void;
  currency?: string;
}

interface StylistResponse {
  outfitTitle: string;
  concept: string;
  recommendedProductIds: string[];
  stylingTip: string;
  vibeKeywords: string[];
}

interface SelectedOutfitItem {
  product: Product;
  selectedSize: string;
  selectedColor: ProductColor;
}

const BUNDLE_DISCOUNT_PERCENTAGE = 15; // 15% discount when 3 or 4 items selected

export const AIStylistDrawer: React.FC<AIStylistDrawerProps> = ({
  isOpen,
  onClose,
  products,
  onAddMultipleToCart,
  onAddToCart,
  onSelectProduct,
  currency = 'USD',
}) => {
  if (!isOpen) return null;

  // Active Tab: 'style-quiz' | 'outfit-builder' | 'ai-curation'
  const [activeTab, setActiveTab] = useState<'style-quiz' | 'outfit-builder' | 'ai-curation'>('style-quiz');

  // AI Curation State
  const [occasion, setOccasion] = useState('Cocktail Soirée');
  const [styleVibe, setStyleVibe] = useState('Quiet Luxury');
  const [gender, setGender] = useState('Women');
  const [season, setSeason] = useState('Autumn/Winter');
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<StylistResponse | null>(null);
  const [sourceTag, setSourceTag] = useState('');
  const [addedAllAnimation, setAddedAllAnimation] = useState(false);

  // Outfit Builder State: 3 to 4 complementary items
  const [selectedOutfitItems, setSelectedOutfitItems] = useState<SelectedOutfitItem[]>(() => {
    // Initial 3 complementary items if available
    const initialIds = ['elan-01', 'elan-05', 'elan-03'];
    const matched = products.filter((p) => initialIds.includes(p.id));
    if (matched.length >= 3) {
      return matched.map((p) => ({
        product: p,
        selectedSize: p.sizes[0] || 'M',
        selectedColor: p.colors[0],
      }));
    }
    return products.slice(0, 3).map((p) => ({
      product: p,
      selectedSize: p.sizes[0] || 'M',
      selectedColor: p.colors[0],
    }));
  });

  const [builderCategoryFilter, setBuilderCategoryFilter] = useState<string>('all');
  const [builderStyleFilter, setBuilderStyleFilter] = useState<string>('all');
  const [builderSearch, setBuilderSearch] = useState('');
  const [addedBundleAnimation, setAddedBundleAnimation] = useState(false);

  // Quick Start Capsules
  const curatedCapsules = [
    {
      name: 'The Parisian Minimalist',
      style: 'Minimalist' as ProductStyle,
      productIds: ['elan-01', 'elan-05', 'elan-03', 'elan-10'],
      description: 'Atelier wool overcoat, draped silk blouse, pleated trouser & cashmere scarf',
    },
    {
      name: 'The Modern Tailored',
      style: 'Classic' as ProductStyle,
      productIds: ['elan-11', 'elan-02', 'elan-14', 'elan-16'],
      description: 'Double-breasted blazer, fine cashmere knit, wide-leg trouser & structured tote',
    },
    {
      name: 'The Bohemian Luxe',
      style: 'Bohemian' as ProductStyle,
      productIds: ['elan-04', 'elan-07', 'elan-15'],
      description: 'Artisanal midi dress, oversized knit cardigan & brushed suede ankle boot',
    },
    {
      name: 'The Industrial Utilitarian',
      style: 'Industrial' as ProductStyle,
      productIds: ['elan-06', 'elan-08', 'elan-09'],
      description: 'Hardware trench, utilitarian tailored trouser & sculptured leather loafer',
    },
  ];

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

  // AI Generation Handler
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

  // Outfit Builder Operations
  const handleAddProductToOutfit = (product: Product) => {
    if (selectedOutfitItems.length >= 4) return;
    if (selectedOutfitItems.some((item) => item.product.id === product.id)) return;

    setSelectedOutfitItems((prev) => [
      ...prev,
      {
        product,
        selectedSize: product.sizes[0] || 'M',
        selectedColor: product.colors[0],
      },
    ]);
  };

  const handleRemoveProductFromOutfit = (productId: string) => {
    setSelectedOutfitItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleUpdateItemSize = (productId: string, newSize: string) => {
    setSelectedOutfitItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, selectedSize: newSize } : item))
    );
  };

  const handleUpdateItemColor = (productId: string, newColor: ProductColor) => {
    setSelectedOutfitItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, selectedColor: newColor } : item))
    );
  };

  const handleApplyCapsulePreset = (capsule: typeof curatedCapsules[0]) => {
    const matched = capsule.productIds
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean) as Product[];

    if (matched.length > 0) {
      setSelectedOutfitItems(
        matched.slice(0, 4).map((p) => ({
          product: p,
          selectedSize: p.sizes[0] || 'M',
          selectedColor: p.colors[0],
        }))
      );
    }
  };

  const handleLoadCapsuleToBuilder = (capsuleProducts: Product[]) => {
    if (!capsuleProducts || capsuleProducts.length === 0) return;
    setSelectedOutfitItems(
      capsuleProducts.slice(0, 4).map((p) => ({
        product: p,
        selectedSize: p.sizes[0] || 'M',
        selectedColor: p.colors[0],
      }))
    );
    setActiveTab('outfit-builder');
  };

  // Bundle Pricing Calculations
  const selectedCount = selectedOutfitItems.length;
  const isBundleEligible = selectedCount >= 3 && selectedCount <= 4;
  const bundleSubtotal = selectedOutfitItems.reduce((acc, item) => acc + item.product.price, 0);
  const bundleDiscountAmount = isBundleEligible
    ? Math.round((bundleSubtotal * BUNDLE_DISCOUNT_PERCENTAGE) / 100)
    : 0;
  const bundleFinalPrice = bundleSubtotal - bundleDiscountAmount;

  const handleAddCompleteLookToBag = () => {
    if (selectedOutfitItems.length === 0) return;

    const itemsToAdd = selectedOutfitItems.map((item) => ({
      product: item.product,
      size: item.selectedSize,
      color: item.selectedColor,
    }));

    onAddMultipleToCart(itemsToAdd);
    setAddedBundleAnimation(true);
    setTimeout(() => setAddedBundleAnimation(false), 2500);
  };

  // Filtered catalog palette for adding complementary pieces
  const filteredPaletteProducts = useMemo(() => {
    return products.filter((p) => {
      if (builderCategoryFilter !== 'all' && p.category !== builderCategoryFilter) {
        return false;
      }
      if (builderStyleFilter !== 'all' && p.style !== builderStyleFilter) {
        return false;
      }
      if (builderSearch) {
        const q = builderSearch.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.style && p.style.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [products, builderCategoryFilter, builderStyleFilter, builderSearch]);

  return (
    <div id="ai-stylist-drawer-overlay" className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex justify-end">
      <div
        id="ai-stylist-drawer-content"
        className="w-full max-w-xl bg-neutral-900 border-l border-neutral-800 text-white h-full flex flex-col justify-between shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400/15 border border-amber-400/30 rounded-xl">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-serif tracking-wider uppercase text-white">
                Atelier Stylist & Ensemble Builder
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono">
                Curate 3-4 pieces to unlock Complete the Look bundle pricing
              </p>
            </div>
          </div>

          <button
            id="close-ai-stylist-btn"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Switcher */}
        <div className="bg-neutral-950/80 px-4 sm:px-6 py-2.5 border-b border-neutral-800 flex items-center gap-1.5 sm:gap-2">
          <button
            id="tab-style-quiz"
            onClick={() => setActiveTab('style-quiz')}
            className={`flex-1 py-2 px-2 rounded-xl text-[11px] sm:text-xs font-mono uppercase transition-all flex items-center justify-center gap-1.5 border ${
              activeTab === 'style-quiz'
                ? 'bg-amber-400 text-neutral-950 font-bold border-amber-400 shadow-md'
                : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="truncate">Style Quiz</span>
            <span
              className={`text-[9px] px-1 py-0.2 rounded-full font-bold hidden sm:inline ${
                activeTab === 'style-quiz' ? 'bg-neutral-950/20 text-neutral-950' : 'bg-amber-400/20 text-amber-300'
              }`}
            >
              Quiz
            </span>
          </button>

          <button
            id="tab-outfit-builder"
            onClick={() => setActiveTab('outfit-builder')}
            className={`flex-1 py-2 px-2 rounded-xl text-[11px] sm:text-xs font-mono uppercase transition-all flex items-center justify-center gap-1.5 border ${
              activeTab === 'outfit-builder'
                ? 'bg-amber-400 text-neutral-950 font-bold border-amber-400 shadow-md'
                : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="truncate">Builder</span>
            <span
              className={`text-[9px] px-1 py-0.2 rounded-full font-bold hidden sm:inline ${
                activeTab === 'outfit-builder' ? 'bg-neutral-950/20 text-neutral-950' : 'bg-amber-400/20 text-amber-300'
              }`}
            >
              -15%
            </span>
          </button>

          <button
            id="tab-ai-curation"
            onClick={() => setActiveTab('ai-curation')}
            className={`flex-1 py-2 px-2 rounded-xl text-[11px] sm:text-xs font-mono uppercase transition-all flex items-center justify-center gap-1.5 border ${
              activeTab === 'ai-curation'
                ? 'bg-amber-400 text-neutral-950 font-bold border-amber-400 shadow-md'
                : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span className="truncate">AI Prompt</span>
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'style-quiz' ? (
            /* ========================================================= */
            /* STYLE PERSONALITY QUIZ VIEW */
            /* ========================================================= */
            <StylePersonalityQuiz
              products={products}
              currency={currency}
              onAddMultipleToCart={onAddMultipleToCart}
              onAddToCart={onAddToCart}
              onSelectProduct={onSelectProduct}
              onSwitchToOutfitBuilder={handleLoadCapsuleToBuilder}
            />
          ) : activeTab === 'outfit-builder' ? (
            /* ========================================================= */
            /* OUTFIT BUILDER VIEW */
            /* ========================================================= */
            <div id="outfit-builder-panel" className="space-y-6">
              {/* Bundle Progress & Status Banner */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  isBundleEligible
                    ? 'bg-gradient-to-r from-amber-950/40 via-neutral-900 to-amber-950/40 border-amber-400/50 ring-1 ring-amber-400/30'
                    : 'bg-neutral-950 border-neutral-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-mono uppercase tracking-wider font-bold text-amber-300">
                      Complete the Look Bundle
                    </span>
                  </div>
                  <span className="text-xs font-mono text-neutral-300">
                    <span className="text-amber-400 font-bold">{selectedCount}</span> of 4 pieces
                  </span>
                </div>

                {/* Progress Visualizer */}
                <div className="grid grid-cols-4 gap-1.5 mb-3">
                  {[1, 2, 3, 4].map((slotIdx) => (
                    <div
                      key={slotIdx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        slotIdx <= selectedCount ? 'bg-amber-400' : 'bg-neutral-800'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-[11px] text-neutral-300 font-light">
                  {selectedCount < 3 ? (
                    <>
                      Select <span className="text-amber-300 font-medium">{3 - selectedCount} more piece{3 - selectedCount > 1 ? 's' : ''}</span> to unlock the 15% Complete the Look bundle discount!
                    </>
                  ) : (
                    <>
                      <span className="text-emerald-400 font-bold">✨ 15% Complete the Look Bundle Unlocked!</span> Instant savings applied across your tailored ensemble.
                    </>
                  )}
                </p>
              </div>

              {/* Quick-Start Curated Capsules */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Curated Capsule Presets
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">1-click complete looks</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {curatedCapsules.map((capsule) => (
                    <button
                      key={capsule.name}
                      type="button"
                      onClick={() => handleApplyCapsulePreset(capsule)}
                      className="p-3 bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-800 hover:border-amber-400/50 rounded-xl text-left transition-all group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-white group-hover:text-amber-300 transition-colors">
                          {capsule.name}
                        </span>
                        <span className="text-[9px] font-mono uppercase bg-neutral-800 text-amber-400 px-1.5 py-0.5 rounded">
                          {capsule.style}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-400 line-clamp-1 font-light">
                        {capsule.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Look Ensemble Tray */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1.5">
                    <span>Active Ensemble Pieces ({selectedCount}/4)</span>
                  </h4>
                  {selectedCount > 0 && (
                    <button
                      onClick={() => setSelectedOutfitItems([])}
                      className="text-[10px] font-mono text-neutral-500 hover:text-rose-400 transition-colors"
                    >
                      Clear outfit
                    </button>
                  )}
                </div>

                {selectedOutfitItems.length === 0 ? (
                  <div className="p-8 border-2 border-dashed border-neutral-800 rounded-2xl text-center space-y-2 bg-neutral-950/40">
                    <Layers className="w-8 h-8 text-neutral-700 mx-auto" />
                    <p className="text-xs font-medium text-neutral-400">Your outfit canvas is empty.</p>
                    <p className="text-[11px] text-neutral-500">
                      Pick 3-4 complementary items below or choose a curated capsule above.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedOutfitItems.map((item, idx) => (
                      <div
                        key={item.product.id}
                        className="p-3 bg-neutral-950/80 rounded-2xl border border-neutral-800 flex gap-3 items-center justify-between"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-14 h-16 rounded-xl overflow-hidden bg-neutral-900 shrink-0">
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-neutral-950/90 text-amber-300 text-[9px] font-mono flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                          </div>

                          <div className="space-y-1 min-w-0">
                            <h5 className="text-xs font-medium text-white truncate">{item.product.name}</h5>
                            <p className="text-[10px] text-neutral-400 font-mono capitalize">
                              {item.product.category} • {item.product.style || 'Classic'}
                            </p>

                            {/* Size & Color Configurator */}
                            <div className="flex items-center gap-2 pt-0.5">
                              {/* Size Selector */}
                              <select
                                value={item.selectedSize}
                                onChange={(e) => handleUpdateItemSize(item.product.id, e.target.value)}
                                className="bg-neutral-900 text-neutral-200 text-[10px] font-mono rounded px-1.5 py-0.5 border border-neutral-700 focus:outline-none"
                              >
                                {item.product.sizes.map((sz) => (
                                  <option key={sz} value={sz}>
                                    Size {sz}
                                  </option>
                                ))}
                              </select>

                              {/* Color Swatches */}
                              <div className="flex items-center space-x-1">
                                {item.product.colors.map((c) => (
                                  <button
                                    key={c.name}
                                    type="button"
                                    onClick={() => handleUpdateItemColor(item.product.id, c)}
                                    className={`w-3.5 h-3.5 rounded-full border transition-all ${
                                      item.selectedColor.name === c.name
                                        ? 'border-amber-400 ring-1 ring-amber-400/50 scale-110'
                                        : 'border-neutral-700 opacity-70 hover:opacity-100'
                                    }`}
                                    style={{ backgroundColor: c.hex }}
                                    title={c.name}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className="text-xs font-mono font-semibold text-amber-300">
                            {formatCurrency(item.product.price, currency)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveProductFromOutfit(item.product.id)}
                            className="p-1 text-neutral-500 hover:text-rose-400 rounded transition-colors"
                            title="Remove from outfit"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Complete the Look Bundle Price Box */}
              {selectedCount > 0 && (
                <div
                  id="bundle-pricing-summary-card"
                  className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2.5 font-mono text-xs"
                >
                  <div className="flex justify-between text-neutral-400">
                    <span>Individual Pieces Total ({selectedCount}):</span>
                    <span className={isBundleEligible ? 'line-through text-neutral-500' : 'text-white'}>
                      {formatCurrency(bundleSubtotal, currency)}
                    </span>
                  </div>

                  {isBundleEligible ? (
                    <>
                      <div className="flex justify-between text-emerald-400">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5" /> Complete the Look ({BUNDLE_DISCOUNT_PERCENTAGE}% off):
                        </span>
                        <span>-{formatCurrency(bundleDiscountAmount, currency)}</span>
                      </div>

                      <div className="flex justify-between items-baseline pt-2 border-t border-neutral-800 text-sm">
                        <span className="font-bold text-white uppercase font-sans">Complete Look Bundle:</span>
                        <div className="text-right">
                          <span className="text-lg font-bold text-amber-300">
                            {formatCurrency(bundleFinalPrice, currency)}
                          </span>
                          <p className="text-[10px] text-emerald-400 font-mono">
                            You save {formatCurrency(bundleDiscountAmount, currency)}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-2.5 bg-neutral-900/90 rounded-xl border border-neutral-800 text-[11px] text-neutral-400 flex items-center gap-2">
                      <Info className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        Add {3 - selectedCount} more item to unlock 15% Complete the Look bundle pricing.
                      </span>
                    </div>
                  )}

                  {/* Single-Click Add to Cart Button */}
                  <button
                    id="complete-the-look-add-to-cart-btn"
                    onClick={handleAddCompleteLookToBag}
                    disabled={selectedCount === 0}
                    className={`w-full mt-2 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl ${
                      isBundleEligible
                        ? 'bg-amber-400 hover:bg-amber-300 text-neutral-950'
                        : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                    }`}
                  >
                    {addedBundleAnimation ? (
                      <>
                        <Check className="w-4 h-4 text-neutral-950" />
                        <span>Complete Look Added to Bag!</span>
                      </>
                    ) : isBundleEligible ? (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Complete the Look — Add Bundle to Bag ({formatCurrency(bundleFinalPrice, currency)})</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add {selectedCount} Piece{selectedCount > 1 ? 's' : ''} to Bag ({formatCurrency(bundleSubtotal, currency)})</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Complementary Item Palette */}
              <div className="space-y-3 pt-2 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold">
                    Add Complementary Pieces
                  </h4>
                  <span className="text-[10px] font-mono text-neutral-400">
                    {selectedCount >= 4 ? 'Outfit full (4/4)' : `Choose up to ${4 - selectedCount} more`}
                  </span>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                  <select
                    value={builderCategoryFilter}
                    onChange={(e) => setBuilderCategoryFilter(e.target.value)}
                    className="bg-neutral-950 text-neutral-200 text-xs font-mono rounded-xl px-2.5 py-1.5 border border-neutral-800 uppercase focus:border-amber-400 focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    <option value="outerwear">Outerwear</option>
                    <option value="tops">Tops</option>
                    <option value="knitwear">Knitwear</option>
                    <option value="tailoring">Tailoring</option>
                    <option value="bottoms">Bottoms</option>
                    <option value="dresses">Dresses</option>
                    <option value="footwear">Footwear</option>
                    <option value="accessories">Accessories</option>
                  </select>

                  <select
                    value={builderStyleFilter}
                    onChange={(e) => setBuilderStyleFilter(e.target.value)}
                    className="bg-neutral-950 text-neutral-200 text-xs font-mono rounded-xl px-2.5 py-1.5 border border-neutral-800 uppercase focus:border-amber-400 focus:outline-none"
                  >
                    <option value="all">All Styles</option>
                    <option value="Minimalist">Minimalist</option>
                    <option value="Classic">Classic</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Bohemian">Bohemian</option>
                  </select>
                </div>

                {/* Catalog Grid */}
                <div className="grid grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                  {filteredPaletteProducts.map((p) => {
                    const isAlreadySelected = selectedOutfitItems.some(
                      (item) => item.product.id === p.id
                    );
                    const isMaxReached = selectedOutfitItems.length >= 4;

                    return (
                      <div
                        key={p.id}
                        className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                          isAlreadySelected
                            ? 'bg-amber-400/10 border-amber-400/50'
                            : 'bg-neutral-950/70 border-neutral-800/80 hover:border-neutral-700'
                        }`}
                      >
                        <div className="space-y-1.5 mb-2">
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-24 object-cover rounded-lg bg-neutral-900"
                          />
                          <h6 className="text-[11px] font-medium text-white truncate">{p.name}</h6>
                          <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400">
                            <span className="capitalize">{p.category}</span>
                            <span className="text-amber-300 font-semibold">
                              {formatCurrency(p.price, currency)}
                            </span>
                          </div>
                        </div>

                        {isAlreadySelected ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveProductFromOutfit(p.id)}
                            className="w-full py-1 text-[10px] font-mono uppercase rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/40 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-800 transition-colors flex items-center justify-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>In Outfit</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isMaxReached}
                            onClick={() => handleAddProductToOutfit(p)}
                            className="w-full py-1 text-[10px] font-mono uppercase rounded-lg bg-neutral-900 text-neutral-300 border border-neutral-700 hover:bg-amber-400 hover:text-neutral-950 hover:border-amber-400 transition-all flex items-center justify-center gap-1 disabled:opacity-40 disabled:hover:bg-neutral-900 disabled:hover:text-neutral-300"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* AI PROMPT STYLIST VIEW */
            /* ========================================================= */
            <div id="ai-curation-panel" className="space-y-6">
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
                      <option key={o} value={o}>
                        {o}
                      </option>
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
                      <option key={v} value={v}>
                        {v}
                      </option>
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
                        <span className="text-xs font-mono font-semibold text-amber-300">
                          {formatCurrency(p.price, currency)}
                        </span>
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
                        <span>Add Entire Look to Bag ({formatCurrency(outfitTotalPrice, currency)})</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
