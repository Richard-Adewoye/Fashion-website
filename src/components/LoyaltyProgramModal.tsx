import React, { useState, useEffect } from 'react';
import {
  X,
  Crown,
  Award,
  Sparkles,
  Gift,
  Check,
  ChevronRight,
  Copy,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
  PlusCircle,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { LoyaltyTier } from '../types';
import {
  LOYALTY_TIERS,
  REDEEMABLE_REWARDS,
  INITIAL_LOYALTY_ORDERS,
  calculateLoyaltyTier,
  getNextTierInfo,
  RedeemableReward,
  LoyaltyOrderSummary,
} from '../data/loyalty';

interface LoyaltyProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDiscount?: (code: string, percentage: number) => void;
  onOpenCart?: () => void;
}

export const LoyaltyProgramModal: React.FC<LoyaltyProgramModalProps> = ({
  isOpen,
  onClose,
  onApplyDiscount,
  onOpenCart,
}) => {
  if (!isOpen) return null;

  // Saved points state in localStorage
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

  const [activeTab, setActiveTab] = useState<'rewards' | 'tiers' | 'history' | 'earn'>('rewards');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [recentlyRedeemed, setRecentlyRedeemed] = useState<RedeemableReward | null>(null);
  const [selectedTierPreview, setSelectedTierPreview] = useState<LoyaltyTier>('Elite');

  // Compute total lifetime points from orders
  const lifetimePoints = orders.reduce((sum, ord) => sum + ord.pointsEarned, 0);
  const availablePoints = Math.max(0, lifetimePoints - redeemedPoints);
  const currentTier = calculateLoyaltyTier(lifetimePoints);
  const tierConfig = LOYALTY_TIERS[currentTier];
  const nextTierInfo = getNextTierInfo(currentTier, lifetimePoints);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('elan_loyalty_orders', JSON.stringify(orders));
      localStorage.setItem('elan_loyalty_redeemed_pts', redeemedPoints.toString());
    } catch (e) {
      console.error('Failed to sync loyalty state:', e);
    }
  }, [orders, redeemedPoints]);

  const handleRedeemReward = (reward: RedeemableReward) => {
    if (availablePoints < reward.pointsCost) return;

    setRedeemedPoints((prev) => prev + reward.pointsCost);
    setRecentlyRedeemed(reward);

    // Copy to clipboard
    navigator.clipboard.writeText(reward.promoCode);
    setCopiedCode(reward.promoCode);

    // If discount provided, apply directly to cart
    if (onApplyDiscount && reward.discountPercentage) {
      onApplyDiscount(reward.promoCode, reward.discountPercentage);
    }

    setTimeout(() => {
      setCopiedCode(null);
    }, 3000);
  };

  const handleSimulateNewOrder = () => {
    const newOrderId = `ELAN-${Math.floor(1000 + Math.random() * 9000)}`;
    const randomSpend = Math.floor(450 + Math.random() * 850);
    const newOrder: LoyaltyOrderSummary = {
      orderId: newOrderId,
      date: 'Today',
      total: randomSpend,
      pointsEarned: randomSpend,
      itemsDescription: 'Atelier Sovereign Selection Garment',
      status: 'Processing',
    };

    setOrders((prev) => [newOrder, ...prev]);
  };

  return (
    <div
      id="loyalty-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="loyalty-modal-card"
        className="relative w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-serif font-bold uppercase tracking-wider text-white">
                  ÉLAN PRIVILÈGE
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/40">
                  {currentTier} Tier Member
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono">
                The House Patron Loyalty & Bespoke Rewards Program
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* VIP Patron Membership Card & Tier Status Hero */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* Digital Luxury Card Visual */}
            <div className="md:col-span-6 relative rounded-2xl overflow-hidden p-6 flex flex-col justify-between border shadow-2xl min-h-[220px] bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 border-amber-500/40">
              {/* Subtle metallic hairline shimmer */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-start justify-between z-10">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-400 block">
                    MAISON ÉLAN PARIS
                  </span>
                  <h4 className="text-lg font-serif font-bold tracking-widest text-amber-300 uppercase">
                    PRIVILÈGE VIP
                  </h4>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 text-xs font-mono font-bold">
                  <Crown className="w-3.5 h-3.5" />
                  <span>{currentTier} Status</span>
                </div>
              </div>

              {/* Card Chip & Details */}
              <div className="space-y-4 z-10 pt-4">
                <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-300 via-amber-200 to-amber-500/80 border border-amber-100/50 shadow-inner flex items-center justify-center">
                  <div className="w-7 h-4 border border-amber-800/40 rounded-sm opacity-60" />
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-[9px] font-mono uppercase text-neutral-400 block">Member Cardholder</span>
                    <strong className="text-sm font-mono tracking-wider text-white">RICHARDS ADEWOYE</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-mono uppercase text-neutral-400 block">Member ID</span>
                    <span className="text-xs font-mono text-amber-300/90 font-bold">ELAN-VIP-8942</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Point Balances & Tier Milestone Progress */}
            <div className="md:col-span-6 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-1">
                  <span>Available Points Balance</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready to Redeem
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-serif font-bold text-amber-300">
                    {availablePoints.toLocaleString()}
                  </span>
                  <span className="text-sm font-mono text-neutral-400 uppercase">PTS</span>
                </div>
                <p className="text-xs font-mono text-neutral-400 mt-1">
                  Lifetime earned: <strong className="text-white">{lifetimePoints.toLocaleString()} pts</strong> across{' '}
                  <strong className="text-white">{orders.length} orders</strong>
                </p>
              </div>

              {/* Tier Progress Milestone */}
              <div className="space-y-2 border-t border-neutral-800 pt-3">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-neutral-400">Current Standing:</span>
                  <span className="text-amber-300 font-bold">
                    {currentTier === 'Elite'
                      ? 'Highest Tier Achieved (Elite)'
                      : `${nextTierInfo.pointsNeeded} pts to ${nextTierInfo.nextTier}`}
                  </span>
                </div>

                <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-800">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-700"
                    style={{ width: `${nextTierInfo.progressPercentage}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500">
                  <span>Silver (0 pts)</span>
                  <span>Gold (1,500 pts)</span>
                  <span>Elite (4,000 pts)</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  onClick={handleSimulateNewOrder}
                  className="px-3 py-1.5 bg-neutral-850 hover:bg-neutral-800 text-amber-300 text-xs font-mono rounded-xl border border-neutral-750 flex items-center gap-1.5 transition-colors shadow-sm"
                  title="Simulate placing a new order to test points accrual"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Simulate Order (+Points)</span>
                </button>

                <span className="text-[11px] font-mono text-neutral-400">
                  Tier Multiplier: <strong className="text-white">{tierConfig.multiplier}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Reward Redeemed Notification Toast */}
          {recentlyRedeemed && (
            <div className="p-4 bg-emerald-950/80 border border-emerald-700/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-emerald-200 shadow-xl animate-fade-in">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <strong className="text-white block font-sans text-sm">Reward Successfully Redeemed!</strong>
                  <span>
                    Code <strong className="text-amber-300">{recentlyRedeemed.promoCode}</strong> applied to your cart.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(recentlyRedeemed.promoCode);
                    setCopiedCode(recentlyRedeemed.promoCode);
                  }}
                  className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg border border-neutral-700 text-xs font-mono flex items-center gap-1"
                >
                  {copiedCode === recentlyRedeemed.promoCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === recentlyRedeemed.promoCode ? 'Copied' : 'Copy Code'}</span>
                </button>
                {onOpenCart && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCart();
                    }}
                    className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-lg text-xs font-mono"
                  >
                    View Bag
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center border-b border-neutral-800 gap-6 text-xs font-mono uppercase">
            {[
              { id: 'rewards', label: 'Redeem Rewards' },
              { id: 'tiers', label: 'Tier Privileges (Silver / Gold / Elite)' },
              { id: 'history', label: `Points History (${orders.length} Orders)` },
              { id: 'earn', label: 'How to Earn' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 border-b-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-amber-400 text-amber-300 font-bold'
                    : 'border-transparent text-neutral-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: REDEEM REWARDS */}
          {activeTab === 'rewards' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-serif font-bold text-white">Privilège Rewards Catalog</h4>
                  <p className="text-xs text-neutral-400 font-mono">
                    Redeem available points for discount vouchers, bespoke services, and complimentary atelier gifts.
                  </p>
                </div>
                <span className="text-xs font-mono text-amber-300">
                  Balance: <strong>{availablePoints} pts</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {REDEEMABLE_REWARDS.map((reward) => {
                  const canAfford = availablePoints >= reward.pointsCost;
                  const isRedeemedJustNow = recentlyRedeemed?.id === reward.id;

                  return (
                    <div
                      key={reward.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                        canAfford
                          ? 'bg-neutral-900/80 border-neutral-800 hover:border-amber-400/50'
                          : 'bg-neutral-950 border-neutral-850 opacity-60'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-amber-300 border border-neutral-700 uppercase">
                            {reward.tierRequired} Tier & Above
                          </span>
                          <span className="text-sm font-mono font-bold text-amber-400">
                            {reward.pointsCost} PTS
                          </span>
                        </div>
                        <h5 className="text-sm font-serif font-bold text-white">{reward.name}</h5>
                        <p className="text-xs text-neutral-400 font-light leading-relaxed">
                          {reward.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-neutral-500">
                          Code: <strong className="text-neutral-300">{reward.promoCode}</strong>
                        </span>

                        <button
                          onClick={() => handleRedeemReward(reward)}
                          disabled={!canAfford}
                          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 ${
                            isRedeemedJustNow
                              ? 'bg-emerald-500 text-neutral-950'
                              : canAfford
                              ? 'bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-md'
                              : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                          }`}
                        >
                          {isRedeemedJustNow ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Applied!</span>
                            </>
                          ) : canAfford ? (
                            <>
                              <Gift className="w-3.5 h-3.5" />
                              <span>Redeem</span>
                            </>
                          ) : (
                            <span>Need {reward.pointsCost - availablePoints} More Pts</span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: TIER PRIVILEGES (Silver / Gold / Elite) */}
          {activeTab === 'tiers' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-serif font-bold text-white">Tier Qualifications & Exclusive Privileges</h4>
                <p className="text-xs text-neutral-400 font-mono">
                  Points accumulate automatically with every atelier purchase. Tiers are guaranteed for 12 months.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['Silver', 'Gold', 'Elite'] as LoyaltyTier[]).map((tName) => {
                  const t = LOYALTY_TIERS[tName];
                  const isCurrent = currentTier === tName;

                  return (
                    <div
                      key={tName}
                      className={`rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 ${
                        isCurrent
                          ? 'bg-gradient-to-b from-neutral-900 to-neutral-950 border-amber-400 ring-2 ring-amber-400/20 shadow-xl'
                          : 'bg-neutral-900/40 border-neutral-800 opacity-80'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                              tName === 'Elite'
                                ? 'bg-amber-400 text-neutral-950 border-amber-400 font-bold'
                                : tName === 'Gold'
                                ? 'bg-amber-950 text-amber-300 border-amber-700'
                                : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                            }`}
                          >
                            {t.tier} Tier
                          </span>

                          {isCurrent && (
                            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Your Tier
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="text-lg font-serif font-bold text-white">
                            {t.minPoints.toLocaleString()}{t.maxPoints ? ` - ${t.maxPoints.toLocaleString()} PTS` : '+ PTS'}
                          </div>
                          <p className="text-[11px] font-mono text-amber-300/90">{t.tagline}</p>
                        </div>

                        <div className="pt-2 border-t border-neutral-800/80 space-y-1 text-xs font-mono">
                          <div className="flex justify-between text-neutral-400">
                            <span>Points Rate:</span>
                            <span className="text-white font-bold">{t.multiplier}</span>
                          </div>
                          <div className="flex justify-between text-neutral-400">
                            <span>Privilege Discount:</span>
                            <span className="text-amber-300 font-bold">{t.discountRate}% Off</span>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2">
                          <span className="text-[10px] font-mono uppercase text-neutral-500 block">Privileges Included:</span>
                          <ul className="space-y-1.5 text-xs text-neutral-300">
                            {t.perks.map((perk, i) => (
                              <li key={i} className="flex items-start gap-2 leading-relaxed">
                                <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                <span>{perk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-neutral-800 text-center">
                        <span className="text-[10px] font-mono text-neutral-500 uppercase">
                          {isCurrent
                            ? 'Currently Active on Your Account'
                            : t.minPoints > lifetimePoints
                            ? `Requires ${t.minPoints - lifetimePoints} more pts`
                            : 'Tier Passed'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ORDER POINTS HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-serif font-bold text-white">Order History & Points Ledger</h4>
                  <p className="text-xs text-neutral-400 font-mono">
                    Every completed order awards points based on your active tier multiplier.
                  </p>
                </div>
                <button
                  onClick={handleSimulateNewOrder}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs font-mono rounded-xl transition-colors flex items-center gap-1.5 shadow"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Simulate Atelier Order</span>
                </button>
              </div>

              <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden divide-y divide-neutral-800">
                {orders.map((ord) => (
                  <div key={ord.orderId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-900/90 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-mono text-white">Order #{ord.orderId}</strong>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
                          {ord.status}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 font-light truncate max-w-md">
                        {ord.itemsDescription}
                      </p>
                      <span className="text-[10px] font-mono text-neutral-500 block">
                        Completed on {ord.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-6 text-right font-mono">
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase block">Order Total</span>
                        <strong className="text-sm text-white">${ord.total.toFixed(2)}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase block">Points Earned</span>
                        <strong className="text-sm text-amber-300">+{ord.pointsEarned} PTS</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: HOW TO EARN */}
          {activeTab === 'earn' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-serif font-bold text-white">How to Earn Maison Points</h4>
                <p className="text-xs text-neutral-400 font-mono">
                  Multiply your rewards with bespoke interactions across the ÉLAN ecosystem.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    title: 'Atelier Purchases',
                    pts: '1x to 2x Points per $1',
                    desc: 'Every purchase automatically credits points immediately upon checkout completion.',
                    icon: ShoppingBag,
                  },
                  {
                    title: 'Verified Garment Reviews',
                    pts: '+50 Points',
                    desc: 'Leave thoughtful feedback on garment drape and fabric texture in the Quick View modal.',
                    icon: Award,
                  },
                  {
                    title: 'Eco-Craft Certified Purchases',
                    pts: '+100 Bonus Points',
                    desc: 'Awarded when investing in sustainable organic wool or regenerative cashmere pieces.',
                    icon: ShieldCheck,
                  },
                  {
                    title: 'Patron Private Referral',
                    pts: '+500 Points',
                    desc: 'Invite an atelier patron to create their first bespoke order with your personal code.',
                    icon: Crown,
                  },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-xl bg-amber-400/10 text-amber-300 border border-amber-400/30">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-mono font-bold text-amber-400">{item.pts}</span>
                      </div>
                      <h5 className="text-sm font-serif font-bold text-white">{item.title}</h5>
                      <p className="text-xs text-neutral-400 font-light leading-relaxed">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Bar */}
        <div className="p-4 sm:p-6 border-t border-neutral-800 bg-neutral-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-neutral-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Maison Élan Privilège Patron Circle is active</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl border border-neutral-800 transition-colors"
            >
              Close
            </button>
            {onOpenCart && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCart();
                }}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <span>View Shopping Bag</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
