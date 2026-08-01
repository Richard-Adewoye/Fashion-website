import React, { useState } from 'react';
import { Sparkles, Mail, ShieldCheck, Heart, ArrowUp } from 'lucide-react';

interface FooterProps {
  onOpenSizeGuide: () => void;
  onOpenStylist: () => void;
  onOpenNewsletter: () => void;
  onOpenOrderStatus?: () => void;
  currency: string;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenSizeGuide,
  onOpenStylist,
  onOpenNewsletter,
  onOpenOrderStatus,
  currency,
}) => {
  const [footerEmail, setFooterEmail] = useState('');
  const [footerSubscribed, setFooterSubscribed] = useState(false);

  const handleFooterSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (footerEmail.trim()) {
      setFooterSubscribed(true);
      setFooterEmail('');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-neutral-950 text-neutral-400 border-t border-neutral-800 text-xs font-light">
      {/* Upper Newsletter & Brand Manifesto */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-5 space-y-4">
          <h2 className="text-2xl font-serif text-white tracking-[0.2em] font-light uppercase">
            ÉLAN STUDIO
          </h2>
          <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">
            Architectural tailoring, Grade-A Mongolian cashmere, and artisanal Italian craftsmanship designed for timeless elegance.
          </p>

          {/* Footer Newsletter Signup */}
          <div className="pt-2">
            <h4 className="text-xs font-mono uppercase text-amber-300 mb-2">Subscribe to ÉLAN Gazette</h4>
            {footerSubscribed ? (
              <p className="text-xs text-emerald-400 font-mono">Thank you! Welcome to the ÉLAN Inner Circle.</p>
            ) : (
              <form onSubmit={handleFooterSubscribe} className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  required
                  placeholder="Enter email for 10% coupon..."
                  value={footerEmail}
                  onChange={(e) => setFooterEmail(e.target.value)}
                  className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold uppercase text-[11px] rounded-xl font-mono"
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Links Column 1: Client Assistance */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="text-xs font-mono uppercase text-white tracking-wider">Client Care</h4>
          <ul className="space-y-2">
            <li>
              <button onClick={onOpenSizeGuide} className="hover:text-amber-300 transition-colors">
                Fit & Size Calculator
              </button>
            </li>
            <li>
              <span className="hover:text-amber-300 cursor-pointer transition-colors">
                Shipping & Returns
              </span>
            </li>
            <li>
              <button onClick={onOpenOrderStatus} className="hover:text-amber-300 transition-colors">
                Order Tracking & Live Status
              </button>
            </li>
            <li>
              <span className="hover:text-amber-300 cursor-pointer transition-colors">
                Garment Care Guide
              </span>
            </li>
          </ul>
        </div>

        {/* Links Column 2: The House */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="text-xs font-mono uppercase text-white tracking-wider">The House</h4>
          <ul className="space-y-2">
            <li>
              <button onClick={onOpenStylist} className="hover:text-amber-300 transition-colors flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>AI Stylist Match</span>
              </button>
            </li>
            <li>
              <button onClick={onOpenNewsletter} className="hover:text-amber-300 transition-colors">
                Private VIP Access
              </button>
            </li>
            <li>
              <span className="hover:text-amber-300 cursor-pointer transition-colors">
                Sustainable Craft
              </span>
            </li>
            <li>
              <span className="hover:text-amber-300 cursor-pointer transition-colors">
                Atelier Paris - Tokyo
              </span>
            </li>
          </ul>
        </div>

        {/* Links Column 3: Store Locations & Currency */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="text-xs font-mono uppercase text-white tracking-wider">Global Flagships</h4>
          <p className="text-neutral-400 text-[11px] leading-relaxed">
            Paris: 14 Avenue Montaigne<br />
            Tokyo: 5-7-2 Minamiaoyama, Minato-ku<br />
            New York: 420 Madison Avenue
          </p>
          <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-neutral-500 border-t border-neutral-900">
            <span>Currency: {currency}</span>
            <span>SSL 256-Bit Encrypted</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-900 py-6 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-neutral-500">
          <p>© 2026 ÉLAN Studio House. All rights reserved. Made with precision.</p>

          <div className="flex items-center gap-6">
            <span className="hover:text-neutral-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-neutral-300 cursor-pointer">Terms of Service</span>
            <button
              onClick={scrollToTop}
              className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-full transition-colors"
              title="Scroll to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
