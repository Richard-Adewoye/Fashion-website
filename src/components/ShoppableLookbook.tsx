import React, { useState } from 'react';
import { LOOKBOOK_SLIDES } from '../data/lookbook';
import { Product, ProductColor } from '../types';
import { ShoppingBag, ChevronLeft, ChevronRight, Eye, Sparkles, Plus } from 'lucide-react';

interface ShoppableLookbookProps {
  products: Product[];
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: ProductColor) => void;
}

export const ShoppableLookbook: React.FC<ShoppableLookbookProps> = ({
  products,
  onQuickView,
  onAddToCart,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [activeHotspotProduct, setActiveHotspotProduct] = useState<Product | null>(null);

  const slide = LOOKBOOK_SLIDES[currentSlideIndex];

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % LOOKBOOK_SLIDES.length);
    setActiveHotspotProduct(null);
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + LOOKBOOK_SLIDES.length) % LOOKBOOK_SLIDES.length);
    setActiveHotspotProduct(null);
  };

  return (
    <section id="shoppable-lookbook-section" className="bg-neutral-950 py-16 border-t border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-300 uppercase tracking-widest mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Editorial</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif text-white tracking-wide">
              Shoppable Lookbook
            </h2>
            <p className="text-xs text-neutral-400 font-mono mt-1">
              Click glowing hotspots on models to view and purchase garment details directly.
            </p>
          </div>

          {/* Slide Navigation Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevSlide}
              className="p-3 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-white rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-mono text-neutral-400">
              0{currentSlideIndex + 1} / 0{LOOKBOOK_SLIDES.length}
            </span>
            <button
              onClick={handleNextSlide}
              className="p-3 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-white rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Editorial Image Canvas */}
        <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl">
          <img
            src={slide.image}
            alt={slide.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/20" />

          {/* Interactive Hotspots */}
          {slide.hotspots.map((spot, idx) => {
            const product = products.find((p) => p.id === spot.productId);
            if (!product) return null;

            return (
              <div
                key={idx}
                className="absolute z-20"
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              >
                <button
                  onClick={() => setActiveHotspotProduct(product)}
                  className="relative group p-2.5 bg-amber-400 text-neutral-950 rounded-full shadow-2xl hover:scale-125 transition-transform animate-pulse"
                  title={`Shop ${product.name}`}
                >
                  <Plus className="w-4 h-4 font-bold" />
                  <span className="absolute -inset-1 bg-amber-400/40 rounded-full animate-ping pointer-events-none" />
                </button>
              </div>
            );
          })}

          {/* Slide Title overlay */}
          <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-xl space-y-1">
              <span className="text-xs font-mono text-amber-300 uppercase tracking-widest">{slide.season}</span>
              <h3 className="text-2xl sm:text-3xl font-serif text-white">{slide.title}</h3>
              <p className="text-xs text-neutral-300 font-light hidden sm:block">{slide.description}</p>
            </div>
          </div>
        </div>

        {/* Hotspot Floating Product Drawer Preview */}
        {activeHotspotProduct && (
          <div id="hotspot-product-preview" className="bg-neutral-900 border border-amber-400/40 rounded-2xl p-4 flex items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-4">
              <img
                src={activeHotspotProduct.images[0]}
                alt={activeHotspotProduct.name}
                referrerPolicy="no-referrer"
                className="w-16 h-20 object-cover rounded-xl bg-neutral-950"
              />
              <div>
                <span className="text-[10px] font-mono text-amber-300 uppercase">Lookbook Featured Item</span>
                <h4 className="text-sm font-medium text-white">{activeHotspotProduct.name}</h4>
                <p className="text-xs font-mono text-amber-300 font-semibold">${activeHotspotProduct.price}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onQuickView(activeHotspotProduct)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-mono rounded-xl border border-neutral-700 flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Details</span>
              </button>

              <button
                onClick={() =>
                  onAddToCart(
                    activeHotspotProduct,
                    activeHotspotProduct.sizes[0],
                    activeHotspotProduct.colors[0]
                  )
                }
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs uppercase rounded-xl flex items-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Quick Add</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
