import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Eye, ShoppingBag, Star, Sparkles, Check, ArrowLeftRight, Scale, Flame, ZoomIn, Ruler } from 'lucide-react';
import { Product, ProductColor, UserFitProfile } from '../types';
import { formatCurrency } from '../data/currency';
import { calculateSmartSize } from '../data/smartSize';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  isCompared?: boolean;
  onToggleCompare?: (productId: string) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: ProductColor) => void;
  currency?: string;
  fitProfile?: UserFitProfile | null;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onToggleWishlist,
  isCompared,
  onToggleCompare,
  onQuickView,
  onAddToCart,
  currency = 'USD',
  fitProfile,
}) => {
  const [selectedColor, setSelectedColor] = useState<ProductColor>(product.colors[0]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Smart Size recommendation based on Fit Quiz profile
  const smartSize = useMemo(() => calculateSmartSize(product, fitProfile), [product, fitProfile]);

  // Lens-style zoom state
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [isLensActive, setIsLensActive] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0, percentX: 50, percentY: 50 });

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleQuickAdd = (size: string) => {
    onAddToCart(product, size, selectedColor);
    setShowSizeSelector(false);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
      setIsLensActive(false);
      return;
    }

    const percentX = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const percentY = Math.max(0, Math.min(100, (y / rect.height) * 100));

    setLensPos({ x, y, percentX, percentY });
    setIsLensActive(true);
  };

  const currentImage = selectedColor?.image || product.images[activeImageIndex] || product.images[0];
  const LENS_SIZE = 128; // 128px luxury fabric inspection loupe

  return (
    <motion.div
      id={`product-card-${product.id}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      whileHover={{ y: -6, boxShadow: '0 20px 30px -10px rgba(0,0,0,0.8), 0 0 20px rgba(251, 191, 36, 0.12)' }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="group bg-neutral-900 border border-neutral-800/80 rounded-2xl overflow-hidden hover:border-neutral-700/90 transition-all duration-300 flex flex-col justify-between"
      onMouseEnter={() => {
        setIsHovered(true);
        if (product.images.length > 1) setActiveImageIndex(1);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsLensActive(false);
        setActiveImageIndex(0);
        setShowSizeSelector(false);
      }}
    >
      {/* Image Showcase & Action Overlay */}
      <div
        ref={imageContainerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsLensActive(true)}
        onMouseLeave={() => setIsLensActive(false)}
        className="relative aspect-[3/4] bg-neutral-950 overflow-hidden cursor-crosshair select-none"
      >
        <motion.img
          src={currentImage}
          alt={product.name}
          referrerPolicy="no-referrer"
          onClick={() => onQuickView(product)}
          animate={{ scale: isHovered && !isLensActive ? 1.05 : 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full h-full object-cover object-center"
        />

        {/* High-Precision Luxury Fabric Texture Zoom Lens */}
        <AnimatePresence>
          {isLensActive && isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{
                top: `${lensPos.y - LENS_SIZE / 2}px`,
                left: `${lensPos.x - LENS_SIZE / 2}px`,
                width: `${LENS_SIZE}px`,
                height: `${LENS_SIZE}px`,
                backgroundImage: `url(${currentImage})`,
                backgroundPosition: `${lensPos.percentX}% ${lensPos.percentY}%`,
                backgroundSize: '340% 340%',
              }}
              className="absolute pointer-events-none rounded-full border-2 border-amber-400 shadow-[0_0_25px_rgba(0,0,0,0.9),0_0_15px_rgba(251,191,36,0.4)] ring-4 ring-neutral-950/70 z-30 overflow-hidden"
            >
              {/* Luxury Crosshair & Weave Highlight Glare */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-amber-300/15 pointer-events-none" />
              <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                <div className="w-full h-[1px] bg-amber-300/60" />
                <div className="h-full w-[1px] bg-amber-300/60 absolute" />
              </div>
              <div className="absolute bottom-1.5 inset-x-0 text-center">
                <span className="bg-neutral-950/90 text-amber-300 text-[8px] font-mono tracking-widest px-1.5 py-0.5 rounded uppercase font-bold border border-amber-400/40 shadow">
                  FABRIC 3.4X
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Zoom Hint Tooltip Pill on Hover */}
        <AnimatePresence>
          {isHovered && !isLensActive && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none bg-neutral-950/80 backdrop-blur-md border border-neutral-700/80 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg"
            >
              <ZoomIn className="w-2.5 h-2.5 text-amber-300" />
              <span className="text-[9px] font-mono text-neutral-300 uppercase tracking-wider">Hover to inspect fabric</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Badges Container */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
          {smartSize.isRecommended && (
            <div
              className="relative group/smartsize pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.span
                id={`smart-size-badge-${product.id}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-neutral-950/95 border border-amber-400 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-md shadow-lg flex items-center gap-1.5 cursor-help transition-all hover:bg-amber-400 hover:text-neutral-950"
              >
                <Sparkles className="w-3 h-3 text-amber-400 group-hover/smartsize:text-neutral-950 shrink-0" />
                <span>Recommended for You</span>
                <span className="text-[9px] border-l border-amber-400/50 pl-1 font-mono">
                  {smartSize.matchScore}% · {smartSize.recommendedSize}
                </span>
              </motion.span>

              {/* Smart Size Precision Breakdown Hover Card */}
              <div className="absolute top-full left-0 mt-2 z-50 hidden group-hover/smartsize:block w-72 bg-neutral-950/98 border border-amber-400/50 rounded-2xl p-3.5 shadow-2xl backdrop-blur-2xl text-left pointer-events-none ring-1 ring-black">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-serif text-white">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-bold">Smart Size Match</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                    {smartSize.matchScore}% Match
                  </span>
                </div>

                <p className="text-[11px] text-neutral-300 font-light mb-2.5 leading-snug">
                  {smartSize.confidenceReason}
                </p>

                {/* Probability Progress Bar */}
                <div className="space-y-1 mb-2.5">
                  <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                    <span>Fit Probability:</span>
                    <span className="text-amber-300 font-bold">{smartSize.matchScore}% confidence</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-300"
                      style={{ width: `${smartSize.matchScore}%` }}
                    />
                  </div>
                </div>

                {/* Dimensions Breakdown */}
                <div className="space-y-1.5 border-t border-neutral-800/80 pt-2 text-[10px] font-mono">
                  {smartSize.dimensions.map((dim, idx) => (
                    <div key={idx} className="flex justify-between text-neutral-400">
                      <span>{dim.label}:</span>
                      <span className="text-neutral-200">
                        {dim.userMeasure} → <strong className="text-amber-300">{dim.targetRange}</strong>
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-2.5 pt-1.5 border-t border-neutral-800 text-[9px] font-mono text-neutral-500 uppercase tracking-wider text-center">
                  Calculated against your saved Fit Quiz data
                </div>
              </div>
            </div>
          )}

          {product.isNewArrival && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-amber-400 text-neutral-950 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md w-fit"
            >
              NEW
            </motion.span>
          )}
          {product.stockCount !== undefined && product.stockCount <= 5 && product.stockCount > 0 && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-r from-rose-950/90 to-amber-950/90 border border-amber-500/50 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full backdrop-blur-md shadow-lg flex items-center gap-1 w-fit"
            >
              <Flame className="w-3 h-3 text-rose-400 animate-pulse" />
              Only {product.stockCount} Left
            </motion.span>
          )}
          {product.stockCount === 0 && (
            <span className="bg-rose-950/90 text-rose-300 border border-rose-800 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md w-fit">
              Sold Out
            </span>
          )}
          {discountPercent && (
            <span className="bg-rose-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md w-fit">
              -{discountPercent}%
            </span>
          )}
          {product.isSustainable && (
            <span className="bg-emerald-950/90 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-sm w-fit">
              Eco-Craft
            </span>
          )}
        </div>

        {/* Top Right Actions (Wishlist & Compare) */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
          <motion.button
            id={`wishlist-toggle-${product.id}`}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product.id);
            }}
            className={`p-2.5 rounded-full backdrop-blur-md transition-all ${
              isWishlisted
                ? 'bg-rose-500 text-white shadow-lg'
                : 'bg-neutral-900/60 text-neutral-300 hover:text-white hover:bg-neutral-900/90'
            }`}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </motion.button>

          {onToggleCompare && (
            <motion.button
              id={`compare-toggle-${product.id}`}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare(product.id);
              }}
              className={`p-2.5 rounded-full backdrop-blur-md transition-all ${
                isCompared
                  ? 'bg-amber-400 text-neutral-950 font-bold shadow-lg ring-2 ring-amber-400/50'
                  : 'bg-neutral-900/60 text-neutral-300 hover:text-white hover:bg-neutral-900/90'
              }`}
              title={isCompared ? 'Remove from Compare' : 'Add to Compare'}
            >
              <Scale className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        {/* Quick View / Quick Add Animated Overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute inset-x-3 bottom-3 z-10 flex flex-col gap-2"
            >
              {showSizeSelector ? (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-neutral-950/95 backdrop-blur-md border border-neutral-700 rounded-xl p-2.5 text-center shadow-xl"
                >
                  <p className="text-[10px] font-mono uppercase text-neutral-400 mb-1.5">Select Size</p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {product.sizes.map((size) => {
                      const isBestMatch = smartSize.isRecommended && size === smartSize.recommendedSize;
                      return (
                        <motion.button
                          key={size}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleQuickAdd(size)}
                          className={`px-2.5 py-1 font-mono text-xs rounded transition-colors flex items-center gap-1 ${
                            isBestMatch
                              ? 'bg-amber-400 text-neutral-950 font-bold ring-2 ring-amber-400/50 shadow-sm'
                              : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                          }`}
                          title={isBestMatch ? `Smart Size Recommended (${smartSize.matchScore}% Match)` : size}
                        >
                          <span>{size}</span>
                          {isBestMatch && <Sparkles className="w-2.5 h-2.5 fill-current" />}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                <div className="flex items-center gap-2">
                  <motion.button
                    id={`quick-view-btn-${product.id}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickView(product);
                    }}
                    className="flex-1 bg-neutral-900/90 hover:bg-neutral-800 text-white text-xs font-medium py-2.5 rounded-xl border border-neutral-700 flex items-center justify-center gap-1.5 backdrop-blur-md transition-colors shadow-lg"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-300" />
                    <span>Quick View</span>
                  </motion.button>

                  <motion.button
                    id={`quick-add-btn-${product.id}`}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (product.sizes.length === 1) {
                        handleQuickAdd(product.sizes[0]);
                      } else {
                        setShowSizeSelector(true);
                      }
                    }}
                    className="p-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-xl transition-all shadow-md flex items-center justify-center"
                    title="Quick Add to Bag"
                  >
                    {addedAnimation ? (
                      <Check className="w-4 h-4 text-neutral-950" />
                    ) : (
                      <ShoppingBag className="w-4 h-4" />
                    )}
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product Information */}
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-neutral-400 font-mono uppercase">
          <span className="line-clamp-1">
            {product.style && <span className="text-amber-400 font-medium">{product.style} · </span>}
            {smartSize.isRecommended && (
              <span className="text-amber-300 font-semibold">
                Size {smartSize.recommendedSize} ({smartSize.matchScore}%) ·{' '}
              </span>
            )}
            {product.gender} · {product.category}
          </span>
          <div className="flex items-center gap-1 text-amber-400 shrink-0 ml-2">
            <Star className="w-3 h-3 fill-amber-400" />
            <span className="text-white text-xs font-medium">{product.rating}</span>
            <span className="text-neutral-500">({product.reviewCount})</span>
          </div>
        </div>

        <h3
          onClick={() => onQuickView(product)}
          className="text-sm font-medium text-white hover:text-amber-200 cursor-pointer transition-colors line-clamp-1"
        >
          {product.name}
        </h3>

        <p className="text-xs text-neutral-400 line-clamp-1 font-light">
          {product.tagline}
        </p>

        {/* Color Swatches */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-1.5">
            {product.colors.map((color) => (
              <motion.button
                key={color.name}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.85 }}
                onClick={() => setSelectedColor(color)}
                className={`w-3.5 h-3.5 rounded-full border transition-all ${
                  selectedColor.name === color.name
                    ? 'border-amber-400 scale-125 ring-1 ring-amber-400/50'
                    : 'border-neutral-700 opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>

          {/* Pricing */}
          <div className="flex items-center gap-2 font-mono">
            {product.originalPrice && (
              <span className="text-xs text-neutral-500 line-through">
                {formatCurrency(product.originalPrice, currency)}
              </span>
            )}
            <span className="text-sm font-semibold text-amber-300">
              {formatCurrency(product.price, currency)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

