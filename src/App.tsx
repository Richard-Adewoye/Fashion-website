import React, { useState, useEffect } from 'react';
import { PRODUCTS } from './data/products';
import { Product, CartItem, FilterState, ProductColor, ProductReview, PriceDropAlert, PriceDropNotification } from './types';
import {
  getSavedPriceDropAlerts,
  savePriceDropAlerts,
  getSavedPriceDropNotifications,
  savePriceDropNotifications,
} from './data/priceTracker';
import { PriceDropNotificationToast } from './components/PriceDropNotificationToast';
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
import { LoyaltyProgramModal } from './components/LoyaltyProgramModal';
import { Footer } from './components/Footer';
import {
  detectBrowserCurrency,
  detectCurrencyFromCoordinates,
  CURRENCIES,
  STORAGE_KEY_CURRENCY,
  STORAGE_KEY_MANUAL_OVERRIDE,
} from './data/currency';
import { CurrencyGeoBanner } from './components/CurrencyGeoBanner';

export default function App() {
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);
  const [priceDropAlerts, setPriceDropAlerts] = useState<PriceDropAlert[]>(getSavedPriceDropAlerts);
  const [priceDropNotifications, setPriceDropNotifications] = useState<PriceDropNotification[]>(getSavedPriceDropNotifications);
  const [activeToasts, setActiveToasts] = useState<PriceDropNotification[]>([]);

  // Geolocation-based Currency Detection
  const [currency, setCurrency] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENCY);
      if (saved && CURRENCIES[saved]) return saved;
      // Auto-detect on first visit
      const detected = detectBrowserCurrency();
      return detected.currencyCode;
    } catch {
      return 'USD';
    }
  });

  const [detectedRegion, setDetectedRegion] = useState<string | null>(() => {
    try {
      const detected = detectBrowserCurrency();
      return detected.regionName;
    } catch {
      return null;
    }
  });

  const [geoDetectionMethod, setGeoDetectionMethod] = useState<string>('browser timezone & locale');
  const [isGeoBannerOpen, setIsGeoBannerOpen] = useState<boolean>(() => {
    try {
      const dismissed = localStorage.getItem('elan_geo_banner_dismissed');
      const manual = localStorage.getItem(STORAGE_KEY_MANUAL_OVERRIDE);
      // Show on first visit when auto-detected and not manually overridden
      return !dismissed && !manual;
    } catch {
      return false;
    }
  });

  // Run initial geolocation check if no manual override is saved
  useEffect(() => {
    try {
      const manualOverride = localStorage.getItem(STORAGE_KEY_MANUAL_OVERRIDE);
      if (!manualOverride) {
        const detected = detectBrowserCurrency();
        setCurrency(detected.currencyCode);
        setDetectedRegion(detected.regionName);
        setGeoDetectionMethod(detected.method === 'timezone' ? 'time zone' : 'browser language');
        localStorage.setItem(STORAGE_KEY_CURRENCY, detected.currencyCode);
      }
    } catch (err) {
      console.warn('Geolocation currency check failed', err);
    }
  }, []);

  const handleSelectCurrency = (newCode: string) => {
    setCurrency(newCode);
    try {
      localStorage.setItem(STORAGE_KEY_CURRENCY, newCode);
      localStorage.setItem(STORAGE_KEY_MANUAL_OVERRIDE, 'true');
    } catch (err) {
      console.warn(err);
    }
    setIsGeoBannerOpen(false);
  };

  const handleDismissGeoBanner = () => {
    setIsGeoBannerOpen(false);
    try {
      localStorage.setItem('elan_geo_banner_dismissed', 'true');
    } catch (err) {
      console.warn(err);
    }
  };

  const handleTriggerGpsCheck = () => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const result = detectCurrencyFromCoordinates(latitude, longitude);
          setCurrency(result.currencyCode);
          setDetectedRegion(result.regionName);
          setGeoDetectionMethod('GPS coordinates');
          try {
            localStorage.setItem(STORAGE_KEY_CURRENCY, result.currencyCode);
          } catch (err) {
            console.warn(err);
          }
          setIsGeoBannerOpen(true);
        },
        (error) => {
          console.warn('GPS geolocation permission denied or unavailable', error);
        },
        { timeout: 7000 }
      );
    }
  };

  // Persist Price Drop alerts & notifications
  useEffect(() => {
    savePriceDropAlerts(priceDropAlerts);
  }, [priceDropAlerts]);

  useEffect(() => {
    savePriceDropNotifications(priceDropNotifications);
  }, [priceDropNotifications]);
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

  // Drawers & Modals Visibility State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isStylistOpen, setIsStylistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);
  const [isOrderStatusOpen, setIsOrderStatusOpen] = useState(false);
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(false);
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

  // Price Drop Operations
  const handleTogglePriceDropAlert = (productId: string) => {
    const product = productsList.find((p) => p.id === productId);
    if (!product) return;

    setPriceDropAlerts((prev) => {
      const existing = prev.find((a) => a.productId === productId);
      if (existing) {
        return prev.map((a) => (a.productId === productId ? { ...a, active: !a.active } : a));
      } else {
        const newAlert: PriceDropAlert = {
          productId,
          productName: product.name,
          initialPrice: product.price,
          trackedAt: new Date().toISOString(),
          active: true,
        };
        return [...prev, newAlert];
      }
    });
  };

  const handleSimulatePriceDrop = (targetProductId?: string) => {
    // Target given product or first wishlisted or first catalog piece
    const targetId = targetProductId || wishlistIds[0] || productsList[0]?.id;
    if (!targetId) return;

    const targetProduct = productsList.find((p) => p.id === targetId);
    if (!targetProduct) return;

    // Calculate markdown (15-20% drop, minimum $25)
    const dropAmount = Math.max(25, Math.round(targetProduct.price * 0.18));
    const newPrice = Math.max(49, targetProduct.price - dropAmount);
    const oldPrice = targetProduct.price;
    const savings = oldPrice - newPrice;
    const percentDrop = Math.round((savings / oldPrice) * 100);

    // 1. Update product in state
    setProductsList((prev) =>
      prev.map((p) =>
        p.id === targetId
          ? { ...p, price: newPrice, originalPrice: p.originalPrice || oldPrice }
          : p
      )
    );

    // 2. Ensure price drop alert exists and is armed
    setPriceDropAlerts((prev) => {
      const existing = prev.find((a) => a.productId === targetId);
      if (existing) {
        return prev.map((a) => (a.productId === targetId ? { ...a, active: true } : a));
      }
      return [
        ...prev,
        {
          productId: targetId,
          productName: targetProduct.name,
          initialPrice: oldPrice,
          trackedAt: new Date().toISOString(),
          active: true,
        },
      ];
    });

    // 3. Trigger in-app notification & toast
    const newNotif: PriceDropNotification = {
      id: `pdrop-${Date.now()}`,
      productId: targetId,
      productName: targetProduct.name,
      productImage: targetProduct.images[0],
      oldPrice,
      newPrice,
      savings,
      percentDrop,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setPriceDropNotifications((prev) => [newNotif, ...prev.filter((n) => n.productId !== targetId)]);
    setActiveToasts((prev) => [newNotif, ...prev.filter((t) => t.id !== newNotif.id)]);
  };

  const handleResetPrices = () => {
    setProductsList(PRODUCTS);
  };

  const handleDismissToast = (id: string) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleDismissNotification = (id: string) => {
    setPriceDropNotifications((prev) => prev.filter((n) => n.id !== id));
    setActiveToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleClearAllNotifications = () => {
    setPriceDropNotifications([]);
    setActiveToasts([]);
  };

  // Quota Exceeded State for Google Maps Demo Key
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuotaExceeded = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans antialiased selection:bg-amber-400 selection:text-neutral-950">
      {/* In-App Quota Defense Banner */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}
      {/* Geolocation Currency Welcome Banner */}
      <CurrencyGeoBanner
        isVisible={isGeoBannerOpen && !!detectedRegion}
        detectedRegion={detectedRegion || 'Europe'}
        currencyCode={currency}
        detectionMethod={geoDetectionMethod}
        onConfirm={handleDismissGeoBanner}
        onOpenSelector={() => {
          const btn = document.getElementById('currency-selector-btn');
          if (btn) btn.click();
        }}
        onRequestGpsDetect={handleTriggerGpsCheck}
      />

      {/* Header */}
      <Header
        cartItems={cartItems}
        wishlistIds={wishlistIds}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenStylist={() => setIsStylistOpen(true)}
        onOpenOrderStatus={() => setIsOrderStatusOpen(true)}
        onOpenLoyaltyProgram={() => setIsLoyaltyOpen(true)}
        priceDropNotifications={priceDropNotifications}
        onDismissNotification={handleDismissNotification}
        onClearNotifications={handleClearAllNotifications}
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
        searchQuery={filterState.searchQuery}
        setSearchQuery={(q) => setFilterState((prev) => ({ ...prev, searchQuery: q }))}
        currency={currency}
        setCurrency={handleSelectCurrency}
        detectedRegion={detectedRegion}
        onTriggerGpsCheck={handleTriggerGpsCheck}
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
        currency={currency}
      />

      {/* Shoppable Editorial Lookbook */}
      <ShoppableLookbook
        products={productsList}
        onQuickView={(p) => setQuickViewProduct(p)}
        onAddToCart={handleAddToCart}
        currency={currency}
      />

      {/* Real-Time D3.js Trending Analytics */}
      <TrendingProductsSection
        products={productsList}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        onQuickView={(p) => setQuickViewProduct(p)}
        onAddToCart={handleAddToCart}
        currency={currency}
      />

      {/* Footer */}
      <Footer
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onOpenStylist={() => setIsStylistOpen(true)}
        onOpenNewsletter={() => setIsNewsletterOpen(true)}
        onOpenOrderStatus={() => setIsOrderStatusOpen(true)}
        onOpenLoyaltyProgram={() => setIsLoyaltyOpen(true)}
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
        priceDropAlerts={priceDropAlerts}
        onTogglePriceDropAlert={handleTogglePriceDropAlert}
        currency={currency}
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
        currency={currency}
      />

      {/* Multi-step Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        discountPercentage={discountPercentage}
        onClearCart={() => setCartItems([])}
        onOpenOrderStatus={() => setIsOrderStatusOpen(true)}
        currency={currency}
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
        priceDropAlerts={priceDropAlerts}
        onTogglePriceDropAlert={handleTogglePriceDropAlert}
        onSimulatePriceDrop={handleSimulatePriceDrop}
        onResetPrices={handleResetPrices}
        currency={currency}
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

      {/* Maison Élan Privilège Loyalty Program & Rewards Modal */}
      <LoyaltyProgramModal
        isOpen={isLoyaltyOpen}
        onClose={() => setIsLoyaltyOpen(false)}
        onApplyDiscount={(code, percentage) => {
          setAppliedDiscountCode(code);
          setDiscountPercentage(percentage);
        }}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Floating In-App Price Drop Alert Toasts */}
      <PriceDropNotificationToast
        notifications={activeToasts}
        onDismiss={handleDismissToast}
        onAddToCart={(prod, size, col) => handleAddToCart(prod, size, col, 1)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onQuickView={(p) => setQuickViewProduct(p)}
        products={productsList}
      />
    </div>
  );
}
