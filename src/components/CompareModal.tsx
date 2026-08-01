import React, { useState } from 'react';
import { X, Scale, ShoppingBag, Trash2, Check, ArrowLeftRight, Sparkles, Star, Plus } from 'lucide-react';
import { Product, ProductColor } from '../types';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  compareIds: string[];
  products: Product[];
  onRemoveFromCompare: (productId: string) => void;
  onClearCompare: () => void;
  onAddToCart: (product: Product, size: string, color: ProductColor) => void;
  onSelectProduct: (product: Product) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  compareIds,
  products,
  onRemoveFromCompare,
  onClearCompare,
  onAddToCart,
  onSelectProduct,
}) => {
  if (!isOpen) return null;

  const comparedProducts = products.filter((p) => compareIds.includes(p.id));

  // Selected sizes/colors for quick adding inside compare modal
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [selectedColors, setSelectedColors] = useState<Record<string, ProductColor>>({});

  const getSizeForProduct = (p: Product) => selectedSizes[p.id] || p.sizes[0];
  const getColorForProduct = (p: Product) => selectedColors[p.id] || p.colors[0];

  const setSizeForProduct = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const setColorForProduct = (productId: string, color: ProductColor) => {
    setSelectedColors((prev) => ({ ...prev, [productId]: color }));
  };

  return (
    <div
      id="compare-modal-overlay"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div
        id="compare-modal-card"
        className="w-full max-w-6xl bg-neutral-950 border border-neutral-800 rounded-3xl p-4 sm:p-8 text-white space-y-6 relative max-h-[92vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-serif uppercase tracking-wider text-white">
                  Side-by-Side Garment Comparison
                </h3>
                <span className="text-xs font-mono bg-neutral-800 text-amber-300 px-2.5 py-0.5 rounded-full border border-neutral-700">
                  {comparedProducts.length} / 4 Items
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono">
                Analyze fabric compositions, architectural cuts, pricing, and sizing details.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {comparedProducts.length > 0 && (
              <button
                onClick={onClearCompare}
                className="text-xs font-mono text-neutral-400 hover:text-rose-400 px-3 py-1.5 rounded-xl border border-neutral-800 hover:border-rose-900/50 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-900 border border-neutral-800 hover:bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Table Container */}
        {comparedProducts.length === 0 ? (
          <div className="text-center py-20 space-y-4 text-neutral-500">
            <ArrowLeftRight className="w-12 h-12 text-neutral-800 mx-auto animate-pulse" />
            <h4 className="text-lg font-serif text-neutral-300">No items selected for comparison</h4>
            <p className="text-xs font-mono text-neutral-500 max-w-sm mx-auto">
              Tap the scale/compare icon on any garment card in the collection to view technical specifications side-by-side.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-amber-300 transition-all"
            >
              Browse Atelier Catalog
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto overflow-y-auto space-y-6 pr-1 custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr>
                  <th className="w-44 p-3 text-xs font-mono uppercase text-neutral-500 bg-neutral-900/50 rounded-tl-xl border-b border-neutral-800">
                    Garment Specs
                  </th>
                  {comparedProducts.map((product) => (
                    <th
                      key={product.id}
                      className="p-3 bg-neutral-900/50 border-b border-neutral-800 text-center min-w-[200px] relative"
                    >
                      <button
                        onClick={() => onRemoveFromCompare(product.id)}
                        className="absolute top-2 right-2 p-1 text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 rounded-full transition-colors"
                        title="Remove from comparison"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div className="space-y-3 pt-2">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          onClick={() => {
                            onClose();
                            onSelectProduct(product);
                          }}
                          className="w-28 h-36 object-cover rounded-2xl mx-auto cursor-pointer hover:opacity-90 transition-opacity bg-neutral-950 border border-neutral-800 shadow-md"
                        />
                        <div>
                          <span className="text-[10px] font-mono uppercase text-amber-400 tracking-wider">
                            {product.gender} • {product.category}
                          </span>
                          <h4
                            onClick={() => {
                              onClose();
                              onSelectProduct(product);
                            }}
                            className="text-sm font-serif font-bold text-white hover:text-amber-300 cursor-pointer line-clamp-1"
                          >
                            {product.name}
                          </h4>
                          <p className="text-xs font-mono font-semibold text-amber-300 mt-0.5">
                            ${product.price}
                            {product.originalPrice && (
                              <span className="text-neutral-500 line-through text-[11px] ml-2">
                                ${product.originalPrice}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-800/60 text-xs">
                {/* Rating & Reviews */}
                <tr>
                  <td className="p-3 font-mono text-neutral-400 bg-neutral-900/20 font-semibold">
                    Client Rating
                  </td>
                  {comparedProducts.map((product) => (
                    <td key={product.id} className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-amber-400 font-mono font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{product.rating}</span>
                        <span className="text-neutral-500 text-[10px]">({product.reviewCount})</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Material Composition */}
                <tr>
                  <td className="p-3 font-mono text-neutral-400 bg-neutral-900/20 font-semibold">
                    Composition
                  </td>
                  {comparedProducts.map((product) => (
                    <td key={product.id} className="p-3 text-center font-serif text-neutral-200">
                      {product.composition}
                    </td>
                  ))}
                </tr>

                {/* Eco & Sustainability */}
                <tr>
                  <td className="p-3 font-mono text-neutral-400 bg-neutral-900/20 font-semibold">
                    Craft Standard
                  </td>
                  {comparedProducts.map((product) => (
                    <td key={product.id} className="p-3 text-center">
                      {product.isSustainable ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800/80 px-2.5 py-1 rounded-full">
                          <Sparkles className="w-3 h-3" /> Certified Eco-Craft
                        </span>
                      ) : (
                        <span className="text-neutral-500 font-mono text-[11px]">Standard Luxury</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Available Color Swatches */}
                <tr>
                  <td className="p-3 font-mono text-neutral-400 bg-neutral-900/20 font-semibold">
                    Color Swatches
                  </td>
                  {comparedProducts.map((product) => {
                    const activeColor = getColorForProduct(product);
                    return (
                      <td key={product.id} className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {product.colors.map((c) => (
                            <button
                              key={c.name}
                              onClick={() => setColorForProduct(product.id, c)}
                              className={`w-4 h-4 rounded-full border transition-all ${
                                activeColor.name === c.name
                                  ? 'border-amber-400 scale-125 ring-2 ring-amber-400/40'
                                  : 'border-neutral-700 opacity-70 hover:opacity-100'
                              }`}
                              style={{ backgroundColor: c.hex }}
                              title={c.name}
                            />
                          ))}
                        </div>
                        <span className="block text-[10px] font-mono text-neutral-400 mt-1">
                          {activeColor.name}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                {/* Size Matrix */}
                <tr>
                  <td className="p-3 font-mono text-neutral-400 bg-neutral-900/20 font-semibold">
                    Size Matrix
                  </td>
                  {comparedProducts.map((product) => {
                    const activeSize = getSizeForProduct(product);
                    return (
                      <td key={product.id} className="p-3 text-center">
                        <div className="flex flex-wrap justify-center gap-1">
                          {product.sizes.map((s) => (
                            <button
                              key={s}
                              onClick={() => setSizeForProduct(product.id, s)}
                              className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-colors ${
                                activeSize === s
                                  ? 'bg-amber-400 text-neutral-950 font-bold border-amber-400'
                                  : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Key Details */}
                <tr>
                  <td className="p-3 font-mono text-neutral-400 bg-neutral-900/20 font-semibold">
                    Atelier Details
                  </td>
                  {comparedProducts.map((product) => (
                    <td key={product.id} className="p-3 text-left">
                      <ul className="space-y-1 text-[11px] font-mono text-neutral-300 list-disc list-inside">
                        {product.details.map((detail, idx) => (
                          <li key={idx} className="line-clamp-2">{detail}</li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* Care Instructions */}
                <tr>
                  <td className="p-3 font-mono text-neutral-400 bg-neutral-900/20 font-semibold">
                    Garment Care
                  </td>
                  {comparedProducts.map((product) => (
                    <td key={product.id} className="p-3 text-center font-mono text-[11px] text-neutral-400">
                      {product.careInstructions}
                    </td>
                  ))}
                </tr>

                {/* Add to Bag Action Row */}
                <tr>
                  <td className="p-3 font-mono text-neutral-400 bg-neutral-900/20 font-semibold">
                    Order Action
                  </td>
                  {comparedProducts.map((product) => {
                    const activeSize = getSizeForProduct(product);
                    const activeColor = getColorForProduct(product);
                    return (
                      <td key={product.id} className="p-3 text-center">
                        <button
                          onClick={() => {
                            onAddToCart(product, activeSize, activeColor);
                          }}
                          className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> Move to Bag
                        </button>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
