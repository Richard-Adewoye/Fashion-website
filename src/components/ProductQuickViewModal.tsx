import React, { useState, useEffect, useMemo } from 'react';
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
  Tag
} from 'lucide-react';
import { Product, ProductColor, ProductReview } from '../types';
import { PRODUCTS as defaultProducts } from '../data/products';

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
}) => {
  if (!product) return null;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<ProductColor>(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'care' | 'reviews'>('description');
  const [addedAnimation, setAddedAnimation] = useState(false);

  // New review form state
  const [newAuthor, setNewAuthor] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

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
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800">
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
              <button
                onClick={() => onToggleWishlist(product.id)}
                className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all ${
                  isWishlisted ? 'bg-rose-500 text-white' : 'bg-neutral-900/60 text-neutral-300 hover:text-white'
                }`}
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
              <div className="flex items-baseline gap-3 pt-2">
                <span className="text-2xl font-serif font-bold text-amber-300">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-base text-neutral-500 line-through font-mono">
                    ${product.originalPrice}
                  </span>
                )}
                {product.isSustainable && (
                  <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full">
                    Eco-Craft Certified
                  </span>
                )}
              </div>

              {/* Low Stock Urgency Notification Banner */}
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
                    <div id="sold-out-alert" className="flex items-center gap-2.5 p-3 bg-rose-950/60 border border-rose-800/80 rounded-2xl text-rose-300 text-xs font-mono">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span><strong>Size {selectedSize} Sold Out:</strong> This garment size is currently unavailable. Select another size or check back soon.</span>
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
                        disabled={sizeSoldOut}
                        className={`px-3.5 py-2 text-xs font-mono rounded-xl border transition-all flex items-center gap-1.5 ${
                          sizeSoldOut
                            ? 'bg-neutral-900/40 text-neutral-600 border-neutral-850 cursor-not-allowed line-through'
                            : selectedSize === size
                            ? 'bg-amber-400 text-neutral-950 font-bold border-amber-400 shadow ring-2 ring-amber-400/30'
                            : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <span>{size}</span>
                        {sizeLow && !sizeSoldOut && (
                          <span className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold ${
                            selectedSize === size
                              ? 'bg-rose-950 text-rose-200 border border-rose-800'
                              : 'text-rose-400 bg-rose-950/90 border border-rose-800'
                          }`}>
                            {sizeStock} left
                          </span>
                        )}
                        {sizeSoldOut && (
                          <span className="text-[9px] text-neutral-500">Out</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Selector */}
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

              {/* Action CTA Buttons */}
              <div className="space-y-3 pt-4">
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
                      <span>Add to Bag (${product.price * quantity})</span>
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
                      <span>{isCompared ? 'Comparing' : 'Add to Compare'}</span>
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
    </div>
  );
};
