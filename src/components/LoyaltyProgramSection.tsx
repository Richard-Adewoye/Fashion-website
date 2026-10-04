import React, { useState, useEffect } from 'react';
import { Crown, Sparkles, Award, ArrowRight, Check, CheckCircle2, ChevronRight, Gift } from 'lucide-react';
import { LoyaltyTier } from '../types';
import {
  LOYALTY_TIERS,
  INITIAL_LOYALTY_ORDERS,
  calculateLoyaltyTier,
  getNextTierInfo,
  LoyaltyOrderSummary,
} from '../data/loyalty';

interface LoyaltyProgramSectionProps {
  onOpenLoyaltyModal: () => void;
}

export const LoyaltyProgramSection: React.FC<LoyaltyProgramSectionProps> = ({
  onOpenLoyaltyModal,
}) => {
  const [orders, setOrders] = useState<LoyaltyOrderSummary[]>(() => {
    try {
      const saved = localStorage.getItem('elan_loyalty_orders');
      return saved ? JSON.parse(saved) : INITIAL_LOYALTY_ORDERS;
    } catch {
      return INITIAL_LOYALTY_ORDERS;
    }
  });

  const [redeemedPoints, setRedeemedPoints] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('elan_loyalty_redeemed_pts');
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  // Re-read storage on focus or update
  useEffect(() => {
    const handleStorage = () => {
      try {
        const savedOrders = localStorage.getItem('elan_loyalty_orders');
        if (savedOrders) setOrders(JSON.parse(savedOrders));
        const savedRedeemed = localStorage.getItem('elan_loyalty_redeemed_pts');
        if (savedRedeemed) setRedeemedPoints(Number(savedRedeemed));
      } catch (e) {
        console.error(e);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const lifetimePoints = orders.reduce((sum, ord) => sum + ord.pointsEarned, 0);
  const availablePoints = Math.max(0, lifetimePoints - redeemedPoints);
  const currentTier = calculateLoyaltyTier(lifetimePoints);
  const tierConfig = LOYALTY_TIERS[currentTier];
  const nextTierInfo = getNextTierInfo(currentTier, lifetimePoints);

  return (
    <section id="loyalty-program-section" className="border-t border-neutral-800 bg-neutral-950 py-16 px-4 sm:px-6 lg:px-8 text-neutral-300">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-900 pb-8">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-amber-400">
              <Crown className="w-4 h-4" />
              <span>Maison Élan Privilège</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-white font-light tracking-wide uppercase">
              The Patron Loyalty Circle
            </h2>
            <p className="text-neutral-400 text-xs sm:text-sm font-light leading-relaxed">
              Every garment acquired from our Parisian atelier earns bespoke loyalty rewards, unlocking complimentary worldwide express shipping, priority bespoke alterations, and private couture salon fittings.
            </p>
          </div>

          {/* Quick Member Overview & Modal CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
            <div className="bg-neutral-900/80 border border-neutral-800 p-3.5 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
                <Crown className="w-5 h-5" />
              </div>
              <div className="text-left font-mono">
                <span className="text-[10px] text-neutral-400 uppercase block">Your Standing</span>
                <div className="flex items-center gap-1.5">
                  <strong className="text-sm text-white font-serif">{currentTier} Patron</strong>
                  <span className="text-xs text-amber-400 font-bold">({availablePoints.toLocaleString()} pts)</span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenLoyaltyModal}
              className="px-5 py-3.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-2 group"
            >
              <span>Explore Rewards & Perks</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Live Order Points & Tier Milestone Dashboard Card */}
        <div className="bg-gradient-to-r from-neutral-900/90 via-neutral-900/60 to-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left Points Metric */}
            <div className="md:col-span-4 space-y-2 border-b md:border-b-0 md:border-r border-neutral-800 pb-6 md:pb-0 md:pr-6">
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block">
                Total Accrued from Order History
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-serif font-bold text-amber-300">
                  {lifetimePoints.toLocaleString()}
                </span>
                <span className="text-xs font-mono text-neutral-400 uppercase">Lifetime PTS</span>
              </div>
              <p className="text-xs text-neutral-400 font-mono">
                Across <strong className="text-white">{orders.length} completed orders</strong> •{' '}
                <strong className="text-emerald-400">{availablePoints.toLocaleString()} pts ready to redeem</strong>
              </p>
            </div>

            {/* Middle: Tier Progress Bar */}
            <div className="md:col-span-5 space-y-3 md:px-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-neutral-400">Current Status: <strong className="text-white">{currentTier} Tier</strong></span>
                <span className="text-amber-300 font-bold">
                  {currentTier === 'Elite'
                    ? 'Elite Tier Maintained'
                    : `${nextTierInfo.pointsNeeded} pts to ${nextTierInfo.nextTier}`}
                </span>
              </div>

              <div className="w-full bg-neutral-950 h-2.5 rounded-full overflow-hidden border border-neutral-800">
                <div
                  className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 h-full rounded-full transition-all duration-700"
                  style={{ width: `${nextTierInfo.progressPercentage}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500">
                <span>Silver (0 pts)</span>
                <span>Gold (1,500 pts)</span>
                <span>Elite (4,000 pts)</span>
              </div>
            </div>

            {/* Right: Order History Contributions preview */}
            <div className="md:col-span-3 space-y-2 md:pl-4 border-t md:border-t-0 border-neutral-800 pt-4 md:pt-0">
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block">
                Recent Order Points
              </span>
              <div className="space-y-1.5 text-xs font-mono">
                {orders.slice(0, 2).map((ord) => (
                  <div key={ord.orderId} className="flex justify-between items-center text-neutral-300 bg-neutral-950/60 px-2.5 py-1.5 rounded-lg border border-neutral-850">
                    <span>#{ord.orderId}</span>
                    <strong className="text-amber-400">+{ord.pointsEarned} pts</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3 Tier Privilege Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['Silver', 'Gold', 'Elite'] as LoyaltyTier[]).map((tierKey) => {
            const tier = LOYALTY_TIERS[tierKey];
            const isUserTier = currentTier === tierKey;

            return (
              <div
                key={tierKey}
                className={`rounded-3xl p-6 sm:p-7 border transition-all flex flex-col justify-between space-y-6 ${
                  isUserTier
                    ? 'bg-gradient-to-b from-neutral-900 to-neutral-950 border-amber-400 ring-2 ring-amber-400/30 shadow-2xl relative'
                    : 'bg-neutral-950 border-neutral-850 hover:border-neutral-750'
                }`}
              >
                {/* Active Indicator Banner */}
                {isUserTier && (
                  <div className="absolute -top-3.5 left-6 bg-amber-400 text-neutral-950 text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Your Current Tier</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                        tierKey === 'Elite'
                          ? 'bg-amber-400/20 text-amber-300 border-amber-400/50'
                          : tierKey === 'Gold'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                          : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                      }`}
                    >
                      {tier.tier} Tier
                    </span>
                    <span className="text-xs font-mono text-neutral-400">
                      {tier.multiplier}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-serif font-bold text-white">
                      {tier.minPoints.toLocaleString()}{tier.maxPoints ? ` - ${tier.maxPoints.toLocaleString()} PTS` : '+ PTS'}
                    </h3>
                    <p className="text-xs font-mono text-amber-300/80 mt-1">{tier.tagline}</p>
                  </div>

                  <div className="pt-3 border-t border-neutral-850 space-y-1.5">
                    <div className="flex justify-between text-xs font-mono text-neutral-400">
                      <span>Privilege Discount:</span>
                      <strong className="text-amber-300 font-bold">{tier.discountRate}% Off Cart</strong>
                    </div>
                  </div>

                  {/* Perks list */}
                  <div className="space-y-2.5 pt-2">
                    <span className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider block">
                      Tier Privileges:
                    </span>
                    <ul className="space-y-2 text-xs text-neutral-300 font-light">
                      {tier.perks.map((perk, i) => (
                        <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                          <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-850">
                  <button
                    onClick={onOpenLoyaltyModal}
                    className={`w-full py-2.5 rounded-xl text-xs font-mono transition-colors text-center ${
                      isUserTier
                        ? 'bg-neutral-900 hover:bg-neutral-800 text-amber-300 border border-amber-400/40'
                        : 'bg-neutral-900/60 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800'
                    }`}
                  >
                    {isUserTier ? 'Manage Available Rewards' : 'View Tier Privileges'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
