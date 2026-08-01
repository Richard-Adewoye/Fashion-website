import React, { useState } from 'react';
import { X, CheckCircle2, CreditCard, Truck, ShieldCheck, ArrowRight, Lock, Package } from 'lucide-react';
import { CartItem, OrderDetails } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  discountPercentage: number;
  onClearCart: () => void;
  onOpenOrderStatus?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  discountPercentage,
  onClearCart,
  onOpenOrderStatus,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');

  // Address State
  const [fullName, setFullName] = useState('Richards Adewoye');
  const [email, setEmail] = useState('richardadewoye031@gmail.com');
  const [address, setAddress] = useState('14 Avenue Montaigne');
  const [city, setCity] = useState('Paris');
  const [country, setCountry] = useState('France');
  const [postalCode, setPostalCode] = useState('75008');

  // Shipping & Payment Method
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('express');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'applepay'>('card');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvc, setCardCvc] = useState('888');

  // Final Created Order
  const [completedOrder, setCompletedOrder] = useState<OrderDetails | null>(null);

  const subtotal = cartItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
  const discountAmount = Math.round((subtotal * discountPercentage) / 100);
  const shippingFee = shippingMethod === 'express' ? (subtotal >= 200 ? 0 : 15) : 0;
  const tax = Math.round((subtotal - discountAmount) * 0.08);
  const total = subtotal - discountAmount + shippingFee + tax;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    const orderId = `ELAN-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: OrderDetails = {
      orderId,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      items: [...cartItems],
      shippingAddress: { fullName, email, address, city, country, postalCode },
      shippingMethod: shippingMethod === 'express' ? 'Complimentary Express Courier (1-2 Days)' : 'Standard Carbon-Neutral Delivery (3-5 Days)',
      paymentMethod: paymentMethod === 'card' ? 'Visa •••• 4242' : 'Apple Pay',
      subtotal,
      discount: discountAmount,
      shippingFee,
      tax,
      total,
    };

    setCompletedOrder(newOrder);
    setStep('confirmation');
    onClearCart();
  };

  return (
    <div id="checkout-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div
        id="checkout-modal-card"
        className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-auto p-6 sm:p-8 text-white space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl font-serif uppercase tracking-widest">Atelier Checkout</h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Checkout Steps Progress */}
        {step !== 'confirmation' && (
          <div className="flex items-center justify-center gap-4 text-xs font-mono uppercase">
            <span className={step === 'shipping' ? 'text-amber-400 font-bold underline' : 'text-neutral-500'}>
              1. Shipping Address
            </span>
            <span className="text-neutral-600">—</span>
            <span className={step === 'payment' ? 'text-amber-400 font-bold underline' : 'text-neutral-500'}>
              2. Secure Payment
            </span>
          </div>
        )}

        {/* STEP 1: Shipping Address Form */}
        {step === 'shipping' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStep('payment');
            }}
            className="space-y-4"
          >
            <h4 className="text-xs font-mono uppercase text-amber-300 tracking-wider">Shipping Details</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-neutral-400 font-mono mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-mono mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-neutral-400 font-mono mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-mono mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-mono mb-1">Postal Code</label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Shipping Method Option */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-mono uppercase text-amber-300 tracking-wider">Delivery Method</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label
                  className={`p-3 rounded-xl border cursor-pointer flex justify-between items-center ${
                    shippingMethod === 'express' ? 'bg-amber-400/10 border-amber-400' : 'bg-neutral-950 border-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'express'}
                      onChange={() => setShippingMethod('express')}
                    />
                    <div>
                      <p className="font-bold">Express Courier (1-2 Days)</p>
                      <p className="text-[10px] text-neutral-400 font-mono">Signature upon delivery</p>
                    </div>
                  </div>
                  <span className="font-mono text-amber-300">{subtotal >= 200 ? 'FREE' : '$15'}</span>
                </label>

                <label
                  className={`p-3 rounded-xl border cursor-pointer flex justify-between items-center ${
                    shippingMethod === 'standard' ? 'bg-amber-400/10 border-amber-400' : 'bg-neutral-950 border-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'standard'}
                      onChange={() => setShippingMethod('standard')}
                    />
                    <div>
                      <p className="font-bold">Standard Ground (3-5 Days)</p>
                      <p className="text-[10px] text-neutral-400 font-mono">Carbon neutral shipping</p>
                    </div>
                  </div>
                  <span className="font-mono text-emerald-400">FREE</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <span>Continue to Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: Payment Form */}
        {step === 'payment' && (
          <form onSubmit={handlePlaceOrder} className="space-y-4">
            <h4 className="text-xs font-mono uppercase text-amber-300 tracking-wider">Payment Details</h4>

            <div className="flex gap-4">
              <label
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 p-3 rounded-xl border cursor-pointer flex items-center gap-2 text-xs ${
                  paymentMethod === 'card' ? 'bg-amber-400/10 border-amber-400' : 'bg-neutral-950 border-neutral-800'
                }`}
              >
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span className="font-bold">Credit / Debit Card</span>
              </label>

              <label
                onClick={() => setPaymentMethod('applepay')}
                className={`flex-1 p-3 rounded-xl border cursor-pointer flex items-center gap-2 text-xs ${
                  paymentMethod === 'applepay' ? 'bg-amber-400/10 border-amber-400' : 'bg-neutral-950 border-neutral-800'
                }`}
              >
                <Package className="w-4 h-4 text-amber-400" />
                <span className="font-bold">Apple Pay Express</span>
              </label>
            </div>

            {paymentMethod === 'card' ? (
              <div className="space-y-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-xs">
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">Card Number</label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 font-mono mb-1">Expires (MM/YY)</label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 font-mono mb-1">Security Code (CVC)</label>
                    <input
                      type="text"
                      required
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 text-center text-xs text-neutral-400">
                You will authorize the payment using Apple Pay on order confirmation.
              </div>
            )}

            {/* Order Cost Breakdown */}
            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-xs font-mono space-y-1.5">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal</span>
                <span>${subtotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount</span>
                  <span>-${discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-400">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? 'FREE' : `$${shippingFee}`}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Estimated Tax (8%)</span>
                <span>${tax}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-amber-300 pt-2 border-t border-neutral-800">
                <span>Total Payment</span>
                <span>${total}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('shipping')}
                className="px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono rounded-xl"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-3.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl"
              >
                Place Order (${total})
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Order Confirmation */}
        {step === 'confirmation' && completedOrder && (
          <div id="order-confirmation-screen" className="text-center space-y-6 py-4">
            <CheckCircle2 className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />

            <div>
              <span className="text-xs font-mono bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full uppercase border border-amber-400/30">
                Order Confirmed
              </span>
              <h3 className="text-2xl font-serif text-white mt-2">Thank you for your order</h3>
              <p className="text-xs text-neutral-400 font-mono mt-1">
                Order Tracking ID: <span className="text-amber-300 font-bold">{completedOrder.orderId}</span>
              </p>
            </div>

            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 text-left text-xs font-mono space-y-3 max-h-60 overflow-y-auto">
              <p className="text-neutral-400">A confirmation email with tracking instructions has been dispatched to <strong className="text-white">{completedOrder.shippingAddress.email}</strong>.</p>
              
              <div className="border-t border-neutral-800 pt-2">
                <p className="font-bold text-amber-200">Delivery Address:</p>
                <p className="text-neutral-300">{completedOrder.shippingAddress.fullName}</p>
                <p className="text-neutral-400">{completedOrder.shippingAddress.address}, {completedOrder.shippingAddress.city}, {completedOrder.shippingAddress.country}</p>
              </div>

              <div className="border-t border-neutral-800 pt-2 space-y-1">
                <p className="font-bold text-amber-200">Purchased Items ({completedOrder.items.length}):</p>
                {completedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-neutral-300">
                    <span>{item.quantity}x {item.product.name} ({item.selectedSize})</span>
                    <span>${item.product.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-800 pt-2 flex justify-between font-bold text-amber-300 text-sm">
                <span>Total Paid:</span>
                <span>${completedOrder.total}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {onOpenOrderStatus && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenOrderStatus();
                  }}
                  className="px-6 py-3.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-bold text-xs uppercase tracking-wider rounded-full border border-amber-400/40 flex items-center justify-center gap-2"
                >
                  <Truck className="w-4 h-4 text-amber-400" /> Track Order Live Timeline
                </button>
              )}
              <button
                onClick={onClose}
                className="px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-full"
              >
                Return to Store Catalog
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
