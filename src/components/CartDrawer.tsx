import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Sparkles, Check, Bookmark } from 'lucide-react';
import { CartItem } from '../types';
import { formatCurrency } from '../data/currency';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  savedForLaterItems?: CartItem[];
  onUpdateQuantity: (productId: string, size: string, colorHex: string, delta: number) => void;
  onRemoveItem: (productId: string, size: string, colorHex: string) => void;
  onMoveToSavedForLater: (productId: string, size: string, colorHex: string) => void;
  onMoveToCart?: (productId: string, size: string, colorHex: string) => void;
  onRemoveSavedItem?: (productId: string, size: string, colorHex: string) => void;
  onOpenCheckout: () => void;
  appliedDiscountCode: string;
  setAppliedDiscountCode: (code: string) => void;
  discountPercentage: number;
  setDiscountPercentage: (pct: number) => void;
  currency?: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  savedForLaterItems = [],
  onUpdateQuantity,
  onRemoveItem,
  onMoveToSavedForLater,
  onMoveToCart,
  onRemoveSavedItem,
  onOpenCheckout,
  appliedDiscountCode,
  setAppliedDiscountCode,
  discountPercentage,
  setDiscountPercentage,
  currency = 'USD',
}) => {
  if (!isOpen) return null;

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = Math.round((subtotal * discountPercentage) / 100);
  const freeShippingThreshold = 200;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const shippingFee = isFreeShipping || cartItems.length === 0 ? 0 : 15;
  const grandTotal = subtotal - discountAmount + shippingFee;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');

    const code = promoInput.trim().toUpperCase();
    if (code === 'WELCOME10') {
      setAppliedDiscountCode('WELCOME10');
      setDiscountPercentage(10);
      setPromoSuccess('10% Welcome Discount applied!');
    } else if (code === 'ELAN20') {
      setAppliedDiscountCode('ELAN20');
      setDiscountPercentage(20);
      setPromoSuccess('20% VIP Atelier Discount applied!');
    } else {
      setPromoError('Invalid coupon code. Try "WELCOME10" or "ELAN20".');
    }
  };

  return (
    <div id="cart-drawer-overlay" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
      <div 
        id="cart-drawer-content"
        className="w-full max-w-md bg-neutral-900 border-l border-neutral-800 text-white h-full flex flex-col justify-between shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-serif tracking-wide uppercase">Shopping Bag</h3>
            <span className="text-xs font-mono bg-neutral-800 px-2 py-0.5 rounded-full text-neutral-400">
              {cartItems.reduce((acc, i) => acc + i.quantity, 0)} items
            </span>
            {savedForLaterItems.length > 0 && (
              <span className="text-[10px] font-mono text-amber-400/80">
                ({savedForLaterItems.length} saved)
              </span>
            )}
          </div>

          <button
            id="close-cart-drawer-btn"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="bg-neutral-950 px-6 py-3 border-b border-neutral-800 space-y-1.5">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-neutral-400">
              {isFreeShipping ? (
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <Check className="w-3.5 h-3.5" /> Free Express Shipping Unlocked!
                </span>
              ) : (
                `Add $${freeShippingThreshold - subtotal} more for Free Express Shipping`
              )}
            </span>
            <span className="text-neutral-500">{Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%</span>
          </div>
          <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cartItems.length === 0 ? (
            <div id="empty-cart-state" className="text-center py-10 space-y-3">
              <ShoppingBag className="w-10 h-10 text-neutral-700 mx-auto" />
              <p className="text-base font-serif text-neutral-300">Your shopping bag is empty.</p>
              <p className="text-xs text-neutral-500 font-mono">
                {savedForLaterItems.length > 0
                  ? `You have ${savedForLaterItems.length} item${savedForLaterItems.length > 1 ? 's' : ''} saved below for later.`
                  : 'Explore our Autumn / Winter collection and add luxury staples.'}
              </p>
              {savedForLaterItems.length === 0 && (
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-amber-400 text-neutral-950 font-bold text-xs uppercase rounded-full hover:bg-amber-300"
                >
                  Start Shopping
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => {
                const itemKey = `${item.product.id}-${item.selectedSize}-${item.selectedColor.hex}`;
                return (
                  <div
                    key={itemKey}
                    className="flex gap-4 p-3 bg-neutral-950/60 rounded-2xl border border-neutral-800/80 items-center justify-between"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-20 object-cover rounded-xl bg-neutral-900 shrink-0"
                    />

                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="text-xs font-medium text-white truncate">{item.product.name}</h4>
                      <p className="text-[11px] text-neutral-400 font-mono">
                        Size: <span className="text-white">{item.selectedSize}</span> • Color: <span className="text-white">{item.selectedColor.name}</span>
                      </p>
                      <p className="text-xs font-mono font-semibold text-amber-300">
                        {formatCurrency(item.product.price, currency)}
                      </p>

                      {/* Quantity Modifier & Move to Saved for Later */}
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.selectedSize, item.selectedColor.hex, -1)}
                            className="px-2 py-0.5 text-xs text-neutral-400 hover:text-white"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-mono text-white">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.selectedSize, item.selectedColor.hex, 1)}
                            className="px-2 py-0.5 text-xs text-neutral-400 hover:text-white"
                          >
                            +
                          </button>
                        </div>

                        {/* Move to Saved for Later Button */}
                        <button
                          id={`save-for-later-btn-${item.product.id}-${item.selectedSize}`}
                          onClick={() => onMoveToSavedForLater(item.product.id, item.selectedSize, item.selectedColor.hex)}
                          className="text-neutral-400 hover:text-amber-300 text-[10px] font-mono flex items-center gap-1 transition-colors px-2 py-1 rounded-lg border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 hover:border-neutral-700"
                          title="Move to Saved for Later"
                        >
                          <Bookmark className="w-3 h-3 text-amber-400" />
                          <span>Save for Later</span>
                        </button>

                        <button
                          onClick={() => onRemoveItem(item.product.id, item.selectedSize, item.selectedColor.hex)}
                          className="text-neutral-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-neutral-900 transition-colors ml-auto"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Saved for Later Section */}
          {savedForLaterItems.length > 0 && (
            <div id="saved-for-later-section" className="mt-6 pt-5 border-t border-neutral-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold">
                    Saved for Later
                  </h4>
                  <span className="text-[10px] font-mono bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-full">
                    {savedForLaterItems.length}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-neutral-500">
                  Kept out of checkout queue
                </span>
              </div>

              <div className="space-y-2.5">
                {savedForLaterItems.map((savedItem) => {
                  const savedKey = `saved-${savedItem.product.id}-${savedItem.selectedSize}-${savedItem.selectedColor.hex}`;
                  return (
                    <div
                      key={savedKey}
                      className="flex gap-3 p-3 bg-neutral-950/70 rounded-2xl border border-neutral-800/80 items-center justify-between hover:border-neutral-700 transition-colors"
                    >
                      <img
                        src={savedItem.product.images[0]}
                        alt={savedItem.product.name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-16 object-cover rounded-xl bg-neutral-900 shrink-0 opacity-80"
                      />

                      <div className="flex-1 min-w-0 space-y-1">
                        <h5 className="text-xs font-medium text-neutral-200 truncate">{savedItem.product.name}</h5>
                        <p className="text-[10px] text-neutral-400 font-mono">
                          Size: <span className="text-neutral-200">{savedItem.selectedSize}</span> • Color: <span className="text-neutral-200">{savedItem.selectedColor.name}</span>
                        </p>
                        <p className="text-xs font-mono font-medium text-amber-300">
                          {formatCurrency(savedItem.product.price, currency)}
                        </p>
                      </div>

                      <div className="flex flex-col gap-1.5 items-end shrink-0">
                        <button
                          id={`move-to-bag-btn-${savedItem.product.id}-${savedItem.selectedSize}`}
                          onClick={() => onMoveToCart?.(savedItem.product.id, savedItem.selectedSize, savedItem.selectedColor.hex)}
                          className="px-2.5 py-1.5 bg-neutral-800 hover:bg-amber-400 hover:text-neutral-950 text-neutral-200 text-[10px] font-mono uppercase font-bold rounded-lg border border-neutral-700 transition-all flex items-center gap-1 shadow-sm"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>Move to Bag</span>
                        </button>
                        <button
                          onClick={() => onRemoveSavedItem?.(savedItem.product.id, savedItem.selectedSize, savedItem.selectedColor.hex)}
                          className="text-neutral-500 hover:text-rose-400 text-[10px] font-mono px-1 transition-colors flex items-center gap-1"
                          title="Remove from saved"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {cartItems.length > 0 && (
          <div className="p-6 bg-neutral-950 border-t border-neutral-800 space-y-4">
            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="space-y-1.5">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Promo code (e.g. WELCOME10)"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-neutral-500 uppercase font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-mono font-medium rounded-xl border border-neutral-700"
                >
                  Apply
                </button>
              </div>
              {promoError && <p className="text-[10px] text-rose-400 font-mono">{promoError}</p>}
              {promoSuccess && <p className="text-[10px] text-emerald-400 font-mono">{promoSuccess}</p>}
            </form>

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs font-mono border-t border-neutral-800/80 pt-3">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal</span>
                <span className="text-white">{formatCurrency(subtotal, currency)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount ({appliedDiscountCode})</span>
                  <span>-{formatCurrency(discountAmount, currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-400">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? 'FREE' : formatCurrency(shippingFee, currency)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-amber-300 pt-2 border-t border-neutral-800">
                <span>Total</span>
                <span>{formatCurrency(grandTotal, currency)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              id="proceed-checkout-btn"
              onClick={() => {
                onClose();
                onOpenCheckout();
              }}
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
