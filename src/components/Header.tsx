import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  Sparkles, 
  Menu, 
  X, 
  ChevronDown, 
  Check,
  Globe,
  SlidersHorizontal,
  User,
  Truck,
  Package,
  Flame,
  Star,
  ArrowRight,
  Tag
} from 'lucide-react';
import { Product, CartItem } from '../types';

interface HeaderProps {
  cartItems: CartItem[];
  wishlistIds: string[];
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenStylist: () => void;
  onOpenOrderStatus?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartItems,
  wishlistIds,
  onOpenCart,
  onOpenWishlist,
  onOpenStylist,
  onOpenOrderStatus,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  currency,
  setCurrency,
  products,
  onSelectProduct,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isCartPopping, setIsCartPopping] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const prevCartCountRef = useRef<number>(0);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  // Trigger pop animation whenever items are added to cart
  useEffect(() => {
    if (cartCount > prevCartCountRef.current && prevCartCountRef.current !== 0) {
      setIsCartPopping(true);
      const timer = setTimeout(() => setIsCartPopping(false), 500);
      return () => clearTimeout(timer);
    }
    prevCartCountRef.current = cartCount;
  }, [cartCount]);

  const trimmedQuery = searchQuery.trim().toLowerCase();

  // Real-time matching products
  const searchResults = trimmedQuery
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(trimmedQuery) ||
          p.category.toLowerCase().includes(trimmedQuery) ||
          p.description.toLowerCase().includes(trimmedQuery) ||
          p.tags?.some((t) => t.toLowerCase().includes(trimmedQuery))
      )
    : [];

  // Matching categories derived from catalog
  const matchedCategories = trimmedQuery
    ? Array.from(
        new Set(
          products
            .filter((p) => p.category.toLowerCase().includes(trimmedQuery))
            .map((p) => p.category)
        )
      )
    : [];

  // Popular trending search suggestions
  const trendingSearches = [
    'Cashmere Coat',
    'Silk Blazer',
    'Trench',
    'Wool Suit',
    'Midi Dress',
    'Leather Boots',
  ];

  // Reset selected keyboard index when query changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchQuery]);

  // Handle keyboard navigation (Arrow keys, Enter, Escape)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsSearchOpen(false);
      setSearchQuery('');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (searchResults.length > 0) {
        setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (searchResults.length > 0) {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
      }
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
        e.preventDefault();
        onSelectProduct(searchResults[selectedIndex]);
        setIsSearchOpen(false);
      }
    }
  };

  const currencies = [
    { code: 'USD', symbol: '$', rate: 1, label: 'USD ($)' },
    { code: 'EUR', symbol: '€', rate: 0.92, label: 'EUR (€)' },
    { code: 'GBP', symbol: '£', rate: 0.78, label: 'GBP (£)' },
    { code: 'JPY', symbol: '¥', rate: 155, label: 'JPY (¥)' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-neutral-900/95 backdrop-blur-md text-neutral-100 border-b border-neutral-800 transition-all">
      {/* Announcement Top Bar */}
      <div id="announcement-bar" className="bg-neutral-950 text-neutral-400 text-xs py-2 px-4 border-b border-neutral-800/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden sm:flex items-center space-x-6">
            <span className="flex items-center gap-1.5 text-amber-200/90 font-medium tracking-wide">
              <Sparkles className="w-3.5 h-3.5" /> Compliments of ÉLAN: Free Express Shipping over $200
            </span>
            <span className="text-neutral-500">|</span>
            <span className="hover:text-neutral-200 cursor-pointer transition-colors">
              Worldwide Returns & Exchanges
            </span>
          </div>

          <div className="text-center sm:text-right w-full sm:w-auto flex items-center justify-between sm:justify-end gap-4">
            <button
              id="ai-stylist-top-banner"
              onClick={onOpenStylist}
              className="text-amber-300 hover:text-amber-100 font-medium tracking-wider flex items-center gap-1 transition-colors text-xs"
            >
              <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
              <span>AI Fashion Assistant</span>
            </button>

            {/* Currency Picker */}
            <div className="relative">
              <button
                id="currency-selector-btn"
                onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                className="flex items-center gap-1 text-neutral-400 hover:text-neutral-200 transition-colors uppercase font-mono text-[11px]"
              >
                <Globe className="w-3 h-3 text-neutral-500" />
                <span>{currency}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {isCurrencyDropdownOpen && (
                <div id="currency-dropdown" className="absolute right-0 mt-1 w-32 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl py-1 text-xs z-50">
                  {currencies.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        setCurrency(c.code);
                        setIsCurrencyDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 flex items-center justify-between text-neutral-300 hover:text-white"
                    >
                      <span>{c.label}</span>
                      {currency === c.code && <Check className="w-3 h-3 text-amber-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Mobile Menu & Nav Links */}
          <div className="flex items-center gap-8">
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-neutral-300 hover:text-white p-1"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Navigation Tabs */}
            <nav className="hidden lg:flex items-center space-x-8 text-sm font-light tracking-widest uppercase">
              {[
                { id: 'all', label: 'Shop All' },
                { id: 'women', label: 'Women' },
                { id: 'men', label: 'Men' },
                { id: 'lookbook', label: 'Lookbook Editorial' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative py-1 transition-colors ${
                    activeTab === tab.id
                      ? 'text-white font-normal'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Center Brand Logo */}
          <div className="text-center cursor-pointer group" onClick={() => setActiveTab('all')}>
            <h1 className="text-2xl sm:text-3xl font-serif tracking-[0.25em] font-light text-white uppercase group-hover:text-amber-100 transition-colors">
              ÉLAN
            </h1>
            <p className="text-[9px] font-mono tracking-[0.3em] text-neutral-500 uppercase -mt-1">
              PARIS • TOKYO
            </p>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-5">
            {/* Search Trigger */}
            <button
              id="search-toggle-btn"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-neutral-300 hover:text-white p-2 rounded-full hover:bg-neutral-800/60 transition-all relative"
              title="Search Catalog"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* AI Stylist Button */}
            <button
              id="header-ai-stylist-btn"
              onClick={onOpenStylist}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-400/10 text-amber-300 border border-amber-400/30 rounded-full hover:bg-amber-400/20 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="tracking-wider">AI STYLIST</span>
            </button>

            {/* Order Tracking Dashboard Button */}
            {onOpenOrderStatus && (
              <button
                id="order-status-header-btn"
                onClick={onOpenOrderStatus}
                className="text-neutral-300 hover:text-white p-2 rounded-full hover:bg-neutral-800/60 transition-all relative flex items-center gap-1"
                title="Track Orders & Shipping"
              >
                <Truck className="w-5 h-5 text-amber-300" />
                <span className="hidden xl:inline text-xs font-mono text-neutral-300 uppercase">Orders</span>
              </button>
            )}

            {/* Wishlist Button */}
            <button
              id="wishlist-btn"
              onClick={onOpenWishlist}
              className="text-neutral-300 hover:text-white p-2 rounded-full hover:bg-neutral-800/60 transition-all relative"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-neutral-950 font-bold text-[10px] rounded-full flex items-center justify-center">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            {/* Cart Drawer Trigger */}
            <button
              id="cart-btn"
              onClick={onOpenCart}
              className={`flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-3.5 py-2 rounded-full transition-all duration-300 border border-neutral-700/80 shadow-inner group relative ${
                isCartPopping
                  ? 'scale-110 ring-2 ring-amber-400/80 bg-neutral-750 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                  : ''
              }`}
            >
              <ShoppingBag
                className={`w-4 h-4 text-amber-300 transition-transform duration-300 ${
                  isCartPopping ? 'scale-125 text-amber-400 -rotate-12' : 'group-hover:scale-110'
                }`}
              />
              <span
                className={`text-xs font-mono font-medium transition-all duration-300 ${
                  isCartPopping ? 'scale-125 text-amber-300 font-bold' : ''
                }`}
              >
                {cartCount}
              </span>
              {cartSubtotal > 0 && (
                <span className="hidden md:inline text-xs font-light text-neutral-400 border-l border-neutral-600 pl-2">
                  ${cartSubtotal}
                </span>
              )}
              {isCartPopping && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping opacity-75 pointer-events-none" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Instant Search Drawer */}
      {isSearchOpen && (
        <div id="search-bar-drawer" className="bg-neutral-900 border-b border-neutral-800 px-4 py-4 transition-all animate-fadeIn">
          <div className="max-w-3xl mx-auto relative">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-amber-400" />
              <input
                ref={searchInputRef}
                id="header-search-input"
                type="text"
                placeholder="Type to search cashmere, wool coats, silk dresses, tailoring..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                className="w-full bg-neutral-950 text-white placeholder-neutral-500 pl-12 pr-12 py-3 rounded-xl border border-neutral-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none text-sm font-mono transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 text-neutral-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* REAL-TIME AUTO-SUGGEST DROPDOWN */}
            <div
              id="search-live-results"
              className="mt-3 bg-neutral-950/95 backdrop-blur-md border border-neutral-800 rounded-2xl p-4 max-h-[75vh] overflow-y-auto space-y-4 shadow-2xl custom-scrollbar"
            >
              {/* Top Quick Category & Trending Chips */}
              {searchQuery.trim() === '' ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Popular Search Suggestions</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => setSearchQuery(term)}
                        className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-amber-300 text-xs font-mono rounded-xl transition-all flex items-center gap-1.5"
                      >
                        <Search className="w-3 h-3 text-neutral-500" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {/* Category Matches */}
                  {matchedCategories.length > 0 && (
                    <div className="space-y-2 border-b border-neutral-800/80 pb-3">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                        <Tag className="w-3 h-3 text-amber-400" />
                        <span>Matching Categories ({matchedCategories.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {matchedCategories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setSearchQuery(cat)}
                            className="px-2.5 py-1 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-mono rounded-lg transition-all capitalize flex items-center gap-1"
                          >
                            <span>{cat}</span>
                            <ArrowRight className="w-3 h-3 text-amber-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Header Count & Keyboard Instructions */}
                  <div className="flex items-center justify-between text-xs font-mono text-neutral-400 border-b border-neutral-800/60 pb-2">
                    <span>Matching Products ({searchResults.length})</span>
                    <span className="text-[10px] text-neutral-500 hidden sm:inline">
                      Use ↑ ↓ arrow keys to navigate • Enter to select
                    </span>
                  </div>

                  {/* Product Suggestions List */}
                  {searchResults.length === 0 ? (
                    <div className="py-8 text-center space-y-2">
                      <p className="text-sm font-serif text-neutral-400">
                        No garments found matching "<span className="text-white">{searchQuery}</span>"
                      </p>
                      <p className="text-xs font-mono text-neutral-500">
                        Try searching for cashmere, wool, blazer, outerwear, or coat.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {searchResults.map((product, idx) => {
                        const isSelected = selectedIndex === idx;
                        const originalPrice = product.originalPrice;
                        const hasDiscount = originalPrice && originalPrice > product.price;

                        return (
                          <div
                            key={product.id}
                            onClick={() => {
                              onSelectProduct(product);
                              setIsSearchOpen(false);
                            }}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                              isSelected
                                ? 'bg-neutral-900 border-amber-400/60 shadow-lg ring-1 ring-amber-400/30'
                                : 'bg-neutral-950/60 border-neutral-850 hover:bg-neutral-900/80 hover:border-neutral-750'
                            }`}
                          >
                            {/* Product Thumbnail */}
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              referrerPolicy="no-referrer"
                              className="w-14 h-16 object-cover rounded-xl bg-neutral-900 border border-neutral-800 shrink-0"
                            />

                            {/* Info */}
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <h4
                                  className={`text-sm font-serif font-semibold truncate ${
                                    isSelected ? 'text-amber-300' : 'text-white'
                                  }`}
                                >
                                  {product.name}
                                </h4>
                                {product.isNew && (
                                  <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold uppercase">
                                    NEW
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
                                <span className="capitalize">{product.category}</span>
                                <span>•</span>
                                <span className="capitalize">{product.gender}</span>
                                {product.rating > 0 && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1 text-amber-300">
                                      <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                                      <span>{product.rating}</span>
                                    </span>
                                  </>
                                )}
                              </div>

                              {/* Stock status tag */}
                              {product.stockCount !== undefined && product.stockCount <= 5 && product.stockCount > 0 && (
                                <div className="flex items-center gap-1 text-[10px] font-mono text-amber-300">
                                  <Flame className="w-3 h-3 text-rose-400" />
                                  <span>Only {product.stockCount} left in stock</span>
                                </div>
                              )}
                            </div>

                            {/* Price & Action */}
                            <div className="text-right shrink-0 space-y-1">
                              <div className="text-sm font-mono font-bold text-amber-300">
                                ${product.price}
                              </div>
                              {hasDiscount && (
                                <div className="text-[10px] font-mono text-neutral-500 line-through">
                                  ${originalPrice}
                                </div>
                              )}
                              <span className="text-[10px] font-mono text-neutral-400 block hover:underline">
                                Quick View →
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div id="mobile-nav-drawer" className="lg:hidden bg-neutral-900 border-b border-neutral-800 px-6 py-6 space-y-4">
          <div className="flex flex-col space-y-3 font-light tracking-widest text-sm uppercase">
            {[
              { id: 'all', label: 'Shop All Catalog' },
              { id: 'women', label: "Women's Collection" },
              { id: 'men', label: "Men's Collection" },
              { id: 'lookbook', label: 'Editorial Lookbook' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`text-left py-2 border-b border-neutral-800/80 ${
                  activeTab === tab.id ? 'text-amber-300 font-normal' : 'text-neutral-300'
                }`}
              >
                {tab.label}
              </button>
            ))}

            <button
              onClick={() => {
                onOpenStylist();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-between text-amber-300 py-3 bg-amber-400/10 px-4 rounded-xl border border-amber-400/20 text-xs font-medium"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Launch AI Style Assistant
              </span>
              <span className="font-mono text-[10px] bg-amber-400/20 px-2 py-0.5 rounded">NEW</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
