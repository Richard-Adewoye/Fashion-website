import React, { useState } from 'react';
import { X, Sparkles, Mail, Check } from 'lucide-react';

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewsletterModal: React.FC<NewsletterModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  };

  return (
    <div id="newsletter-modal-overlay" className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        id="newsletter-modal-card"
        className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-950 border border-neutral-800"
        >
          <X className="w-5 h-5" />
        </button>

        {!subscribed ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-amber-400/20 border border-amber-400/30 rounded-full flex items-center justify-center mx-auto text-amber-400">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>

            <div>
              <span className="text-[10px] font-mono text-amber-300 uppercase tracking-widest bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                Exclusive Invitation
              </span>
              <h3 className="text-2xl font-serif text-white mt-2">Enjoy 15% Off Your First Order</h3>
              <p className="text-xs text-neutral-400 font-light mt-1">
                Subscribe to ÉLAN Gazette for private preview access, seasonal lookbook launches, and bespoke styling edits.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 pt-2">
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg"
              >
                Claim 15% VIP Access
              </button>
            </form>

            <p className="text-[10px] text-neutral-500 font-mono">
              Unsubscribe anytime. We respect your digital privacy.
            </p>
          </div>
        ) : (
          <div className="text-center space-y-4 py-4">
            <Check className="w-12 h-12 text-amber-400 mx-auto" />
            <h3 className="text-2xl font-serif text-white">Welcome to ÉLAN Atelier</h3>
            <p className="text-xs text-neutral-300 font-mono">
              Use promo code <span className="text-amber-300 font-bold bg-amber-400/20 px-2 py-0.5 rounded">WELCOME10</span> at checkout for 10% instant discount!
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-amber-400 text-neutral-950 font-bold text-xs uppercase rounded-full"
            >
              Start Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
