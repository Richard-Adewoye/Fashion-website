import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Check,
  RotateCcw,
  ShoppingBag,
  ArrowRight,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  Crown,
  Heart,
  Palette,
  Layers,
  Compass,
  Star,
  Tag,
} from 'lucide-react';
import { Product, ProductColor, ProductStyle } from '../types';
import { formatCurrency } from '../data/currency';

interface StylePersonalityQuizProps {
  products: Product[];
  currency?: string;
  onAddMultipleToCart: (items: { product: Product; size: string; color: ProductColor }[]) => void;
  onAddToCart?: (product: Product, size: string, color: ProductColor, quantity?: number) => void;
  onSelectProduct?: (product: Product) => void;
  onSwitchToOutfitBuilder?: (recommendedProducts: Product[]) => void;
}

interface QuizOption {
  id: string;
  label: string;
  description: string;
  tag: string;
  styleWeights: Record<ProductStyle, number>;
  colorKey?: string;
}

interface QuizQuestion {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  icon: string;
  options: QuizOption[];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'aesthetic',
    stepNumber: 1,
    title: 'Core Fashion Philosophy',
    subtitle: 'Which design aesthetic feels most authentic to your wardrobe identity?',
    icon: '✨',
    options: [
      {
        id: 'opt-minimalist',
        label: 'Architectural Minimalist',
        description: 'Impeccable proportions, clean geometry, quiet luxury, and monochromatic restraint.',
        tag: 'Minimalist',
        styleWeights: { Minimalist: 4, Classic: 1, Bohemian: 0, Industrial: 0 },
      },
      {
        id: 'opt-bohemian',
        label: 'Artisanal Bohemian',
        description: 'Flowing drapes, tactile knitwear, rich natural textures, and effortless organic warmth.',
        tag: 'Bohemian',
        styleWeights: { Minimalist: 0, Classic: 0, Bohemian: 4, Industrial: 0 },
      },
      {
        id: 'opt-industrial',
        label: 'Industrial Utilitarian',
        description: 'Monochromatic edge, sharp architectural hardware, modern utility, and bold structured silhouettes.',
        tag: 'Industrial',
        styleWeights: { Minimalist: 0, Classic: 0, Bohemian: 0, Industrial: 4 },
      },
      {
        id: 'opt-classic',
        label: 'Timeless Parisian Classic',
        description: 'Heritage double-breasted blazers, pristine Italian wool, and enduring maison elegance.',
        tag: 'Classic',
        styleWeights: { Minimalist: 1, Classic: 4, Bohemian: 0, Industrial: 0 },
      },
    ],
  },
  {
    id: 'occasion',
    stepNumber: 2,
    title: 'Lifestyle & Occasion Priority',
    subtitle: 'Where do you most desire your wardrobe to command confidence?',
    icon: '🏛️',
    options: [
      {
        id: 'opt-occ-executive',
        label: 'Executive & High-Stakes Soirées',
        description: 'Sharp tailored coats, pristine lapels, and commanding structured presence.',
        tag: 'Executive',
        styleWeights: { Classic: 3, Minimalist: 2, Industrial: 1, Bohemian: 0 },
      },
      {
        id: 'opt-occ-everyday',
        label: 'Elevated Everyday & Weekend Leisure',
        description: 'Sumptuous cashmere knits, fluid trousers, relaxed weekend ease, and coffee runs.',
        tag: 'Daily Luxe',
        styleWeights: { Minimalist: 3, Bohemian: 2, Classic: 1, Industrial: 0 },
      },
      {
        id: 'opt-occ-metro',
        label: 'Metropolitan Architecture & Studio',
        description: 'Contemporary utilitarian trenches, sculptural footwear, and structured layers.',
        tag: 'Metropolitan',
        styleWeights: { Industrial: 3, Minimalist: 2, Classic: 0, Bohemian: 0 },
      },
      {
        id: 'opt-occ-creative',
        label: 'Creative Gallery & Cultural Escapes',
        description: 'Artisanal midi dresses, textural cardigans, and evocative draped silhouettes.',
        tag: 'Creative',
        styleWeights: { Bohemian: 3, Minimalist: 1, Classic: 1, Industrial: 0 },
      },
    ],
  },
  {
    id: 'palette',
    stepNumber: 3,
    title: 'Color Mood & Tone Preference',
    subtitle: 'Which tonal spectrum speaks to your signature aesthetic?',
    icon: '🎨',
    options: [
      {
        id: 'opt-pal-noir',
        label: 'Noir, Charcoal & Deep Slate',
        description: 'Dramatic black monochrome, midnight tones, and sleek carbon depth.',
        tag: 'Monochrome',
        colorKey: 'noir',
        styleWeights: { Industrial: 3, Minimalist: 2, Classic: 1, Bohemian: 0 },
      },
      {
        id: 'opt-pal-camel',
        label: 'Camel, Espresso & Warm Ochre',
        description: 'Timeless camel, rich chocolate, warm chestnut, and Tuscan terracotta.',
        tag: 'Warm Earth',
        colorKey: 'camel',
        styleWeights: { Bohemian: 3, Classic: 2, Minimalist: 2, Industrial: 0 },
      },
      {
        id: 'opt-pal-ecru',
        label: 'Ecru, Chalk & Pristine Ivory',
        description: 'Crisp whites, oatmeal melange, soft sand, and luminous light neutrals.',
        tag: 'Pure Ivory',
        colorKey: 'ecru',
        styleWeights: { Minimalist: 3, Classic: 2, Bohemian: 1, Industrial: 0 },
      },
      {
        id: 'opt-pal-navy',
        label: 'Midnight Navy & High Sartorial Contrast',
        description: 'Deep navy, forest emerald undertones, and sharp heritage accents.',
        tag: 'Navy Contrast',
        colorKey: 'navy',
        styleWeights: { Classic: 3, Industrial: 2, Minimalist: 1, Bohemian: 0 },
      },
    ],
  },
  {
    id: 'silhouette',
    stepNumber: 4,
    title: 'Cut & Silhouette Preference',
    subtitle: 'How do you prefer garments to drape and fall on your frame?',
    icon: '✂️',
    options: [
      {
        id: 'opt-sil-architectural',
        label: 'Architectural & Structured',
        description: 'Crisp shoulder lines, defined waistbands, and tailored geometry.',
        tag: 'Structured',
        styleWeights: { Minimalist: 3, Classic: 2, Industrial: 1, Bohemian: 0 },
      },
      {
        id: 'opt-sil-fluid',
        label: 'Fluid, Relaxed & Draped',
        description: 'Generous dropped shoulders, flowing silks, and effortless natural motion.',
        tag: 'Fluid',
        styleWeights: { Bohemian: 3, Minimalist: 2, Classic: 0, Industrial: 0 },
      },
      {
        id: 'opt-sil-hardware',
        label: 'Utilitarian & Hardware-Accented',
        description: 'Industrial buckles, functional storm flaps, clean metal fasteners, and sharp trenches.',
        tag: 'Utilitarian',
        styleWeights: { Industrial: 4, Minimalist: 1, Classic: 0, Bohemian: 0 },
      },
      {
        id: 'opt-sil-heritage',
        label: 'Heritage Tailoring & Double-Breasted',
        description: 'Classic double-breasted lapels, bespoke darting, and timeless proportion.',
        tag: 'Heritage',
        styleWeights: { Classic: 4, Minimalist: 1, Bohemian: 0, Industrial: 0 },
      },
    ],
  },
];

interface PersonalityProfile {
  archetype: string;
  styleKey: ProductStyle;
  tagline: string;
  description: string;
  signatureRules: string[];
  recommendedColors: string[];
  quote: string;
}

const ARCHETYPES: Record<ProductStyle, PersonalityProfile> = {
  Minimalist: {
    archetype: 'The Architectural Minimalist',
    styleKey: 'Minimalist',
    tagline: 'Quiet Luxury, Sculptural Proportions & Tonal Purity',
    description:
      'You believe that true luxury whispers rather than shouts. Your wardrobe values pure architectural lines, noble fabrics, and an immaculate neutral palette over fleeting trends.',
    signatureRules: [
      'Focus on silhouette and uncompromised Italian virgin wool',
      'Monochromatic tonal layering in camel, ecru, and charcoal',
      'Uncluttered cuts with subtle dropped-shoulder ease',
    ],
    recommendedColors: ['Camel', 'Ecru', 'Noir'],
    quote: '“Elegance is refusal. Restraint reveals the purest form of luxury.”',
  },
  Bohemian: {
    archetype: 'The Artisanal Bohemian',
    styleKey: 'Bohemian',
    tagline: 'Tactile Warmth, Poetic Drapes & Organic Luxury',
    description:
      'You view fashion as an expressive, sensory art. You gravitate toward sumptuous textured knits, flowing midi silhouettes, and rich, earthy hues with evocative warmth.',
    signatureRules: [
      'Layer tactile oversized cardigans over fluid silk and viscose',
      'Embrace artisanal textures, brushed suede, and brushed wool',
      'Warm earthy tonal shifts from terracotta to espresso',
    ],
    recommendedColors: ['Espresso', 'Terracotta', 'Sand'],
    quote: '“True style is poetry in motion—effortless, sensory, and deeply textured.”',
  },
  Industrial: {
    archetype: 'The Avant-Garde Utilitarian',
    styleKey: 'Industrial',
    tagline: 'Monochrome Edge, Hardware Accents & Modern Form',
    description:
      'Bold, precise, and unapologetically modern. You embrace architectural trench coats, industrial buckle details, sharp dark monochrome, and structured footwear.',
    signatureRules: [
      'Monochrome styling centered around deep noir and graphite',
      'Architectural hardware: metallic rings, belts, and buckles',
      'Sculptural footwear with sharp modern loafers and leather soles',
    ],
    recommendedColors: ['Noir', 'Graphite', 'Gunmetal'],
    quote: '“Form follows conviction. Modern elegance demands an architectural edge.”',
  },
  Classic: {
    archetype: 'The Parisian Classicist',
    styleKey: 'Classic',
    tagline: 'Heritage Tailoring, Double-Breasted Cuts & Timeless Grace',
    description:
      'Impeccably refined with an instinctive appreciation for enduring craftsmanship. Your staples include double-breasted blazers, wide-leg wool trousers, and fine cashmere.',
    signatureRules: [
      'Double-breasted tailoring with refined horn buttons',
      'High-twist wool trousers paired with crisp poplin or silk',
      'Timeless navy and camel pairings that never lose relevance',
    ],
    recommendedColors: ['Navy', 'Camel', 'Ivory'],
    quote: '“Fashion fades, but immaculate tailoring is immortal.”',
  },
};

const STORAGE_KEY = 'elan_style_personality_quiz_v1';

export const StylePersonalityQuiz: React.FC<StylePersonalityQuizProps> = ({
  products,
  currency = 'USD',
  onAddMultipleToCart,
  onAddToCart,
  onSelectProduct,
  onSwitchToOutfitBuilder,
}) => {
  // Saved profile or active quiz state
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [activeArchetypeKey, setActiveArchetypeKey] = useState<ProductStyle>('Minimalist');
  const [itemAddedStates, setItemAddedStates] = useState<Record<string, boolean>>({});
  const [addAllSuccess, setAddAllSuccess] = useState<boolean>(false);

  // Load saved quiz from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.answers && parsed.archetypeKey) {
          setSelectedAnswers(parsed.answers);
          setActiveArchetypeKey(parsed.archetypeKey as ProductStyle);
          setIsCompleted(true);
        }
      }
    } catch (err) {
      console.warn('Failed to load saved quiz profile', err);
    }
  }, []);

  const currentQuestion = QUIZ_QUESTIONS[currentStepIndex];

  // Handle selecting an option
  const handleSelectOption = (questionId: string, optionId: string) => {
    const updatedAnswers = { ...selectedAnswers, [questionId]: optionId };
    setSelectedAnswers(updatedAnswers);

    // If there are more questions, advance to next step
    if (currentStepIndex < QUIZ_QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentStepIndex((prev) => prev + 1);
      }, 200);
    } else {
      // Final question answered - calculate winner
      calculateAndFinishQuiz(updatedAnswers);
    }
  };

  const calculateAndFinishQuiz = (answers: Record<string, string>) => {
    // Score tally across styles
    const scores: Record<ProductStyle, number> = {
      Minimalist: 0,
      Bohemian: 0,
      Industrial: 0,
      Classic: 0,
    };

    QUIZ_QUESTIONS.forEach((q) => {
      const chosenOptId = answers[q.id];
      const opt = q.options.find((o) => o.id === chosenOptId);
      if (opt) {
        Object.entries(opt.styleWeights).forEach(([style, weight]) => {
          scores[style as ProductStyle] += weight;
        });
      }
    });

    // Determine highest scoring style
    let winningStyle: ProductStyle = 'Minimalist';
    let highestScore = -1;
    (Object.keys(scores) as ProductStyle[]).forEach((style) => {
      if (scores[style] > highestScore) {
        highestScore = scores[style];
        winningStyle = style;
      }
    });

    setActiveArchetypeKey(winningStyle);
    setIsCompleted(true);

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          answers,
          archetypeKey: winningStyle,
          completedAt: new Date().toISOString(),
        })
      );
    } catch (err) {
      console.warn(err);
    }
  };

  const handleRetakeQuiz = () => {
    setSelectedAnswers({});
    setCurrentStepIndex(0);
    setIsCompleted(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn(err);
    }
  };

  const archetypeProfile = ARCHETYPES[activeArchetypeKey] || ARCHETYPES.Minimalist;

  // Filter & rank products for this specific archetype
  const personalizedRecommendations = useMemo(() => {
    if (!products || products.length === 0) return [];

    // Filter matching primary style first
    const primaryMatches = products.filter((p) => p.style === activeArchetypeKey);
    // Complementary pieces
    const otherProducts = products.filter((p) => p.style !== activeArchetypeKey);

    // Calculate match scores
    const scoredPrimary = primaryMatches.map((product, idx) => ({
      product,
      matchScore: Math.max(88, 98 - idx * 2), // 98%, 96%, 94%, 92%...
      isPrimaryStyle: true,
    }));

    const scoredOthers = otherProducts.map((product, idx) => ({
      product,
      matchScore: Math.max(75, 85 - idx * 3),
      isPrimaryStyle: false,
    }));

    // Combine and sort by match score
    return [...scoredPrimary, ...scoredOthers].slice(0, 6);
  }, [products, activeArchetypeKey]);

  // Handle single Quick Add with tactile animation
  const handleQuickAddProduct = (product: Product) => {
    const defaultSize = product.sizes[0] || 'M';
    const defaultColor = product.colors[0];

    if (onAddToCart) {
      onAddToCart(product, defaultSize, defaultColor, 1);
    } else {
      onAddMultipleToCart([{ product, size: defaultSize, color: defaultColor }]);
    }

    setItemAddedStates((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setItemAddedStates((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  // Add all top recommendations to cart
  const handleAddAllToCart = () => {
    const itemsToAdd = personalizedRecommendations.slice(0, 4).map(({ product }) => ({
      product,
      size: product.sizes[0] || 'M',
      color: product.colors[0],
    }));

    onAddMultipleToCart(itemsToAdd);
    setAddAllSuccess(true);
    setTimeout(() => setAddAllSuccess(false), 2500);
  };

  return (
    <div id="style-personality-quiz-container" className="space-y-6">
      {!isCompleted ? (
        /* ========================================================= */
        /* INTERACTIVE QUIZ STEPS */
        /* ========================================================= */
        <div className="space-y-5 animate-fadeIn">
          {/* Quiz Header & Step Counter */}
          <div className="bg-neutral-950/80 border border-neutral-800 p-4 rounded-2xl flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-base">
                {currentQuestion.icon}
              </span>
              <div>
                <p className="text-[10px] font-mono uppercase text-amber-300 font-bold tracking-wider">
                  Question {currentStepIndex + 1} of {QUIZ_QUESTIONS.length}
                </p>
                <h4 className="text-sm font-serif font-bold text-white tracking-wide">
                  {currentQuestion.title}
                </h4>
              </div>
            </div>

            {/* Progress dots */}
            <div className="flex items-center gap-1.5">
              {QUIZ_QUESTIONS.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => {
                    // allow jumping back to previous questions
                    if (idx <= currentStepIndex) setCurrentStepIndex(idx);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentStepIndex
                      ? 'w-6 bg-amber-400'
                      : idx < currentStepIndex
                      ? 'w-2 bg-amber-400/60'
                      : 'w-2 bg-neutral-800'
                  }`}
                  title={`Question ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Question Subtitle */}
          <p className="text-xs text-neutral-300 font-light px-1">
            {currentQuestion.subtitle}
          </p>

          {/* Options Grid */}
          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswers[currentQuestion.id] === option.id;

              return (
                <motion.div
                  key={option.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 relative overflow-hidden group ${
                    isSelected
                      ? 'bg-amber-400/15 border-amber-400/70 shadow-[0_0_20px_rgba(251,191,36,0.15)] ring-1 ring-amber-400/40'
                      : 'bg-neutral-950/70 border-neutral-800/80 hover:bg-neutral-900/90 hover:border-neutral-700'
                  }`}
                >
                  {/* Radio Indicator */}
                  <div
                    className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-amber-400 border-amber-400 text-neutral-950'
                        : 'border-neutral-700 bg-neutral-900 group-hover:border-neutral-500'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>

                  {/* Text Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h5
                        className={`text-xs font-serif font-semibold tracking-wide transition-colors ${
                          isSelected ? 'text-amber-300' : 'text-white group-hover:text-amber-100'
                        }`}
                      >
                        {option.label}
                      </h5>
                      <span className="text-[9px] font-mono uppercase bg-neutral-900 text-neutral-400 px-2 py-0.5 rounded-full border border-neutral-800 shrink-0">
                        {option.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed font-light">
                      {option.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Back Button */}
          {currentStepIndex > 0 && (
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setCurrentStepIndex((prev) => prev - 1)}
                className="text-xs font-mono text-neutral-400 hover:text-white transition-colors"
              >
                ← Previous Question
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================= */
        /* PERSONALITY ARCHETYPE & RECOMMENDATIONS RESULT */
        /* ========================================================= */
        <div id="quiz-results-container" className="space-y-6 animate-fadeIn">
          {/* Result Card: Archetype Reveal */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-amber-950/40 border border-amber-400/40 p-6 shadow-2xl">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-300 font-bold">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>Your Atelier Style Personality</span>
                </div>

                <button
                  id="retake-style-quiz-btn"
                  onClick={handleRetakeQuiz}
                  className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400 hover:text-amber-300 transition-colors bg-neutral-900/60 hover:bg-neutral-800 px-2.5 py-1 rounded-lg border border-neutral-800"
                  title="Retake Quiz to explore another vibe"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Retake</span>
                </button>
              </div>

              {/* Title & Tagline */}
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-serif font-light tracking-wide text-white">
                  {archetypeProfile.archetype}
                </h3>
                <p className="text-xs font-mono text-amber-300/90 tracking-wide">
                  {archetypeProfile.tagline}
                </p>
              </div>

              {/* Description */}
              <p className="text-xs text-neutral-300 leading-relaxed font-light">
                {archetypeProfile.description}
              </p>

              {/* Stylist Quote */}
              <div className="border-l-2 border-amber-400/60 pl-3 py-1 italic text-[11px] text-amber-200/80 font-serif">
                {archetypeProfile.quote}
              </div>

              {/* Signature Rules & Palette */}
              <div className="pt-2 border-t border-neutral-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                    Signature Rules:
                  </span>
                  <ul className="space-y-1 text-[11px] text-neutral-300">
                    {archetypeProfile.signatureRules.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                    Curated Color Spectrum:
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {archetypeProfile.recommendedColors.map((color) => (
                      <span
                        key={color}
                        className="text-[10px] font-mono bg-white/[0.05] border border-white/[0.1] px-2 py-0.5 rounded-full text-neutral-200"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations Header & Quick Actions */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
              <div>
                <h4 className="text-sm font-serif font-bold text-white tracking-wide flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Personalized Atelier Wardrobe</span>
                </h4>
                <p className="text-[11px] font-mono text-neutral-400">
                  {personalizedRecommendations.length} pieces curated for {archetypeProfile.archetype}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {onSwitchToOutfitBuilder && (
                  <button
                    onClick={() => {
                      const prods = personalizedRecommendations.slice(0, 4).map((r) => r.product);
                      onSwitchToOutfitBuilder(prods);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-amber-300 hover:text-amber-200 text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm"
                    title="Build complete look with 15% discount"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Bundle &amp; Save 15%</span>
                  </button>
                )}

                <button
                  id="add-all-quiz-recommendations-btn"
                  onClick={handleAddAllToCart}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-md ${
                    addAllSuccess
                      ? 'bg-emerald-400 text-neutral-950 ring-2 ring-emerald-300'
                      : 'bg-amber-400 hover:bg-amber-300 text-neutral-950'
                  }`}
                >
                  {addAllSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Added Capsule!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add Top 4 to Bag</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Personalized Recommendations List */}
            <div className="space-y-3">
              {personalizedRecommendations.map(({ product, matchScore, isPrimaryStyle }) => {
                const isJustAdded = itemAddedStates[product.id];

                return (
                  <motion.div
                    key={product.id}
                    whileHover={{ y: -2 }}
                    className="p-3.5 bg-neutral-950/80 border border-neutral-800/80 hover:border-neutral-700 rounded-2xl transition-all flex items-center gap-3.5 group relative shadow-md"
                  >
                    {/* Thumbnail Image */}
                    <div
                      className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 shrink-0 cursor-pointer"
                      onClick={() => onSelectProduct && onSelectProduct(product)}
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Match Score Badge */}
                      <div className="absolute top-1 left-1 bg-neutral-950/90 text-amber-300 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-400/30">
                        {matchScore}%
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono uppercase bg-amber-400/10 text-amber-300 px-2 py-0.2 rounded font-semibold border border-amber-400/20">
                          {product.style || archetypeProfile.styleKey}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400 capitalize">
                          {product.category}
                        </span>
                      </div>

                      <h5
                        onClick={() => onSelectProduct && onSelectProduct(product)}
                        className="text-xs sm:text-sm font-serif font-bold text-white truncate cursor-pointer hover:text-amber-300 transition-colors"
                      >
                        {product.name}
                      </h5>

                      <p className="text-[11px] font-mono text-neutral-400 line-clamp-1">
                        {product.tagline}
                      </p>

                      <div className="flex items-center gap-3 pt-0.5">
                        <span className="text-xs font-mono font-bold text-amber-300">
                          {formatCurrency(product.price, currency)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-[10px] font-mono text-neutral-500 line-through">
                            {formatCurrency(product.originalPrice, currency)}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-neutral-400">
                          Sizes: {product.sizes.join(', ')}
                        </span>
                      </div>
                    </div>

                    {/* Quick Add Button with Scaling Animation */}
                    <div className="shrink-0 flex flex-col items-end gap-1.5">
                      <motion.button
                        id={`quiz-quick-add-${product.id}`}
                        whileHover={{ scale: isJustAdded ? 1.05 : 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        animate={
                          isJustAdded
                            ? { scale: [1, 1.3, 0.92, 1.12, 1] }
                            : { scale: 1 }
                        }
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        onClick={() => handleQuickAddProduct(product)}
                        className={`p-2.5 rounded-xl font-bold transition-all shadow-md flex items-center justify-center relative ${
                          isJustAdded
                            ? 'bg-amber-400 text-neutral-950 ring-2 ring-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.6)]'
                            : 'bg-white/[0.06] hover:bg-amber-400 hover:text-neutral-950 text-white border border-white/[0.1]'
                        }`}
                        title="Quick Add to Bag"
                      >
                        {isJustAdded ? (
                          <Check className="w-4 h-4 stroke-[2.5]" />
                        ) : (
                          <ShoppingBag className="w-4 h-4" />
                        )}
                      </motion.button>

                      {onSelectProduct && (
                        <button
                          onClick={() => onSelectProduct(product)}
                          className="text-[10px] font-mono text-neutral-400 hover:text-amber-300 transition-colors flex items-center gap-0.5"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
