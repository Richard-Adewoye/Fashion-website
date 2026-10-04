import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, 
  Star, 
  ShoppingBag, 
  Heart, 
  Truck, 
  ShieldCheck, 
  Ruler, 
  Check, 
  ChevronRight,
  MessageSquare,
  Sparkles,
  Scale,
  Flame,
  AlertTriangle,
  ArrowRight,
  Tag,
  Camera,
  ZoomIn,
  Bell,
  BellRing,
  Mail,
  CheckCircle2
} from 'lucide-react';
import { Product, ProductColor, ProductReview, PriceDropAlert } from '../types';
import { PRODUCTS as defaultProducts } from '../data/products';
import { VirtualTryOnModal } from './VirtualTryOnModal';
import { formatCurrency } from '../data/currency';

interface ProductQuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  isCompared?: boolean;
  onToggleCompare?: (productId: string) => void;
  onAddToCart: (product: Product, size: string, color: ProductColor, quantity: number) => void;
  onBuyNow: (product: Product, size: string, color: ProductColor, quantity: number) => void;
  onAddReview: (productId: string, review: Omit<ProductReview, 'id' | 'date' | 'verified'>) => void;
  onOpenSizeGuide: () => void;
  allProducts?: Product[];
  onSelectProduct?: (product: Product) => void;
  priceDropAlerts?: PriceDropAlert[];
  onTogglePriceDropAlert?: (productId: string) => void;
  currency?: string;
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  product,
  onClose,
  isWishlisted,
  onToggleWishlist,
  isCompared,
  onToggleCompare,
  onAddToCart,
  onBuyNow,
  onAddReview,
  onOpenSizeGuide,
  allProducts,
  onSelectProduct,
  priceDropAlerts = [],
  onTogglePriceDropAlert,
  currency = 'USD',
}) => {
  if (!product) return null;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<ProductColor>(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'care' | 'reviews'>('description');
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);

  // Interactive Fabric Zoom Lens State
  const [isZooming, setIsZooming] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(2.5);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleZoomMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomPos({ x, y });
    setLensPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  // New review form state
  const [newAuthor, setNewAuthor] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Restock Notification State
  interface RestockAlertItem {
    id: string;
    productId: string;
    productName: string;
    size: string;
    colorName: string;
    email: string;
    preference: 'size' | 'all';
    date: string;
  }

  const [restockAlerts, setRestockAlerts] = useState<RestockAlertItem[]>(() => {
    try {
      const saved = localStorage.getItem('elan_restock_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [notifyEmail, setNotifyEmail] = useState<string>(() => {
    try {
      return localStorage.getItem('elan_user_email') || 'richardadewoye031@gmail.com';
    } catch {
      return 'richardadewoye031@gmail.com';
    }
  });
  const [notifyPreference, setNotifyPreference] = useState<'size' | 'all'>('size');
  const [notifySubmitted, setNotifySubmitted] = useState<boolean>(false);
  const [notifyError, setNotifyError] = useState<string>('');
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Check if current selection has an active waitlist alert
  const existingAlert = useMemo(() => {
    if (!product) return null;
    return restockAlerts.find(
      (a) => a.productId === product.id && (a.size === selectedSize || a.preference === 'all')
    );
  }, [restockAlerts, product?.id, selectedSize]);

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail.trim() || !notifyEmail.includes('@')) {
      setNotifyError('Please provide a valid email address.');
      return;
    }

    const newAlert: RestockAlertItem = {
      id: `alert-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      size: selectedSize,
      colorName: selectedColor.name,
      email: notifyEmail.trim(),
      preference: notifyPreference,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    const updatedAlerts = [
      ...restockAlerts.filter((a) => !(a.productId === product.id && a.size === selectedSize)),
      newAlert,
    ];
    setRestockAlerts(updatedAlerts);
    try {
      localStorage.setItem('elan_restock_notifications', JSON.stringify(updatedAlerts));
      localStorage.setItem('elan_user_email', notifyEmail.trim());
    } catch (err) {
      console.error(err);
    }

    setNotifySubmitted(true);
    setNotifyError('');
  };

  const handleRemoveAlert = (alertId: string) => {
    const updated = restockAlerts.filter((a) => a.id !== alertId);
    setRestockAlerts(updated);
    try {
      localStorage.setItem('elan_restock_notifications', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    setNotifySubmitted(false);
  };

  // Reset selection state when active product changes
  useEffect(() => {
    if (product) {
      setSelectedImageIndex(0);
      if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0]);
      }
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      }
      setQuantity(1);
      setReviewSubmitted(false);
    }
  }, [product?.id]);

  // Compute "Recommended for You" products based on Category & Style Tags
  const catalog = allProducts || defaultProducts;

  const recommendedProducts = useMemo(() => {
    if (!product) return [];

    const candidates = catalog.filter((p) => p.id !== product.id);

    const scored = candidates.map((candidate) => {
      let score = 0;
      // Category match (+10)
      if (candidate.category.toLowerCase() === product.category.toLowerCase()) {
        score += 10;
      }
      // Gender match (+3)
      if (candidate.gender === product.gender) {
        score += 3;
      }
      // Style tag overlap (+5 per common tag)
      if (product.tags && candidate.tags) {
        const prodTagsLower = product.tags.map((t) => t.toLowerCase());
        const common = candidate.tags.filter((t) => prodTagsLower.includes(t.toLowerCase()));
        score += common.length * 5;
      }
      // Rating boost
      score += candidate.rating;

      return { candidate, score };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, 4).map((s) => s.candidate);
  }, [product, catalog]);

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize, selectedColor, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleBuyNow = () => {
    onBuyNow(product, selectedSize, selectedColor, quantity);
    onClose();
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim()) return;

    onAddReview(product.id, {
      author: newAuthor,
      rating: newRating,
      comment: newComment,
    });

    setNewAuthor('');
    setNewComment('');
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  return (
    <div id="quickview-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        id="quickview-modal-card" 
        className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-8 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Modal Button */}
        <button
          id="close-quickview-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 bg-neutral-950/80 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-full transition-colors border border-neutral-700"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Image Gallery */}
          <div className="p-6 bg-neutral-950 flex flex-col justify-between">
            {/* Interactive Zoom Lens Main Image Box */}
            <div
              id="quickview-image-zoom-container"
              className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 cursor-crosshair group select-none"
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleZoomMouseMove}
              onClick={() => setIsLightboxOpen(true)}
            >
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transition-transform duration-150 ease-out"
                style={{
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transform: isZooming ? `scale(${zoomLevel})` : 'scale(1)',
                }}
              />

              {/* Lens Magnifier Circle Indicator */}
              {isZooming && (
                <div
                  className="absolute pointer-events-none w-32 h-32 border-2 border-amber-400/80 rounded-full shadow-[0_0_30px_rgba(251,191,36,0.5)] bg-amber-400/5 backdrop-brightness-125 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-75"
                  style={{
                    left: `${lensPos.x}px`,
                    top: `${lensPos.y}px`,
                  }}
                >
                  <div className="w-full h-[1px] bg-amber-400/30 absolute" />
                  <div className="h-full w-[1px] bg-amber-400/30 absolute" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping z-10" />
                </div>
              )}

              {/* Zoom Status & Fabric Inspection Badge */}
              <div className="absolute bottom-3 left-3 pointer-events-none bg-neutral-950/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-neutral-800 flex items-center gap-2 text-[10px] font-mono text-neutral-300 shadow-xl z-10">
                <ZoomIn className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>
                  {isZooming
                    ? `${zoomLevel}x Fabric Detail (${Math.round(zoomPos.x)}%, ${Math.round(zoomPos.y)}%)`
                    : 'Hover Image to Zoom Fabric'}
                </span>
              </div>

              {/* Zoom Multiplier Control Bar */}
              <div 
                className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-neutral-950/80 backdrop-blur-md p-1 rounded-xl border border-neutral-800 shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                {[2, 3, 4].map((level) => (
                  <button
                    key={level}
                    onClick={() => setZoomLevel(level)}
                    className={`px-2 py-1 text-[10px] font-mono rounded-lg transition-all ${
                      zoomLevel === level
                        ? 'bg-amber-400 text-neutral-950 font-bold shadow'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    {level}x
                  </button>
                ))}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWishlist(product.id);
                }}
                className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all z-10 ${
                  isWishlisted ? 'bg-rose-500 text-white' : 'bg-neutral-900/60 text-neutral-300 hover:text-white hover:bg-neutral-800'
                }`}
                title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Thumbnail Selectors */}
            {product.images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImageIndex === idx
                        ? 'border-amber-400 scale-105'
                        : 'border-neutral-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Specs & Actions */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-6 overflow-y-auto max-h-[85vh]">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono uppercase text-neutral-400">
                <span>{product.gender} • {product.category}</span>
                <span className="text-amber-400 font-bold">SKU: {product.id.toUpperCase()}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif text-white">{product.name}</h2>
              
              <p className="text-xs text-neutral-400 font-light">{product.tagline}</p>

              {/* Rating Summary */}
              <div className="flex items-center gap-2 pt-1">
                <div className="flex items-center text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.floor(product.rating)
                          ? 'fill-amber-400'
                          : 'text-neutral-700'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-mono text-white font-medium">{product.rating}</span>
                <span className="text-xs text-neutral-500 font-mono">({product.reviewCount} customer reviews)</span>
              </div>

              {/* Price Display */}
              <div className="flex flex-wrap items-baseline gap-3 pt-2">
                <span className="text-2xl font-serif font-bold text-amber-300">
                  {formatCurrency(product.price, currency)}
                </span>
                {product.originalPrice && (
                  <span className="text-base text-neutral-500 line-through font-mono">
                    {formatCurrency(product.originalPrice, currency)}
                  </span>
                )}
                {product.isSustainable && (
                  <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full">
                    Eco-Craft Certified
                  </span>
                )}
                {(() => {
                  const alert = priceDropAlerts.find((a) => a.productId === product.id);
                  if (alert && alert.active && product.price < alert.initialPrice) {
                    return (
                      <span className="text-xs font-mono bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
                        Price Dropped from {formatCurrency(alert.initialPrice, currency)} (Save {formatCurrency(alert.initialPrice - product.price, currency)})
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Stock Status & Restock Notification Banner */}
              {(() => {
                const overallStock = product.stockCount ?? 8;
                const currentSizeStock =
                  product.stockPerSize && product.stockPerSize[selectedSize] !== undefined
                    ? product.stockPerSize[selectedSize]
                    : overallStock;
                const isLowStock = currentSizeStock <= 5 && currentSizeStock > 0;
                const isSoldOut = currentSizeStock === 0;

                if (isSoldOut) {
                  return (
                    <div id="sold-out-alert" className="p-4 sm:p-5 bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-neutral-950 border border-amber-500/40 rounded-2xl space-y-3.5 shadow-xl">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center shrink-0">
                            <Bell className="w-4 h-4 animate-bounce" />
                          </div>
                          <div>
                            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                              <span>Notify Me When Available</span>
                              <span className="text-[10px] text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-800">
                                Size {selectedSize} Sold Out
                              </span>
                            </h4>
                            <p className="text-[11px] text-neutral-400 font-light mt-0.5">
                              Join the priority atelier waitlist. We'll email you immediately when restocked.
                            </p>
                          </div>
                        </div>
                      </div>

                      {existingAlert || notifySubmitted ? (
                        <div className="p-3 bg-emerald-950/60 border border-emerald-700/70 rounded-xl space-y-2 text-xs font-mono">
                          <div className="flex items-center justify-between text-emerald-300">
                            <div className="flex items-center gap-2 font-bold">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span>You're on the Restock Waitlist!</span>
                            </div>
                            <span className="text-[10px] bg-emerald-900/60 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-700">
                              Priority Queue
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-300 leading-relaxed">
                            Notification will be sent to <strong className="text-amber-300">{notifyEmail || existingAlert?.email}</strong> the moment size <strong className="text-white">{selectedSize} ({selectedColor.name})</strong> is crafted and restocked.
                          </p>
                          <div className="pt-1 flex items-center justify-between text-[10px] text-neutral-400">
                            <span>Registered on {existingAlert?.date || 'Today'}</span>
                            {existingAlert && (
                              <button
                                onClick={() => handleRemoveAlert(existingAlert.id)}
                                className="text-rose-400 hover:text-rose-300 underline"
                              >
                                Cancel Alert
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={handleNotifySubmit} className="space-y-3 pt-1">
                          {notifyError && (
                            <div className="p-2 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-mono rounded-lg">
                              {notifyError}
                            </div>
                          )}

                          {/* Scope Selector: Selected Size vs Any Size */}
                          <div className="flex items-center gap-4 text-xs font-mono">
                            <label className="flex items-center gap-1.5 cursor-pointer text-neutral-300 hover:text-white">
                              <input
                                type="radio"
                                name="notifyScope"
                                checked={notifyPreference === 'size'}
                                onChange={() => setNotifyPreference('size')}
                                className="accent-amber-400"
                              />
                              <span>Size {selectedSize} only</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer text-neutral-400 hover:text-white">
                              <input
                                type="radio"
                                name="notifyScope"
                                checked={notifyPreference === 'all'}
                                onChange={() => setNotifyPreference('all')}
                                className="accent-amber-400"
                              />
                              <span>Any size restock</span>
                            </label>
                          </div>

                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <input
                                ref={emailInputRef}
                                type="email"
                                required
                                placeholder="Enter your email for restock alert..."
                                value={notifyEmail}
                                onChange={(e) => setNotifyEmail(e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-750 focus:border-amber-400 text-white text-xs font-mono pl-9 pr-3 py-2.5 rounded-xl focus:outline-none placeholder-neutral-500"
                              />
                              <Mail className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3" />
                            </div>
                            <button
                              type="submit"
                              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-mono font-bold text-xs uppercase rounded-xl transition-all shadow flex items-center gap-1.5 shrink-0"
                            >
                              <Bell className="w-3.5 h-3.5" />
                              <span>Notify Me</span>
                            </button>
                          </div>

                          <p className="text-[10px] font-mono text-neutral-500 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>Zero marketing spam. Notification sent only when garment arrives.</span>
                          </p>
                        </form>
                      )}
                    </div>
                  );
                }

                if (isLowStock) {
                  return (
                    <div id="low-stock-alert" className="p-3 bg-gradient-to-r from-amber-950/80 via-rose-950/60 to-neutral-900 border border-amber-500/50 rounded-2xl text-xs font-mono space-y-2 shadow-xl">
                      <div className="flex items-center justify-between text-amber-300">
                        <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[11px]">
                          <Flame className="w-4 h-4 text-rose-400 animate-bounce" />
                          <span>Low Stock Alert — Only {currentSizeStock} {currentSizeStock === 1 ? 'Unit' : 'Units'} Left!</span>
                        </div>
                        <span className="text-[10px] bg-rose-900/60 text-rose-300 px-2.5 py-0.5 rounded-full border border-rose-700/60 font-semibold">
                          High Urgency
                        </span>
                      </div>
                      <div className="w-full bg-neutral-950 h-1.5 rounded-full overflow-hidden border border-neutral-800">
                        <div
                          className="bg-gradient-to-r from-amber-400 to-rose-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(15, (currentSizeStock / 10) * 100))}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-neutral-400">
                        Items in size <strong className="text-white font-bold">{selectedSize}</strong> are selling fast. Order now to guarantee delivery.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>In Stock ({currentSizeStock} units available in atelier warehouse)</span>
                  </div>
                );
              })()}

              {/* Color Selector */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-neutral-400 uppercase">Color Palette:</span>
                  <span className="text-white font-medium">{selectedColor.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        selectedColor.name === color.name
                          ? 'border-amber-400 scale-110 ring-2 ring-amber-400/40'
                          : 'border-neutral-700 opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Size Selector & Fit Advisor */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-neutral-400 uppercase">Select Size:</span>
                  <button
                    onClick={onOpenSizeGuide}
                    className="text-amber-300 hover:underline flex items-center gap-1"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Find Your Fit Calculator</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => {
                    const overallStock = product.stockCount ?? 8;
                    const sizeStock = product.stockPerSize?.[size] ?? overallStock;
                    const sizeSoldOut = sizeStock === 0;
                    const sizeLow = sizeStock > 0 && sizeStock <= 3;

                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-3.5 py-2 text-xs font-mono rounded-xl border transition-all flex items-center gap-1.5 ${
                          sizeSoldOut && selectedSize === size
                            ? 'bg-rose-950/80 text-rose-200 border-rose-500 shadow ring-2 ring-rose-500/30'
                            : sizeSoldOut
                            ? 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                            : selectedSize === size
                            ? 'bg-amber-400 text-neutral-950 font-bold border-amber-400 shadow ring-2 ring-amber-400/30'
                            : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <span>{size}</span>
                        {sizeSoldOut ? (
                          <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                            selectedSize === size
                              ? 'bg-rose-900 text-rose-200'
                              : 'bg-neutral-800 text-neutral-400'
                          }`}>
                            Waitlist
                          </span>
                        ) : sizeLow ? (
                          <span className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold ${
                            selectedSize === size
                              ? 'bg-rose-950 text-rose-200 border border-rose-800'
                              : 'text-rose-400 bg-rose-950/90 border border-rose-800'
                          }`}>
                            {sizeStock} left
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Selector */}
              {(() => {
                const overallStock = product.stockCount ?? 8;
                const currentSizeStock =
                  product.stockPerSize && product.stockPerSize[selectedSize] !== undefined
                    ? product.stockPerSize[selectedSize]
                    : overallStock;
                const isSoldOut = currentSizeStock === 0;

                if (isSoldOut) {
                  return (
                    <div className="flex items-center gap-3 pt-2 text-xs font-mono text-neutral-500">
                      <span className="uppercase">Quantity:</span>
                      <span className="italic">Unavailable for out-of-stock sizes</span>
                    </div>
                  );
                }

                return (
                  <div className="flex items-center gap-4 pt-2">
                    <span className="text-xs font-mono uppercase text-neutral-400">Quantity:</span>
                    <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-1.5 text-neutral-400 hover:text-white font-bold"
                      >
                        -
                      </button>
                      <span className="px-3 py-1.5 font-mono text-xs text-white">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3 py-1.5 text-neutral-400 hover:text-white font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Action CTA Buttons */}
              <div className="space-y-3 pt-4">
                {(() => {
                  const overallStock = product.stockCount ?? 8;
                  const currentSizeStock =
                    product.stockPerSize && product.stockPerSize[selectedSize] !== undefined
                      ? product.stockPerSize[selectedSize]
                      : overallStock;
                  const isSoldOut = currentSizeStock === 0;

                  if (isSoldOut) {
                    return (
                      <div className="space-y-2">
                        {existingAlert || notifySubmitted ? (
                          <div className="w-full py-3.5 bg-neutral-900 border border-emerald-500/50 text-emerald-300 font-mono font-bold text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 shadow-lg">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Waitlist Confirmed (Size {selectedSize})</span>
                          </div>
                        ) : (
                          <button
                            id="notify-restock-cta-btn"
                            onClick={() => {
                              if (emailInputRef.current) {
                                emailInputRef.current.focus();
                                emailInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              }
                            }}
                            className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-850 text-amber-300 font-bold text-xs tracking-wider uppercase rounded-xl border border-amber-400/60 hover:border-amber-400 transition-all flex items-center justify-center gap-2 shadow-lg group"
                          >
                            <Bell className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                            <span>Notify Me When Size {selectedSize} Is Restocked</span>
                          </button>
                        )}
                        <p className="text-center text-[10px] font-mono text-neutral-500">
                          Select an in-stock size or register above for priority restock notification.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <>
                      <button
                        id="add-to-bag-quickview-btn"
                        onClick={handleAddToCart}
                        className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-medium text-xs tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
                      >
                        {addedAnimation ? (
                          <>
                            <Check className="w-4 h-4 text-neutral-950" />
                            <span>Added to Shopping Bag!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" />
                            <span>Add to Bag ({formatCurrency(product.price * quantity, currency)})</span>
                          </>
                        )}
                      </button>

                      <button
                        id="buy-now-quickview-btn"
                        onClick={handleBuyNow}
                        className="w-full py-3 bg-neutral-950 hover:bg-neutral-800 text-white font-light text-xs tracking-wider uppercase rounded-xl border border-neutral-700 transition-colors"
                      >
                        Buy Now with 1-Click Express Checkout
                      </button>
                    </>
                  );
                })()}

                {/* Virtual Try-On AR Fitting Button */}
                <button
                  id="virtual-tryon-quickview-btn"
                  onClick={() => setIsTryOnOpen(true)}
                  className="w-full py-3 bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 hover:from-neutral-850 hover:to-neutral-850 text-amber-300 font-bold text-xs tracking-wider uppercase rounded-xl border border-amber-400/50 hover:border-amber-400 transition-all flex items-center justify-center gap-2 shadow-lg group"
                >
                  <Camera className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>Virtual Try-On (AR Camera Mirror)</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                </button>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    id="wishlist-quickview-btn"
                    onClick={() => onToggleWishlist(product.id)}
                    className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-mono transition-all flex items-center justify-center gap-1.5 ${
                      isWishlisted
                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                        : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current text-rose-400' : ''}`} />
                    <span>{isWishlisted ? 'Wishlisted' : 'Save to Wishlist'}</span>
                  </button>

                  {onToggleCompare && (
                    <button
                      id="compare-quickview-btn"
                      onClick={() => onToggleCompare(product.id)}
                      className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-mono transition-all flex items-center justify-center gap-1.5 ${
                        isCompared
                          ? 'bg-amber-400 text-neutral-950 font-bold border-amber-400'
                          : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white hover:border-neutral-700'
                      }`}
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>{isCompared ? 'Comparing' : 'Compare'}</span>
                    </button>
                  )}

                  {onTogglePriceDropAlert && (
                    <button
                      id="price-drop-quickview-btn"
                      onClick={() => onTogglePriceDropAlert(product.id)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-mono transition-all flex items-center justify-center gap-1.5 ${
                        priceDropAlerts.some(a => a.productId === product.id && a.active)
                          ? 'bg-amber-400/20 text-amber-300 border-amber-400/60 font-semibold shadow-sm'
                          : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white hover:border-neutral-700'
                      }`}
                      title={priceDropAlerts.some(a => a.productId === product.id && a.active) ? 'Price alert is active' : 'Alert me when price drops'}
                    >
                      {priceDropAlerts.some(a => a.productId === product.id && a.active) ? (
                        <BellRing className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      ) : (
                        <Bell className="w-3.5 h-3.5 text-neutral-400" />
                      )}
                      <span className="hidden sm:inline">
                        {priceDropAlerts.some(a => a.productId === product.id && a.active) ? 'Alert Active' : 'Track Price'}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Tabs for Details & Reviews */}
              <div className="pt-6 border-t border-neutral-800">
                <div className="flex border-b border-neutral-800 gap-4 text-xs font-mono uppercase">
                  {(['description', 'details', 'care', 'reviews'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-2 border-b-2 transition-colors ${
                        activeTab === tab
                          ? 'border-amber-400 text-amber-300 font-bold'
                          : 'border-transparent text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="py-4 text-xs text-neutral-300 font-light leading-relaxed">
                  {activeTab === 'description' && <p>{product.description}</p>}

                  {activeTab === 'details' && (
                    <ul className="list-disc list-inside space-y-1">
                      {product.details.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  )}

                  {activeTab === 'care' && (
                    <div className="space-y-2">
                      <p><strong className="text-amber-200">Composition:</strong> {product.composition}</p>
                      <p><strong className="text-amber-200">Care:</strong> {product.careInstructions}</p>
                    </div>
                  )}

                  {activeTab === 'reviews' && (
                    <div className="space-y-4">
                      {/* Review List */}
                      {product.reviews.length === 0 ? (
                        <p className="text-neutral-500 italic">No customer reviews yet. Be the first to review!</p>
                      ) : (
                        product.reviews.map((rev) => (
                          <div key={rev.id} className="bg-neutral-950 p-3 rounded-xl border border-neutral-800/80 space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-white">{rev.author}</span>
                              <span className="text-[10px] text-neutral-500 font-mono">{rev.date}</span>
                            </div>
                            <div className="flex text-amber-400 text-[10px]">
                              {[...Array(rev.rating)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-amber-400" />
                              ))}
                            </div>
                            <p className="text-neutral-300 text-xs">{rev.comment}</p>
                          </div>
                        ))
                      )}

                      {/* Add Review Form */}
                      <form onSubmit={handleSubmitReview} className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3 mt-4">
                        <h4 className="text-xs font-mono uppercase text-amber-300">Write a Review</h4>
                        {reviewSubmitted && (
                          <div className="text-xs text-emerald-400 bg-emerald-950/60 p-2 rounded border border-emerald-800">
                            Thank you! Your review has been submitted.
                          </div>
                        )}
                        <input
                          type="text"
                          placeholder="Your Name"
                          value={newAuthor}
                          onChange={(e) => setNewAuthor(e.target.value)}
                          className="w-full bg-neutral-900 text-white text-xs p-2 rounded border border-neutral-800 focus:outline-none focus:border-amber-400"
                          required
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-400 font-mono">Rating:</span>
                          <select
                            value={newRating}
                            onChange={(e) => setNewRating(parseInt(e.target.value))}
                            className="bg-neutral-900 text-amber-300 text-xs p-1 rounded border border-neutral-800"
                          >
                            <option value={5}>5 Stars ★★★★★</option>
                            <option value={4}>4 Stars ★★★★☆</option>
                            <option value={3}>3 Stars ★★★☆☆</option>
                          </select>
                        </div>
                        <textarea
                          placeholder="Share your thoughts on fit, fabric texture, and craftsmanship..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          rows={2}
                          className="w-full bg-neutral-900 text-white text-xs p-2 rounded border border-neutral-800 focus:outline-none focus:border-amber-400"
                          required
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-amber-400 text-neutral-950 font-bold text-xs uppercase rounded-lg hover:bg-amber-300"
                        >
                          Submit Review
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recommended for You Section */}
            {recommendedProducts.length > 0 && (
              <div id="quickview-recommended-section" className="border-t border-neutral-800 pt-6 mt-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h4 className="text-base font-serif font-bold text-white uppercase tracking-wider">
                      Recommended For You
                    </h4>
                  </div>
                  <p className="text-xs font-mono text-neutral-400">
                    Curated pairings matching <strong className="text-amber-300 capitalize">{product.category}</strong> & style tags
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {recommendedProducts.map((rec) => {
                    const isSameCategory = rec.category.toLowerCase() === product.category.toLowerCase();
                    const commonTag = rec.tags?.find((t) =>
                      product.tags?.map((pt) => pt.toLowerCase()).includes(t.toLowerCase())
                    );

                    return (
                      <div
                        key={rec.id}
                        onClick={() => {
                          if (onSelectProduct) {
                            onSelectProduct(rec);
                          }
                        }}
                        className="group bg-neutral-950 border border-neutral-850 hover:border-amber-400/50 rounded-2xl p-2.5 transition-all cursor-pointer flex flex-col justify-between space-y-2 hover:shadow-xl hover:bg-neutral-900/60"
                      >
                        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-neutral-900">
                          <img
                            src={rec.images[0]}
                            alt={rec.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                            {isSameCategory ? (
                              <span className="bg-neutral-950/80 backdrop-blur-md border border-neutral-800 text-[9px] font-mono text-amber-300 px-2 py-0.5 rounded-full uppercase">
                                Same Category
                              </span>
                            ) : commonTag ? (
                              <span className="bg-amber-400/90 text-neutral-950 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                                {commonTag}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="space-y-1 px-1">
                          <h5 className="text-xs font-serif font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                            {rec.name}
                          </h5>
                          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                            <span className="capitalize">{rec.category}</span>
                            <span className="text-amber-300 font-bold">${rec.price}</span>
                          </div>
                        </div>

                        <div className="pt-1 border-t border-neutral-850 flex items-center justify-between text-[10px] font-mono text-neutral-400 group-hover:text-amber-300">
                          <span className="flex items-center gap-1 text-amber-300">
                            <Star className="w-3 h-3 fill-amber-300" />
                            <span>{rec.rating}</span>
                          </span>
                          <span className="flex items-center gap-0.5 font-semibold">
                            <span>View</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Virtual Try-On Fitting Room Modal */}
      <VirtualTryOnModal
        isOpen={isTryOnOpen}
        onClose={() => setIsTryOnOpen(false)}
        product={product}
        selectedColor={selectedColor}
        onAddToCart={onAddToCart}
      />

      {/* High Resolution Lightbox Fullscreen Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 p-3 bg-neutral-900/80 hover:bg-neutral-800 text-white rounded-full transition-colors border border-neutral-700 z-50"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center space-y-4">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="max-h-[82vh] max-w-full object-contain rounded-2xl shadow-2xl border border-neutral-800"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex items-center gap-4 bg-neutral-900/90 px-4 py-2 rounded-full border border-neutral-800 text-xs font-mono text-neutral-300">
              <span>{product.name} — High Detail View</span>
              <span className="text-amber-400">({selectedImageIndex + 1} of {product.images.length})</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
