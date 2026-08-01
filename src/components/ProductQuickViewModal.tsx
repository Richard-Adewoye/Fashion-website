import React, { useState } from 'react';
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
  Scale
} from 'lucide-react';
import { Product, ProductColor, ProductReview } from '../types';

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
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 text-xs font-mono rounded-xl border transition-all ${
                        selectedSize === size
                          ? 'bg-amber-400 text-neutral-950 font-bold border-amber-400 shadow'
                          : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
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
          </div>
        </div>
      </div>
    </div>
  );
};
