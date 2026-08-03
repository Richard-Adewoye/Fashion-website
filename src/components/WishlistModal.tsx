import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Heart,
  ShoppingBag,
  Trash2,
  Share2,
  Check,
  Eye,
  Sparkles,
  Plus,
  ArrowRight,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { Product, ProductColor } from '../types';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistIds: string[];
  products: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onToggleWishlist: (productId: string) => void;
  onClearWishlist?: () => void;
  onAddToCart: (product: Product, size: string, color: ProductColor) => void;
  onMoveAllToCart?: (items: { product: Product; size: string; color: ProductColor }[]) => void;
  onQuickView?: (product: Product) => void;
  onBrowseCatalog?: () => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  wishlistIds,
  products,
  onRemoveFromWishlist,
  onToggleWishlist,
  onClearWishlist,
  onAddToCart,
  onMoveAllToCart,
  onQuickView,
  onBrowseCatalog,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [movingAllToast, setMovingAllToast] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [selectedColors, setSelectedColors] = useState<Record<string, ProductColor>>({});

  if (!isOpen) return null;

  const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id));
  const suggestedProducts = products
    .filter((p) => !wishlistIds.includes(p.id))
    .slice(0, 4);

  const totalValue = wishlistedProducts.reduce((acc, item) => acc + item.price, 0);

  const handleShareWishlist = () => {
    const ids = wishlistIds.join(',');
    const shareUrl = `${window.location.origin}?wishlist=${ids}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleMoveAll = () => {
    const itemsToMove = wishlistedProducts.map((p) => ({
      product: p,
      size: selectedSizes[p.id] || p.sizes[0] || 'M',
      color: selectedColors[p.id] || p.colors[0],
    }));

    if (onMoveAllToCart) {
      onMoveAllToCart(itemsToMove);
    } else {
      itemsToMove.forEach((item) => {
        onAddToCart(item.product, item.size, item.color);
      });
    }

    setMovingAllToast(true);
    setTimeout(() => setMovingAllToast(false), 2000);
  };

  return (
    <div
      id="wishlist-modal-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end transition-opacity duration-300 animate-fadeIn"
      onClick={onClose}
    >
      <motion.div
        id="wishlist-modal-content"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="w-full max-w-lg bg-neutral-900 border-l border-neutral-800 text-white h-full flex flex-col justify-between shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-serif font-bold uppercase tracking-wider text-white">
                  Visitor Saved Wishlist
                </h3>
                <span className="text-xs font-mono bg-rose-500/20 border border-rose-500/40 text-rose-300 px-2 py-0.5 rounded-full font-bold">
                  {wishlistedProducts.length}
                </span>
              </div>
              <p className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>Persisted in local browser session</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {wishlistedProducts.length > 0 && (
              <button
                onClick={handleShareWishlist}
                className="p-2 text-neutral-300 hover:text-amber-300 rounded-full bg-neutral-900 border border-neutral-800 hover:border-amber-400/50 transition-colors"
                title="Share Wishlist Link"
              >
                {copiedLink ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full bg-neutral-900 border border-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Share Copy Notification Toast */}
        {copiedLink && (
          <div className="bg-emerald-950/90 border-y border-emerald-500/40 px-6 py-2 text-center text-emerald-300 text-xs font-mono flex items-center justify-center gap-2 animate-fadeIn">
            <Check className="w-3.5 h-3.5" />
            <span>Wishlist link copied to clipboard! Share with friends.</span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {wishlistedProducts.length === 0 ? (
            <div className="text-center py-16 space-y-4 text-neutral-500">
              <div className="w-16 h-16 rounded-3xl bg-neutral-950 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-700">
                <Heart className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-xs mx-auto">
                <h4 className="text-base font-serif font-bold text-white">Your Atelier Wishlist is Empty</h4>
                <p className="text-xs font-mono text-neutral-400">
                  Save your favorite haute couture pieces & seasonal looks as you explore the catalog.
                </p>
              </div>

              {onBrowseCatalog && (
                <button
                  onClick={() => {
                    onClose();
                    onBrowseCatalog();
                  }}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-mono font-bold rounded-xl uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 mx-auto"
                >
                  <span>Explore Catalog Edits</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Wishlist Header Stats Summary */}
              <div className="flex items-center justify-between bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800/80">
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                    Curated Collection
                  </span>
                  <p className="text-xs font-mono font-bold text-white">
                    {wishlistedProducts.length} Items Selected
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                    Estimated Value
                  </span>
                  <p className="text-sm font-mono font-bold text-amber-300">${totalValue}</p>
                </div>
              </div>

              {/* Saved Items List */}
              <div className="space-y-3">
                <AnimatePresence>
                  {wishlistedProducts.map((product) => {
                    const chosenColor = selectedColors[product.id] || product.colors[0];
                    const chosenSize = selectedSizes[product.id] || product.sizes[0] || 'M';

                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="group bg-neutral-950 rounded-2xl p-3.5 border border-neutral-850 hover:border-neutral-700 transition-all flex gap-3 shadow-lg"
                      >
                        {/* Thumbnail */}
                        <div
                          className="relative w-20 h-24 rounded-xl overflow-hidden bg-neutral-900 shrink-0 cursor-pointer"
                          onClick={() => onQuickView && onQuickView(product)}
                        >
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-amber-300">
                            <Eye className="w-4 h-4" />
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div className="space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <h4
                                onClick={() => onQuickView && onQuickView(product)}
                                className="text-xs font-serif font-bold text-white truncate cursor-pointer hover:text-amber-300 transition-colors"
                              >
                                {product.name}
                              </h4>
                              <button
                                onClick={() => onRemoveFromWishlist(product.id)}
                                className="text-neutral-500 hover:text-rose-400 p-1 rounded-full hover:bg-neutral-900 transition-colors shrink-0"
                                title="Remove from Wishlist"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center gap-2 text-xs font-mono">
                              <span className="text-amber-300 font-bold">${product.price}</span>
                              <span className="text-neutral-500">|</span>
                              <span className="capitalize text-neutral-400">{product.category}</span>
                            </div>
                          </div>

                          {/* Options Pickers */}
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-850">
                            {/* Color Selector */}
                            <div className="flex items-center gap-1">
                              {product.colors.map((c) => (
                                <button
                                  key={c.name}
                                  onClick={() =>
                                    setSelectedColors((prev) => ({ ...prev, [product.id]: c }))
                                  }
                                  className={`w-4 h-4 rounded-full border transition-all ${
                                    chosenColor.name === c.name
                                      ? 'border-amber-400 ring-2 ring-amber-400/30 scale-110'
                                      : 'border-neutral-700 opacity-70'
                                  }`}
                                  style={{ backgroundColor: c.hex }}
                                  title={c.name}
                                />
                              ))}
                            </div>

                            {/* Move to Bag Button */}
                            <button
                              onClick={() => onAddToCart(product, chosenSize, chosenColor)}
                              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-[10px] font-mono uppercase rounded-lg transition-all flex items-center gap-1 shadow-md"
                            >
                              <ShoppingBag className="w-3 h-3" />
                              <span>Move to Bag</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </>
          )}

          {/* Suggested Items to Wishlist */}
          {suggestedProducts.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-neutral-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-serif font-bold text-white uppercase tracking-wider">
                  Suggested For Your Wishlist
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {suggestedProducts.map((sug) => (
                  <div
                    key={sug.id}
                    className="bg-neutral-950 border border-neutral-850 rounded-xl p-2.5 flex flex-col justify-between space-y-2 group"
                  >
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-neutral-900">
                      <img
                        src={sug.images[0]}
                        alt={sug.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <button
                        onClick={() => onToggleWishlist(sug.id)}
                        className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-neutral-950/80 text-neutral-300 hover:text-rose-400 border border-neutral-800 backdrop-blur-md"
                        title="Save to Wishlist"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-0.5">
                      <h5 className="text-[11px] font-serif font-bold text-white truncate">{sug.name}</h5>
                      <p className="text-[10px] font-mono text-amber-300 font-bold">${sug.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        {wishlistedProducts.length > 0 && (
          <div className="p-6 border-t border-neutral-800 bg-neutral-950 space-y-3 shrink-0">
            {movingAllToast && (
              <div className="text-center text-xs font-mono text-amber-300 bg-amber-400/10 border border-amber-400/30 p-2 rounded-xl flex items-center justify-center gap-2">
                <Check className="w-3.5 h-3.5" />
                <span>All {wishlistedProducts.length} items moved to shopping bag!</span>
              </div>
            )}

            <button
              onClick={handleMoveAll}
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Move All ({wishlistedProducts.length}) to Shopping Bag</span>
            </button>

            {onClearWishlist && (
              <button
                onClick={onClearWishlist}
                className="w-full py-2 text-neutral-500 hover:text-rose-400 text-xs font-mono transition-colors text-center block"
              >
                Clear Entire Saved Wishlist
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
