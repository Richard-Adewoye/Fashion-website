import React, { useState } from 'react';
import { Product, FilterState, ProductCategory, GenderCategory, ProductColor } from '../types';
import { ProductCard } from './ProductCard';
import { SlidersHorizontal, Grid3X3, Grid2X2, List, X, RotateCcw, ChevronDown } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: ProductColor) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  filterState,
  setFilterState,
  wishlistIds,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
}) => {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [gridCols, setGridCols] = useState<'4' | '3' | '1'>('4');

  const categories: { id: ProductCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Items' },
    { id: 'tops', label: 'Tops' },
    { id: 'bottoms', label: 'Bottoms' },
    { id: 'dresses', label: 'Dresses' },
    { id: 'outerwear', label: 'Outerwear' },
    { id: 'knitwear', label: 'Knitwear' },
    { id: 'tailoring', label: 'Tailoring' },
    { id: 'footwear', label: 'Footwear' },
    { id: 'bags', label: 'Bags' },
    { id: 'accessories', label: 'Accessories' },
  ];

  const genders: { id: GenderCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Gender' },
    { id: 'women', label: "Women's" },
    { id: 'men', label: "Men's" },
    { id: 'unisex', label: 'Unisex' },
  ];

  const availableColors: { name: string; hex: string }[] = [
    { name: 'Noir', hex: '#1C1C1C' },
    { name: 'Camel', hex: '#C19A6B' },
    { name: 'Ecru', hex: '#F5F2EB' },
    { name: 'Oatmeal', hex: '#D2C2B0' },
    { name: 'Charcoal', hex: '#36454F' },
    { name: 'Cognac', hex: '#9A463D' },
    { name: 'Olive', hex: '#556B2F' },
    { name: 'Navy', hex: '#000080' },
    { name: 'Chalk White', hex: '#F0F0F0' },
    { name: 'Indigo', hex: '#283250' },
  ];

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '37', '38', '39', '40', '41', '42', '43', '44', 'One Size'];

  // Filter Application
  const filteredProducts = products.filter((product) => {
    // Category match
    if (filterState.category !== 'all' && product.category !== filterState.category) {
      return false;
    }
    // Gender match
    if (filterState.gender !== 'all' && product.gender !== filterState.gender && product.gender !== 'unisex') {
      return false;
    }
    // Price range
    if (product.price < filterState.priceRange[0] || product.price > filterState.priceRange[1]) {
      return false;
    }
    // Colors filter
    if (
      filterState.colors.length > 0 &&
      !product.colors.some((c) => filterState.colors.includes(c.name))
    ) {
      return false;
    }
    // Sizes filter
    if (
      filterState.sizes.length > 0 &&
      !product.sizes.some((s) => filterState.sizes.includes(s))
    ) {
      return false;
    }
    // Sale
    if (filterState.onlySale && !product.originalPrice) {
      return false;
    }
    // Sustainable
    if (filterState.onlySustainable && !product.isSustainable) {
      return false;
    }
    // Search query
    if (filterState.searchQuery) {
      const q = filterState.searchQuery.toLowerCase();
      const match =
        product.name.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Sort Application
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filterState.sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
      case 'featured':
      default:
        return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
    }
  });

  const activeFilterCount =
    (filterState.category !== 'all' ? 1 : 0) +
    (filterState.gender !== 'all' ? 1 : 0) +
    filterState.colors.length +
    filterState.sizes.length +
    (filterState.onlySale ? 1 : 0) +
    (filterState.onlySustainable ? 1 : 0);

  const resetFilters = () => {
    setFilterState({
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
  };

  return (
    <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Category Pills Header */}
      <div className="flex flex-col gap-6 mb-8 border-b border-neutral-800 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-wide">
              The Seasonal Collection
            </h2>
            <p className="text-xs text-neutral-400 font-mono uppercase tracking-wider mt-1">
              Showing {sortedProducts.length} curated luxury pieces
            </p>
          </div>

          {/* Gender Selector Tabs */}
          <div className="flex items-center bg-neutral-900 border border-neutral-800 p-1 rounded-full">
            {genders.map((g) => (
              <button
                key={g.id}
                onClick={() => setFilterState((prev) => ({ ...prev, gender: g.id }))}
                className={`px-4 py-1.5 text-xs font-mono uppercase rounded-full transition-all ${
                  filterState.gender === g.id
                    ? 'bg-amber-400 text-neutral-950 font-bold shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Horizontal Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterState((prev) => ({ ...prev, category: cat.id }))}
              className={`px-4 py-2 text-xs font-mono uppercase rounded-xl whitespace-nowrap transition-all border ${
                filterState.category === cat.id
                  ? 'bg-neutral-100 text-neutral-950 font-bold border-white'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Control Bar & View Mode */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800">
        {/* Left: Filter Toggle Button */}
        <button
          id="filter-toggle-btn"
          onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium uppercase tracking-wider transition-all border ${
            isFilterPanelOpen || activeFilterCount > 0
              ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
              : 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:bg-neutral-800'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 text-amber-400" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 bg-amber-400 text-neutral-950 text-[10px] font-bold rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Center: Active Filter Tags */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto py-1">
            {filterState.category !== 'all' && (
              <span className="inline-flex items-center gap-1 text-xs font-mono bg-neutral-800 text-amber-200 px-3 py-1 rounded-full border border-neutral-700 uppercase">
                Category: {filterState.category}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-white"
                  onClick={() => setFilterState((prev) => ({ ...prev, category: 'all' }))}
                />
              </span>
            )}
            {filterState.colors.map((col) => (
              <span key={col} className="inline-flex items-center gap-1 text-xs font-mono bg-neutral-800 text-amber-200 px-3 py-1 rounded-full border border-neutral-700">
                Color: {col}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-white"
                  onClick={() =>
                    setFilterState((prev) => ({
                      ...prev,
                      colors: prev.colors.filter((c) => c !== col),
                    }))
                  }
                />
              </span>
            ))}
            {filterState.sizes.map((sz) => (
              <span key={sz} className="inline-flex items-center gap-1 text-xs font-mono bg-neutral-800 text-amber-200 px-3 py-1 rounded-full border border-neutral-700">
                Size: {sz}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-white"
                  onClick={() =>
                    setFilterState((prev) => ({
                      ...prev,
                      sizes: prev.sizes.filter((s) => s !== sz),
                    }))
                  }
                />
              </span>
            ))}
            {(filterState.priceRange[0] > 0 || filterState.priceRange[1] < 600) && (
              <span className="inline-flex items-center gap-1 text-xs font-mono bg-neutral-800 text-amber-200 px-3 py-1 rounded-full border border-neutral-700">
                Price: ${filterState.priceRange[0]} - ${filterState.priceRange[1]}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-white"
                  onClick={() => setFilterState((prev) => ({ ...prev, priceRange: [0, 600] }))}
                />
              </span>
            )}
            {filterState.onlySale && (
              <span className="inline-flex items-center gap-1 text-xs font-mono bg-rose-950 text-rose-300 px-3 py-1 rounded-full border border-rose-800">
                On Sale
                <X
                  className="w-3 h-3 cursor-pointer hover:text-white"
                  onClick={() => setFilterState((prev) => ({ ...prev, onlySale: false }))}
                />
              </span>
            )}
            {filterState.onlySustainable && (
              <span className="inline-flex items-center gap-1 text-xs font-mono bg-emerald-950 text-emerald-300 px-3 py-1 rounded-full border border-emerald-800">
                Eco-Craft
                <X
                  className="w-3 h-3 cursor-pointer hover:text-white"
                  onClick={() => setFilterState((prev) => ({ ...prev, onlySustainable: false }))}
                />
              </span>
            )}
            <button
              onClick={resetFilters}
              className="text-xs text-neutral-400 hover:text-amber-300 font-mono underline flex items-center gap-1 ml-2"
            >
              <RotateCcw className="w-3 h-3" /> Reset All
            </button>
          </div>
        )}

        {/* Right: Sort Dropdown & Layout Buttons */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 font-mono uppercase hidden sm:inline">Sort:</span>
            <select
              id="sort-select"
              value={filterState.sortBy}
              onChange={(e) =>
                setFilterState((prev) => ({ ...prev, sortBy: e.target.value as any }))
              }
              className="bg-neutral-900 text-neutral-200 border border-neutral-700 rounded-xl px-3 py-2 text-xs focus:border-amber-400 focus:outline-none uppercase font-mono"
            >
              <option value="featured">Featured Collection</option>
              <option value="newest">New Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* Grid View Mode Toggles */}
          <div className="hidden sm:flex items-center bg-neutral-900 border border-neutral-800 rounded-xl p-1">
            <button
              onClick={() => setGridCols('4')}
              className={`p-1.5 rounded-lg transition-colors ${
                gridCols === '4' ? 'bg-neutral-800 text-amber-300' : 'text-neutral-500 hover:text-neutral-300'
              }`}
              title="4 Columns Grid"
            >
              <Grid2X2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setGridCols('3')}
              className={`p-1.5 rounded-lg transition-colors ${
                gridCols === '3' ? 'bg-neutral-800 text-amber-300' : 'text-neutral-500 hover:text-neutral-300'
              }`}
              title="3 Columns Grid"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Detailed Filter Drawer */}
      {isFilterPanelOpen && (
        <div id="filter-drawer-panel" className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mb-8 space-y-6 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Category Filter inside Drawer */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase text-amber-300 tracking-wider">Category</h4>
              <select
                value={filterState.category}
                onChange={(e) =>
                  setFilterState((prev) => ({
                    ...prev,
                    category: e.target.value as ProductCategory | 'all',
                  }))
                }
                className="w-full bg-neutral-950 text-neutral-200 border border-neutral-800 rounded-xl px-3 py-2 text-xs focus:border-amber-400 focus:outline-none uppercase font-mono"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-mono uppercase text-amber-300 tracking-wider">Price Range</h4>
                <span className="text-xs font-mono text-amber-300">${filterState.priceRange[0]} - ${filterState.priceRange[1]}</span>
              </div>
              <div className="space-y-2 text-xs font-mono text-neutral-300">
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500 text-[10px]">Max:</span>
                  <input
                    type="range"
                    min="50"
                    max="600"
                    step="25"
                    value={filterState.priceRange[1]}
                    onChange={(e) =>
                      setFilterState((prev) => ({
                        ...prev,
                        priceRange: [prev.priceRange[0], parseInt(e.target.value)],
                      }))
                    }
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Sizes Filter */}
            <div className="space-y-2 md:col-span-2">
              <h4 className="text-xs font-mono uppercase text-amber-300 tracking-wider">Size Selection</h4>
              <div className="flex flex-wrap gap-1.5">
                {availableSizes.map((sz) => {
                  const isSelected = filterState.sizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      onClick={() => {
                        setFilterState((prev) => ({
                          ...prev,
                          sizes: isSelected
                            ? prev.sizes.filter((s) => s !== sz)
                            : [...prev.sizes, sz],
                        }));
                      }}
                      className={`px-3 py-1 text-xs font-mono rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-amber-400 text-neutral-950 font-bold border-amber-400'
                          : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t border-neutral-800/80">
            {/* Color Palette Filter */}
            <div className="space-y-2 md:col-span-3">
              <h4 className="text-xs font-mono uppercase text-amber-300 tracking-wider">Color Swatches</h4>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((col) => {
                  const isSelected = filterState.colors.includes(col.name);
                  return (
                    <button
                      key={col.name}
                      onClick={() => {
                        setFilterState((prev) => ({
                          ...prev,
                          colors: isSelected
                            ? prev.colors.filter((c) => c !== col.name)
                            : [...prev.colors, col.name],
                        }));
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-amber-400 text-neutral-950 font-bold border-amber-400'
                          : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/30 shrink-0"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span>{col.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Toggle Switches */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase text-amber-300 tracking-wider">Attributes</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterState.onlySale}
                    onChange={(e) =>
                      setFilterState((prev) => ({ ...prev, onlySale: e.target.checked }))
                    }
                    className="rounded bg-neutral-950 border-neutral-700 text-amber-400 focus:ring-0"
                  />
                  <span>Sale Items Only</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterState.onlySustainable}
                    onChange={(e) =>
                      setFilterState((prev) => ({ ...prev, onlySustainable: e.target.checked }))
                    }
                    className="rounded bg-neutral-950 border-neutral-700 text-amber-400 focus:ring-0"
                  />
                  <span>Eco-Craft & Sustainable</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Product Cards Grid */}
      {sortedProducts.length === 0 ? (
        <div id="no-products-state" className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-12 text-center my-8 space-y-4">
          <p className="text-lg font-serif text-neutral-300">No fashion items match your filter selection.</p>
          <p className="text-xs text-neutral-500 font-mono">Try adjusting price bounds, selected sizes, or category parameters.</p>
          <button
            onClick={resetFilters}
            className="px-6 py-2.5 bg-amber-400 text-neutral-950 font-medium text-xs tracking-wider uppercase rounded-full hover:bg-amber-300 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div
          id="products-grid-container"
          className={`grid gap-6 ${
            gridCols === '4'
              ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              : gridCols === '3'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          }`}
        >
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isWishlisted={wishlistIds.includes(product.id)}
              onToggleWishlist={onToggleWishlist}
              onQuickView={onQuickView}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </section>
  );
};
