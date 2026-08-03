import React, { useState, useEffect } from 'react';
import { PRODUCTS } from './data/products';
import { Product, CartItem, FilterState, ProductColor, ProductReview } from './types';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { ProductGrid } from './components/ProductGrid';
import { ProductQuickViewModal } from './components/ProductQuickViewModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AIStylistDrawer } from './components/AIStylistDrawer';
import { ShoppableLookbook } from './components/ShoppableLookbook';
import { WishlistModal } from './components/WishlistModal';
import { SizeGuideModal } from './components/SizeGuideModal';
import { NewsletterModal } from './components/NewsletterModal';
import { ChatBotDrawer } from './components/ChatBotDrawer';
import { CompareStickyTray } from './components/CompareStickyTray';
import { CompareModal } from './components/CompareModal';
import { TrendingProductsSection } from './components/TrendingProductsSection';
import { OrderStatusModal } from './components/OrderStatusModal';
import { Footer } from './components/Footer';

export default function App() {
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      product: PRODUCTS[0], // Atelier Wool Blend Overcoat
      selectedColor: PRODUCTS[0].colors[0],
      selectedSize: 'M',
      quantity: 1,
    },
  ]);
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('elan_visitor_wishlist');
      return saved ? JSON.parse(saved) : ['elan-02', 'elan-05'];
    } catch {
      return ['elan-02', 'elan-05'];
    }
  });

  // Persist visitor wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('elan_visitor_wishlist', JSON.stringify(wishlistIds));
    } catch (err) {
      console.error('Failed to save visitor wishlist:', err);
    }
  }, [wishlistIds]);
  const [compareIds, setCompareIds] = useState<string[]>(['elan-01', 'elan-06']);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [currency, setCurrency] = useState<string>('USD');

  // Drawers & Modals Visibility State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isStylistOpen, setIsStylistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);
  const [isOrderStatusOpen, setIsOrderStatusOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Discounts
  const [appliedDiscountCode, setAppliedDiscountCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);

  // Filters State
  const [filterState, setFilterState] = useState<FilterState>({
    category: 'all',
    gender: 'all',
    priceRange: [0, 600],
    colors: [],
    sizes: [],
    sortBy: 'featured',
    searchQuery: '',
    onlySale: false,
    onlySustainable: false,
  });

  // Handle Tab Switch
  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'women') {
      setFilterState((prev) => ({ ...prev, gender: 'women', category: 'all' }));
      scrollToSection('catalog-section');
    } else if (tab === 'men') {
      setFilterState((prev) => ({ ...prev, gender: 'men', category: 'all' }));
      scrollToSection('catalog-section');
    } else if (tab === 'lookbook') {
      scrollToSection('shoppable-lookbook-section');
    } else {
      setFilterState((prev) => ({ ...prev, gender: 'all', category: 'all' }));
      scrollToSection('catalog-section');
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Cart Operations
  const handleAddToCart = (
    product: Product,
    selectedSize: string,
    selectedColor: ProductColor,
    quantity: number = 1
  ) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === selectedSize &&
          item.selectedColor.hex === selectedColor.hex
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      } else {
        return [...prev, { product, selectedSize, selectedColor, quantity }];
      }
    });

    setIsCartOpen(true);
  };

  const handleAddMultipleToCart = (
    items: { product: Product; size: string; color: ProductColor }[]
  ) => {
    items.forEach((item) => {
      handleAddToCart(item.product, item.size, item.color, 1);
    });
  };

  const handleUpdateQuantity = (
    productId: string,
    size: string,
    colorHex: string,
    delta: number
  ) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (
            item.product.id === productId &&
            item.selectedSize === size &&
            item.selectedColor.hex === colorHex
          ) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (productId: string, size: string, colorHex: string) => {
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product.id === productId &&
            item.selectedSize === size &&
            item.selectedColor.hex === colorHex
          )
      )
    );
  };

  // Wishlist Operations
  const handleToggleWishlist = (productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Compare Operations
  const handleToggleCompare = (productId: string) => {
    setCompareIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      if (prev.length >= 4) {
        // Max 4 items allowed
        return [...prev.slice(1), productId];
      }
      return [...prev, productId];
    });
  };

  // Add Review
  const handleAddReview = (
    productId: string,
    reviewData: Omit<ProductReview, 'id' | 'date' | 'verified'>
  ) => {
    setProductsList((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const newReview: ProductReview = {
            ...reviewData,
            id: `rev-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            verified: true,
          };
          const updatedReviews = [newReview, ...p.reviews];
          const newRating = parseFloat(
            (
              updatedReviews.reduce((sum, r) => sum + r.rating, 0) /
              updatedReviews.length
            ).toFixed(1)
          );
          return {
            ...p,
            reviews: updatedReviews,
            reviewCount: updatedReviews.length,
            rating: newRating,
          };
        }
        return p;
      })
    );
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans antialiased selection:bg-amber-400 selection:text-neutral-950">
      {/* Header */}
      <Header
        cartItems={cartItems}
        wishlistIds={wishlistIds}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenStylist={() => setIsStylistOpen(true)}
        onOpenOrderStatus={() => setIsOrderStatusOpen(true)}
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
        searchQuery={filterState.searchQuery}
        setSearchQuery={(q) => setFilterState((prev) => ({ ...prev, searchQuery: q }))}
        currency={currency}
        setCurrency={setCurrency}
        products={productsList}
        onSelectProduct={(p) => setQuickViewProduct(p)}
      />

      {/* Hero Showcase Banner */}
      <HeroBanner
        onShopNow={() => scrollToSection('catalog-section')}
        onOpenStylist={() => setIsStylistOpen(true)}
        onOpenLookbook={() => scrollToSection('shoppable-lookbook-section')}
      />

      {/* Main Catalog & Filter Grid */}
      <ProductGrid
        products={productsList}
        filterState={filterState}
        setFilterState={setFilterState}
        wishlistIds={wishlistIds}
        onToggleWishlist={handleToggleWishlist}
        compareIds={compareIds}
        onToggleCompare={handleToggleCompare}
        onQuickView={(p) => setQuickViewProduct(p)}
        onAddToCart={handleAddToCart}
      />

      {/* Shoppable Editorial Lookbook */}
      <ShoppableLookbook
        products={productsList}
        onQuickView={(p) => setQuickViewProduct(p)}
        onAddToCart={handleAddToCart}
      />

      {/* Real-Time D3.js Trending Analytics */}
      <TrendingProductsSection
        products={productsList}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        onQuickView={(p) => setQuickViewProduct(p)}
        onAddToCart={handleAddToCart}
      />

      {/* Footer */}
      <Footer
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onOpenStylist={() => setIsStylistOpen(true)}
        onOpenNewsletter={() => setIsNewsletterOpen(true)}
        onOpenOrderStatus={() => setIsOrderStatusOpen(true)}
        currency={currency}
      />

      {/* Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        isWishlisted={quickViewProduct ? wishlistIds.includes(quickViewProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
        isCompared={quickViewProduct ? compareIds.includes(quickViewProduct.id) : false}
        onToggleCompare={handleToggleCompare}
        onAddToCart={handleAddToCart}
        onBuyNow={(prod, size, color, qty) => {
          handleAddToCart(prod, size, color, qty);
          setIsCheckoutOpen(true);
        }}
        onAddReview={handleAddReview}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        allProducts={productsList}
        onSelectProduct={(p) => setQuickViewProduct(p)}
      />

      {/* Floating Sticky Compare Bar */}
      <CompareStickyTray
        compareIds={compareIds}
        products={productsList}
        onOpenCompareModal={() => setIsCompareOpen(true)}
        onRemoveFromCompare={(id) => setCompareIds((prev) => prev.filter((i) => i !== id))}
        onClearCompare={() => setCompareIds([])}
      />

      {/* Side-by-Side Compare Modal */}
      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        compareIds={compareIds}
        products={productsList}
        onRemoveFromCompare={(id) => setCompareIds((prev) => prev.filter((i) => i !== id))}
        onClearCompare={() => setCompareIds([])}
        onAddToCart={handleAddToCart}
        onSelectProduct={(p) => setQuickViewProduct(p)}
      />

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
        appliedDiscountCode={appliedDiscountCode}
        setAppliedDiscountCode={setAppliedDiscountCode}
        discountPercentage={discountPercentage}
        setDiscountPercentage={setDiscountPercentage}
      />

      {/* Multi-step Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        discountPercentage={discountPercentage}
        onClearCart={() => setCartItems([])}
        onOpenOrderStatus={() => setIsOrderStatusOpen(true)}
      />

      {/* Order Status & Live Logistics Dashboard Modal */}
      <OrderStatusModal
        isOpen={isOrderStatusOpen}
        onClose={() => setIsOrderStatusOpen(false)}
        onSelectProduct={(p) => setQuickViewProduct(p)}
        products={productsList}
      />

      {/* AI Stylist Drawer */}
      <AIStylistDrawer
        isOpen={isStylistOpen}
        onClose={() => setIsStylistOpen(false)}
        products={productsList}
        onAddMultipleToCart={handleAddMultipleToCart}
      />

      {/* Wishlist Drawer */}
      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistIds={wishlistIds}
        products={productsList}
        onRemoveFromWishlist={handleToggleWishlist}
        onToggleWishlist={handleToggleWishlist}
        onClearWishlist={() => setWishlistIds([])}
        onAddToCart={handleAddToCart}
        onMoveAllToCart={handleAddMultipleToCart}
        onQuickView={(p) => setQuickViewProduct(p)}
        onBrowseCatalog={() => scrollToSection('catalog-section')}
      />

      {/* Size Guide Calculator Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />

      {/* Newsletter Modal */}
      <NewsletterModal
        isOpen={isNewsletterOpen}
        onClose={() => setIsNewsletterOpen(false)}
      />

      {/* Visitor AI Concierge & Order Chatbot */}
      <ChatBotDrawer
        products={productsList}
        cartItems={cartItems}
        onAddToCart={handleAddToCart}
        onSelectProduct={(p) => setQuickViewProduct(p)}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
        onOpenOrderStatus={() => setIsOrderStatusOpen(true)}
      />
    </div>
  );
}
