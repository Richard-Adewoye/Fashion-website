import React, { useState, useEffect } from 'react';
import { X, Sparkles, Mail, Check, Gift, AlertCircle, Copy, Clock, Tag } from 'lucide-react';

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewsletterModal: React.FC<NewsletterModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [hasTriggeredExitIntent, setHasTriggeredExitIntent] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (!isOpen || subscribed || hasTriggeredExitIntent) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger when mouse moves out towards top of browser window
      if (e.clientY <= 15) {
        setShowExitIntent(true);
        setHasTriggeredExitIntent(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isOpen, subscribed, hasTriggeredExitIntent]);

  if (!isOpen) return null;

  const handleCloseClick = () => {
    if (!hasTriggeredExitIntent && !subscribed) {
      setShowExitIntent(true);
      setHasTriggeredExitIntent(true);
    } else {
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div id="newsletter-modal-overlay" className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div 
        id="newsletter-modal-card"
        className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleCloseClick}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-950 border border-neutral-800 transition-colors"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Exit Intent Banner Offer */}
        {showExitIntent && !subscribed && (
          <div id="newsletter-exit-intent-alert" className="bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-amber-500/20 border border-amber-400/60 p-4 rounded-2xl space-y-2 animate-bounce-short">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-300 animate-pulse shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-mono text-amber-300 uppercase tracking-widest font-bold block">
                  Wait! Don't Leave Empty Handed
                </span>
                <h4 className="text-sm font-serif font-bold text-white">Upgraded: Take 20% OFF Instantly</h4>
              </div>
            </div>
            <p className="text-xs font-mono text-neutral-300">
              Use VIP code <strong className="text-amber-300">EXTRA20</strong> or submit your email below to save 20% right now!
            </p>
            <div className="flex items-center justify-between bg-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-800 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                <Tag className="w-3.5 h-3.5" /> EXTRA20
              </span>
              <button
                type="button"
                onClick={() => handleCopyCode('EXTRA20')}
                className="text-[11px] text-amber-400 hover:text-white underline flex items-center gap-1"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
          </div>
        )}

        {!subscribed ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-amber-400/20 border border-amber-400/30 rounded-full flex items-center justify-center mx-auto text-amber-400">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>

            <div>
              <span className="text-[10px] font-mono text-amber-300 uppercase tracking-widest bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                {showExitIntent ? 'Last-Minute VIP Pass' : 'Exclusive Invitation'}
              </span>
              <h3 className="text-2xl font-serif text-white mt-2">
                {showExitIntent ? 'Unlock 20% Atelier Discount' : 'Enjoy 15% Off Your First Order'}
              </h3>
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
                className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span>{showExitIntent ? 'Claim 20% Off Instantly' : 'Claim 15% VIP Access'}</span>
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
              Use promo code <span className="text-amber-300 font-bold bg-amber-400/20 px-2 py-0.5 rounded">{showExitIntent ? 'EXTRA20' : 'WELCOME10'}</span> at checkout for instant discount!
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
