import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BellRing, Tag, X, ShoppingBag, ArrowRight, Sparkles, TrendingDown } from 'lucide-react';
import { PriceDropNotification, Product, ProductColor } from '../types';

interface PriceDropNotificationToastProps {
  notifications: PriceDropNotification[];
  onDismiss: (id: string) => void;
  onAddToCart: (product: Product, size: string, color: ProductColor) => void;
  onOpenWishlist: () => void;
  onQuickView?: (product: Product) => void;
  products: Product[];
}

export const PriceDropNotificationToast: React.FC<PriceDropNotificationToastProps> = ({
  notifications,
  onDismiss,
  onAddToCart,
  onOpenWishlist,
  onQuickView,
  products,
}) => {
  // Show only unread or recent toasts, limit to max 3 at a time
  const visibleNotifications = notifications.slice(0, 3);

  if (visibleNotifications.length === 0) return null;

  return (
    <div
      id="price-drop-toast-container"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none"
    >
      <AnimatePresence>
        {visibleNotifications.map((notif) => {
          const product = products.find((p) => p.id === notif.productId);

          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="pointer-events-auto bg-neutral-900/95 border border-amber-400/40 rounded-2xl p-4 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.8),0_0_20px_rgba(251,191,36,0.2)] backdrop-blur-xl relative overflow-hidden group"
            >
              {/* Luxury Accent Glow Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-rose-500 to-amber-300 animate-pulse" />

              <div className="flex items-start gap-3">
                {/* Product Thumbnail */}
                <div
                  className="relative w-14 h-18 rounded-xl overflow-hidden bg-neutral-950 shrink-0 border border-neutral-800 cursor-pointer"
                  onClick={() => product && onQuickView && onQuickView(product)}
                >
                  <img
                    src={notif.productImage}
                    alt={notif.productName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-1 left-1 bg-rose-600 text-white text-[9px] font-mono font-bold px-1 rounded">
                    -{notif.percentDrop}%
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold">
                      <TrendingDown className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                      Wishlist Price Drop!
                    </span>
                    <button
                      onClick={() => onDismiss(notif.id)}
                      className="text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800 transition-colors"
                      title="Dismiss notification"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h5
                    onClick={() => product && onQuickView && onQuickView(product)}
                    className="text-xs font-serif font-bold text-white truncate cursor-pointer hover:text-amber-300 transition-colors"
                  >
                    {notif.productName}
                  </h5>

                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-neutral-500 line-through">${notif.oldPrice}</span>
                    <span className="text-emerald-400 font-bold text-sm">${notif.newPrice}</span>
                    <span className="text-[10px] bg-emerald-950/80 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                      Save ${notif.savings}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    {product && (
                      <button
                        onClick={() => {
                          const size = product.sizes[0] || 'M';
                          const color = product.colors[0];
                          onAddToCart(product, size, color);
                          onDismiss(notif.id);
                        }}
                        className="px-2.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-mono font-bold text-[10px] uppercase rounded-lg transition-all flex items-center gap-1 shadow"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Move to Bag</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onOpenWishlist();
                        onDismiss(notif.id);
                      }}
                      className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 hover:text-white font-mono text-[10px] uppercase rounded-lg border border-neutral-700 transition-all flex items-center gap-1"
                    >
                      <span>View Wishlist</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
