import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Sparkles, Check } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, size: string, colorHex: string, delta: number) => void;
  onRemoveItem: (productId: string, size: string, colorHex: string) => void;
  onOpenCheckout: () => void;
  appliedDiscountCode: string;
  setAppliedDiscountCode: (code: string) => void;
  discountPercentage: number;
  setDiscountPercentage: (pct: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onOpenCheckout,
  appliedDiscountCode,
  setAppliedDiscountCode,
  discountPercentage,
  setDiscountPercentage,
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
            <div id="empty-cart-state" className="text-center py-16 space-y-4">
              <ShoppingBag className="w-12 h-12 text-neutral-700 mx-auto" />
              <p className="text-base font-serif text-neutral-400">Your shopping bag is empty.</p>
              <p className="text-xs text-neutral-500 font-mono">Explore our Autumn / Winter collection and add luxury staples.</p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-amber-400 text-neutral-950 font-bold text-xs uppercase rounded-full hover:bg-amber-300"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item) => {
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
                      ${item.product.price}
                    </p>

                    {/* Quantity Modifier */}
                    <div className="flex items-center gap-2 pt-1">
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

                      <button
                        onClick={() => onRemoveItem(item.product.id, item.selectedSize, item.selectedColor.hex)}
                        className="text-neutral-500 hover:text-rose-400 p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
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
                <span className="text-white">${subtotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount ({appliedDiscountCode})</span>
                  <span>-${discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-400">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? 'FREE' : `$${shippingFee}`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-amber-300 pt-2 border-t border-neutral-800">
                <span>Total</span>
                <span>${grandTotal}</span>
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
