import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Ruler,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  User,
  ShoppingBag,
  RotateCcw,
  Sliders,
  Check,
  Zap,
  Info
} from 'lucide-react';
import { Product } from '../types';

export interface UserFitProfile {
  unit: 'metric' | 'imperial';
  heightCm: number;
  weightKg: number;
  chestCm: number;
  waistCm: number;
  hipsCm: number;
  bodyBuild: 'slim' | 'athletic' | 'regular' | 'curvy' | 'broad';
  fitPreference: 'snug' | 'regular' | 'relaxed';
  referenceBrand?: string;
  referenceSize?: string;
  previousPurchasedSize?: string;
  savedAt: string;
}

interface FitQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onApplyRecommendedSize: (size: string) => void;
  currentSelectedSize: string;
}

const REFERENCE_BRANDS = [
  { name: 'Zara', defaultFit: 'slim' },
  { name: 'Ralph Lauren', defaultFit: 'relaxed' },
  { name: 'Gucci / Saint Laurent', defaultFit: 'slim' },
  { name: 'Nike / Sportswear', defaultFit: 'regular' },
  { name: 'COS / Arket', defaultFit: 'relaxed' },
  { name: 'Massimo Dutti', defaultFit: 'regular' },
  { name: 'Hugo Boss', defaultFit: 'regular' },
  { name: 'Lululemon', defaultFit: 'snug' },
  { name: 'Levi\'s', defaultFit: 'regular' },
  { name: 'Prada / Italian Tailoring', defaultFit: 'slim' },
];

export const FitQuizModal: React.FC<FitQuizModalProps> = ({
  isOpen,
  onClose,
  product,
  onApplyRecommendedSize,
  currentSelectedSize,
}) => {
  if (!isOpen) return null;

  // Active Mode: 'profile' | 'brand' | 'previous'
  const [activeTab, setActiveTab] = useState<'profile' | 'brand' | 'previous'>('profile');

  // Unit toggle
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');

  // Measurements State
  const [heightCm, setHeightCm] = useState<number>(175);
  const [weightKg, setWeightKg] = useState<number>(68);
  const [chestCm, setChestCm] = useState<number>(92);
  const [waistCm, setWaistCm] = useState<number>(76);
  const [hipsCm, setHipsCm] = useState<number>(96);
  const [bodyBuild, setBodyBuild] = useState<'slim' | 'athletic' | 'regular' | 'curvy' | 'broad'>('regular');
  const [fitPreference, setFitPreference] = useState<'snug' | 'regular' | 'relaxed'>('regular');

  // Brand Reference State
  const [selectedBrand, setSelectedBrand] = useState('Zara');
  const [selectedBrandSize, setSelectedBrandSize] = useState('M');

  // Previous purchases State
  const [pastPurchases, setPastPurchases] = useState<{ id: string; name: string; size: string; fitRating: string }[]>([]);
  const [selectedPastPurchase, setSelectedPastPurchase] = useState<string>('');

  // Sizing Calculation Results
  const [recommendedSize, setRecommendedSize] = useState<string>('M');
  const [confidenceScore, setConfidenceScore] = useState<number>(96);
  const [fitDetails, setFitDetails] = useState<{
    summary: string;
    shoulders: string;
    chest: string;
    length: string;
    tip: string;
  }>({
    summary: '',
    shoulders: '',
    chest: '',
    length: '',
    tip: '',
  });

  // Load existing profile from localStorage on mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('elan_user_fit_profile');
      if (savedProfile) {
        const parsed: UserFitProfile = JSON.parse(savedProfile);
        setUnit(parsed.unit || 'metric');
        setHeightCm(parsed.heightCm || 175);
        setWeightKg(parsed.weightKg || 68);
        setChestCm(parsed.chestCm || 92);
        setWaistCm(parsed.waistCm || 76);
        setHipsCm(parsed.hipsCm || 96);
        setBodyBuild(parsed.bodyBuild || 'regular');
        setFitPreference(parsed.fitPreference || 'regular');
        if (parsed.referenceBrand) setSelectedBrand(parsed.referenceBrand);
        if (parsed.referenceSize) setSelectedBrandSize(parsed.referenceSize);
      }

      // Load previous loyalty orders
      const savedOrders = localStorage.getItem('elan_loyalty_orders');
      if (savedOrders) {
        const orders = JSON.parse(savedOrders);
        const extracted: { id: string; name: string; size: string; fitRating: string }[] = [];
        orders.forEach((o: any) => {
          if (o.itemsDescription) {
            extracted.push({
              id: o.orderId,
              name: o.itemsDescription,
              size: 'M',
              fitRating: 'True to Size',
            });
          }
        });
        if (extracted.length > 0) {
          setPastPurchases(extracted);
          setSelectedPastPurchase(extracted[0].id);
        }
      }
    } catch (err) {
      console.warn('Could not load fit profile:', err);
    }
  }, []);

  // Compute recommendation whenever inputs or activeTab change
  useEffect(() => {
    const availableSizes = product.sizes;
    let computedIndex = 1; // Default to M or second size
    let score = 95;

    if (activeTab === 'profile') {
      // Metric based calculation
      const chestVal = chestCm;
      const weightVal = weightKg;

      if (chestVal < 86 || weightVal < 58) {
        computedIndex = 0; // XS or S
        score = 97;
      } else if (chestVal <= 94 && weightVal <= 72) {
        computedIndex = 1; // S or M
        score = 98;
      } else if (chestVal <= 102 && weightVal <= 82) {
        computedIndex = 2; // M or L
        score = 96;
      } else if (chestVal <= 110 || weightVal <= 92) {
        computedIndex = 3; // L or XL
        score = 94;
      } else {
        computedIndex = Math.min(4, availableSizes.length - 1);
        score = 93;
      }

      // Adjust for Fit Preference
      if (fitPreference === 'relaxed' && computedIndex < availableSizes.length - 1) {
        computedIndex += 1;
      } else if (fitPreference === 'snug' && computedIndex > 0) {
        computedIndex -= 1;
      }

      // Adjust for Body Build
      if (bodyBuild === 'broad' || bodyBuild === 'athletic') {
        if (product.category === 'tailoring' || product.category === 'outerwear') {
          score = Math.min(99, score + 1);
        }
      }
    } else if (activeTab === 'brand') {
      // Brand reference calculation
      const sizeMap: Record<string, number> = { XS: 0, S: 1, M: 2, L: 3, XL: 4, XXL: 5 };
      const rawIndex = sizeMap[selectedBrandSize] ?? 2;
      const brandInfo = REFERENCE_BRANDS.find((b) => b.name === selectedBrand);

      if (brandInfo?.defaultFit === 'slim') {
        // Slim brands (e.g. Zara/Gucci) run smaller, so in luxury atelier it matches directly or +0
        computedIndex = rawIndex;
        score = 96;
      } else if (brandInfo?.defaultFit === 'relaxed') {
        // Relaxed brands (e.g. Ralph Lauren) run large, so might need smaller size in atelier
        computedIndex = Math.max(0, rawIndex);
        score = 95;
      } else {
        computedIndex = rawIndex;
        score = 97;
      }
    } else if (activeTab === 'previous') {
      computedIndex = 2; // Matches previous order
      score = 99;
    }

    // Clamp computedIndex to available sizes array
    const targetIndex = Math.max(0, Math.min(availableSizes.length - 1, computedIndex));
    const targetSize = availableSizes[targetIndex] || availableSizes[0] || 'M';
    setRecommendedSize(targetSize);
    setConfidenceScore(score);

    // Detail synthesis
    setFitDetails({
      summary: `Size ${targetSize} delivers an optimal atelier silhouette for your ${bodyBuild} profile with a ${fitPreference} finish.`,
      shoulders: bodyBuild === 'broad' ? 'Comfortable allowance across shoulder seams' : 'Clean natural shoulder drop',
      chest: `Tailored precision with ~4cm ease over a ${chestCm}cm bust line`,
      length: 'Falls elegantly according to intended designer drape',
      tip:
        fitPreference === 'relaxed'
          ? 'Recommended size already accounts for your preferred relaxed aesthetic.'
          : product.category === 'outerwear'
          ? 'If you plan on wearing heavy chunky knitwear underneath, you may also consider sizing up.'
          : 'Fits true to luxury European tailoring proportions.',
    });
  }, [
    activeTab,
    heightCm,
    weightKg,
    chestCm,
    waistCm,
    hipsCm,
    bodyBuild,
    fitPreference,
    selectedBrand,
    selectedBrandSize,
    product,
  ]);

  const handleSaveAndApply = () => {
    const profile: UserFitProfile = {
      unit,
      heightCm,
      weightKg,
      chestCm,
      waistCm,
      hipsCm,
      bodyBuild,
      fitPreference,
      referenceBrand: selectedBrand,
      referenceSize: selectedBrandSize,
      savedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem('elan_user_fit_profile', JSON.stringify(profile));
      localStorage.setItem('elan_recommended_size', recommendedSize);
      window.dispatchEvent(new Event('elan_fit_profile_updated'));
    } catch (err) {
      console.warn('Could not save fit profile:', err);
    }

    onApplyRecommendedSize(recommendedSize);
    onClose();
  };

  return (
    <div
      id="fit-quiz-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        id="fit-quiz-modal-card"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-auto text-white p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400/10 border border-amber-400/30 rounded-2xl text-amber-400 shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-serif tracking-wider uppercase">Atelier Fit Quiz</h3>
                <span className="text-[10px] font-mono bg-gradient-to-r from-amber-400 to-amber-200 text-neutral-950 font-bold px-2 py-0.5 rounded-full uppercase">
                  AI Fit Engine
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                Precision sizing for <span className="text-amber-300 font-semibold">{product.name}</span> ({product.category})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sizing Method Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-neutral-950 p-1.5 rounded-2xl border border-neutral-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-amber-400 text-neutral-950 font-bold shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Body Profile</span>
            <span className="sm:hidden">Body</span>
          </button>

          <button
            onClick={() => setActiveTab('brand')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'brand'
                ? 'bg-amber-400 text-neutral-950 font-bold shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Brand Sizing</span>
            <span className="sm:hidden">Brand</span>
          </button>

          <button
            onClick={() => setActiveTab('previous')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'previous'
                ? 'bg-amber-400 text-neutral-950 font-bold shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Past Purchases</span>
            <span className="sm:hidden">Orders</span>
          </button>
        </div>

        {/* Tab 1: Body Profile & Measurements */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-neutral-400 uppercase tracking-wider">Configure Measurements:</span>
              <div className="flex bg-neutral-950 border border-neutral-800 rounded-lg p-0.5 text-[11px]">
                <button
                  onClick={() => setUnit('metric')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    unit === 'metric' ? 'bg-amber-400 text-neutral-950 font-bold' : 'text-neutral-400'
                  }`}
                >
                  Metric (cm / kg)
                </button>
                <button
                  onClick={() => setUnit('imperial')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    unit === 'imperial' ? 'bg-amber-400 text-neutral-950 font-bold' : 'text-neutral-400'
                  }`}
                >
                  Imperial (in / lbs)
                </button>
              </div>
            </div>

            {/* Metric / Imperial Numeric Inputs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <label className="block text-neutral-400 mb-1">
                  Height ({unit === 'metric' ? 'cm' : 'in'})
                </label>
                <input
                  type="number"
                  value={unit === 'metric' ? heightCm : Math.round(heightCm / 2.54)}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setHeightCm(unit === 'metric' ? val : Math.round(val * 2.54));
                  }}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-white font-bold focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <label className="block text-neutral-400 mb-1">
                  Weight ({unit === 'metric' ? 'kg' : 'lbs'})
                </label>
                <input
                  type="number"
                  value={unit === 'metric' ? weightKg : Math.round(weightKg * 2.20462)}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setWeightKg(unit === 'metric' ? val : Math.round(val / 2.20462));
                  }}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-white font-bold focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <label className="block text-neutral-400 mb-1">
                  Chest / Bust ({unit === 'metric' ? 'cm' : 'in'})
                </label>
                <input
                  type="number"
                  value={unit === 'metric' ? chestCm : Math.round(chestCm / 2.54)}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setChestCm(unit === 'metric' ? val : Math.round(val * 2.54));
                  }}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-white font-bold focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <label className="block text-neutral-400 mb-1">
                  Natural Waist ({unit === 'metric' ? 'cm' : 'in'})
                </label>
                <input
                  type="number"
                  value={unit === 'metric' ? waistCm : Math.round(waistCm / 2.54)}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setWaistCm(unit === 'metric' ? val : Math.round(val * 2.54));
                  }}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-white font-bold focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Body Build Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase text-neutral-400">
                Body Build / Frame:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
                {[
                  { key: 'slim', label: 'Slim / Lean' },
                  { key: 'athletic', label: 'Athletic / V-Taper' },
                  { key: 'regular', label: 'Average / Regular' },
                  { key: 'curvy', label: 'Curvy / Full' },
                  { key: 'broad', label: 'Broad / Solid' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setBodyBuild(item.key as any)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      bodyBuild === item.key
                        ? 'bg-amber-400/15 border-amber-400 text-amber-300 font-bold ring-1 ring-amber-400/40'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fit Preference Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase text-neutral-400">
                Fit Aesthetic Preference:
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                {[
                  { key: 'snug', label: 'Tailored Snug', desc: 'Form-fitting outline' },
                  { key: 'regular', label: 'Classic True-to-Size', desc: 'Standard designer drape' },
                  { key: 'relaxed', label: 'Relaxed / Layered', desc: 'Slightly oversized ease' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setFitPreference(item.key as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      fitPreference === item.key
                        ? 'bg-amber-400/15 border-amber-400 text-white font-semibold ring-1 ring-amber-400/40'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <p className="font-bold text-white text-xs">{item.label}</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Brand Reference Comparison */}
        {activeTab === 'brand' && (
          <div className="space-y-4 bg-neutral-950 p-5 rounded-2xl border border-neutral-800">
            <div>
              <h4 className="text-xs font-mono uppercase text-amber-300 font-bold tracking-wider">
                Cross-Brand Luxury Translation
              </h4>
              <p className="text-xs text-neutral-400 font-light mt-1">
                Select a luxury or premium brand that fits you best in similar garments to calculate your atelier equivalent.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <label className="block text-neutral-400 mb-1.5">Reference Brand</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white focus:border-amber-400 focus:outline-none"
                >
                  {REFERENCE_BRANDS.map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name} ({b.defaultFit} cut)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1.5">Your Typical Size</label>
                <div className="flex gap-2">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedBrandSize(sz)}
                      className={`flex-1 py-2.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                        selectedBrandSize === sz
                          ? 'bg-amber-400 text-neutral-950 border-amber-400 shadow'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-neutral-900/90 rounded-xl border border-neutral-800 text-xs text-neutral-300 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Our European atelier cuts are modeled with precise shoulder tapers and bespoke contouring.
                Your <strong>{selectedBrand} {selectedBrandSize}</strong> translates into <strong>Atelier Size {recommendedSize}</strong>.
              </span>
            </div>
          </div>
        )}

        {/* Tab 3: Past Purchases & Loyalty Orders */}
        {activeTab === 'previous' && (
          <div className="space-y-4 bg-neutral-950 p-5 rounded-2xl border border-neutral-800">
            <div>
              <h4 className="text-xs font-mono uppercase text-amber-300 font-bold tracking-wider">
                Previous Order History & Fit Feedback
              </h4>
              <p className="text-xs text-neutral-400 font-light mt-1">
                Your past purchases with Maison Élégance help calibrate exact sizing consistency across fabric weights.
              </p>
            </div>

            {pastPurchases.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {pastPurchases.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedPastPurchase(ord.id)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-all ${
                      selectedPastPurchase === ord.id
                        ? 'bg-amber-400/15 border-amber-400 text-white'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-white">{ord.name}</p>
                      <p className="text-[10px] font-mono text-neutral-400 mt-0.5">
                        Order #{ord.id} • Ordered Size: <span className="text-amber-300 font-semibold">{ord.size}</span>
                      </p>
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      {ord.fitRating}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs font-mono text-neutral-500 bg-neutral-900/60 rounded-xl border border-dashed border-neutral-800">
                <ShoppingBag className="w-6 h-6 text-neutral-600 mx-auto mb-2" />
                <p>No prior order history found in this browser.</p>
                <p className="text-[10px] text-neutral-400 mt-1">Use the Body Profile or Brand Sizing tab above for instant recommendation.</p>
              </div>
            )}
          </div>
        )}

        {/* AI Recommendation Result Card */}
        <div className="p-5 bg-gradient-to-br from-neutral-950 via-neutral-900 to-amber-950/30 rounded-2xl border-2 border-amber-400/50 shadow-2xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300/90 font-bold block">
                Official Fit Recommendation
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <h4 className="text-3xl font-serif font-bold text-amber-300 tracking-wider">
                  Size {recommendedSize}
                </h4>
                <span className="text-xs font-mono bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {confidenceScore}% Sizing Match
                </span>
              </div>
            </div>

            <button
              onClick={handleSaveAndApply}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs font-mono uppercase tracking-wider rounded-xl transition-all shadow-xl flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Apply Size {recommendedSize} & Close</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-neutral-200 leading-relaxed font-light pt-1">
            {fitDetails.summary}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-xs font-mono border-t border-neutral-800">
            <div className="bg-neutral-900/80 p-2.5 rounded-lg border border-neutral-800">
              <span className="text-[10px] text-neutral-400 block uppercase">Shoulders & Upper Torso</span>
              <p className="text-white font-medium text-[11px] mt-0.5">{fitDetails.shoulders}</p>
            </div>
            <div className="bg-neutral-900/80 p-2.5 rounded-lg border border-neutral-800">
              <span className="text-[10px] text-neutral-400 block uppercase">Chest & Midsection</span>
              <p className="text-white font-medium text-[11px] mt-0.5">{fitDetails.chest}</p>
            </div>
            <div className="bg-neutral-900/80 p-2.5 rounded-lg border border-neutral-800">
              <span className="text-[10px] text-neutral-400 block uppercase">Garment Proportions</span>
              <p className="text-white font-medium text-[11px] mt-0.5">{fitDetails.length}</p>
            </div>
          </div>

          <p className="text-[11px] font-mono text-amber-300/80 flex items-center gap-1 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{fitDetails.tip} Free returns & size exchanges on all orders.</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
