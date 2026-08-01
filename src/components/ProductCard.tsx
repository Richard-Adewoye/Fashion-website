import React, { useState } from 'react';
import { Heart, Eye, ShoppingBag, Star, Sparkles, Check, ArrowLeftRight, Scale, Flame } from 'lucide-react';
import { Product, ProductColor } from '../types';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  isCompared?: boolean;
  onToggleCompare?: (productId: string) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: ProductColor) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onToggleWishlist,
  isCompared,
  onToggleCompare,
  onQuickView,
  onAddToCart,
}) => {
  const [selectedColor, setSelectedColor] = useState<ProductColor>(product.colors[0]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleQuickAdd = (size: string) => {
    onAddToCart(product, size, selectedColor);
    setShowSizeSelector(false);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      className="group bg-neutral-900 border border-neutral-800/80 rounded-2xl overflow-hidden hover:border-neutral-700 transition-all duration-300 flex flex-col justify-between"
      onMouseEnter={() => {
        setIsHovered(true);
        if (product.images.length > 1) setActiveImageIndex(1);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setActiveImageIndex(0);
        setShowSizeSelector(false);
      }}
    >
      {/* Image Showcase & Action Overlay */}
      <div className="relative aspect-[3/4] bg-neutral-950 overflow-hidden cursor-pointer">
        <img
          src={product.images[activeImageIndex] || product.images[0]}
          alt={product.name}
          referrerPolicy="no-referrer"
          onClick={() => onQuickView(product)}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Badges Container */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.isNewArrival && (
            <span className="bg-amber-400 text-neutral-950 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
              NEW
            </span>
          )}
          {product.stockCount !== undefined && product.stockCount <= 5 && product.stockCount > 0 && (
            <span className="bg-gradient-to-r from-rose-950/90 to-amber-950/90 border border-amber-500/50 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full backdrop-blur-md shadow-lg flex items-center gap-1">
              <Flame className="w-3 h-3 text-rose-400 animate-pulse" />
              Only {product.stockCount} Left
            </span>
          )}
          {product.stockCount === 0 && (
            <span className="bg-rose-950/90 text-rose-300 border border-rose-800 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md">
              Sold Out
            </span>
          )}
          {discountPercent && (
            <span className="bg-rose-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
              -{discountPercent}%
            </span>
          )}
          {product.isSustainable && (
            <span className="bg-emerald-950/90 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-sm">
              Eco-Craft
            </span>
          )}
        </div>

        {/* Top Right Actions (Wishlist & Compare) */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
          <button
            id={`wishlist-toggle-${product.id}`}
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
          </button>

          {onToggleCompare && (
            <button
              id={`compare-toggle-${product.id}`}
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
            </button>
          )}
        </div>

        {/* Quick View Button on Hover */}
        <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2">
          {showSizeSelector ? (
            <div className="bg-neutral-950/95 backdrop-blur-md border border-neutral-700 rounded-xl p-2.5 text-center shadow-xl">
              <p className="text-[10px] font-mono uppercase text-neutral-400 mb-1.5">Select Size</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleQuickAdd(size)}
                    className="px-2.5 py-1 bg-neutral-800 hover:bg-amber-400 hover:text-neutral-950 text-white font-mono text-xs rounded transition-colors"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id={`quick-view-btn-${product.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickView(product);
                }}
                className="flex-1 bg-neutral-900/90 hover:bg-neutral-800 text-white text-xs font-medium py-2.5 rounded-xl border border-neutral-700 flex items-center justify-center gap-1.5 backdrop-blur-md transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Quick View</span>
              </button>

              <button
                id={`quick-add-btn-${product.id}`}
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
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-neutral-400 font-mono uppercase">
          <span>{product.gender} • {product.category}</span>
          <div className="flex items-center gap-1 text-amber-400">
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
              <button
                key={color.name}
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
                ${product.originalPrice}
              </span>
            )}
            <span className="text-sm font-semibold text-amber-300">
              ${product.price}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
