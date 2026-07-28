import React from 'react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Product, ProductColor } from '../types';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistIds: string[];
  products: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onAddToCart: (product: Product, size: string, color: ProductColor) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  wishlistIds,
  products,
  onRemoveFromWishlist,
  onAddToCart,
}) => {
  if (!isOpen) return null;

  const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div id="wishlist-modal-overlay" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end">
      <div 
        id="wishlist-modal-content"
        className="w-full max-w-md bg-neutral-900 border-l border-neutral-800 text-white h-full flex flex-col justify-between shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-current" />
            <h3 className="text-lg font-serif uppercase tracking-wider">Saved Wishlist</h3>
            <span className="text-xs font-mono bg-neutral-800 px-2 py-0.5 rounded-full text-neutral-400">
              {wishlistedProducts.length}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {wishlistedProducts.length === 0 ? (
            <div className="text-center py-16 space-y-3 text-neutral-500">
              <Heart className="w-12 h-12 text-neutral-800 mx-auto" />
              <p className="text-sm font-serif text-neutral-400">Your wishlist is currently empty.</p>
              <p className="text-xs font-mono">Tap the heart icon on any piece to save it for later.</p>
            </div>
          ) : (
            wishlistedProducts.map((product) => (
              <div
                key={product.id}
                className="flex gap-4 p-3 bg-neutral-950 rounded-2xl border border-neutral-800/80 items-center justify-between"
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-20 object-cover rounded-xl bg-neutral-900 shrink-0"
                />

                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="text-xs font-medium text-white truncate">{product.name}</h4>
                  <p className="text-xs font-mono font-semibold text-amber-300">${product.price}</p>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() =>
                        onAddToCart(product, product.sizes[0], product.colors[0])
                      }
                      className="px-3 py-1 bg-amber-400 text-neutral-950 font-bold text-[10px] uppercase rounded-lg hover:bg-amber-300 flex items-center gap-1"
                    >
                      <ShoppingBag className="w-3 h-3" /> Move to Bag
                    </button>

                    <button
                      onClick={() => onRemoveFromWishlist(product.id)}
                      className="text-neutral-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
