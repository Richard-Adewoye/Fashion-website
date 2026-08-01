import React from 'react';
import { ArrowLeftRight, X, Scale, Trash2 } from 'lucide-react';
import { Product } from '../types';

interface CompareStickyTrayProps {
  compareIds: string[];
  products: Product[];
  onOpenCompareModal: () => void;
  onRemoveFromCompare: (productId: string) => void;
  onClearCompare: () => void;
}

export const CompareStickyTray: React.FC<CompareStickyTrayProps> = ({
  compareIds,
  products,
  onOpenCompareModal,
  onRemoveFromCompare,
  onClearCompare,
}) => {
  if (compareIds.length === 0) return null;

  const comparedProducts = products.filter((p) => compareIds.includes(p.id));

  return (
    <div
      id="compare-sticky-tray"
      className="fixed bottom-6 left-6 z-40 bg-neutral-900/95 border border-amber-400/50 rounded-2xl p-3 shadow-2xl backdrop-blur-md text-white flex items-center gap-4 max-w-[calc(100vw-3rem)] sm:max-w-lg transition-all duration-300"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
          <Scale className="w-4 h-4" />
        </div>

        <div className="hidden sm:block">
          <span className="block text-[10px] font-mono text-amber-300 uppercase tracking-wider font-semibold">
            Garment Comparison
          </span>
          <span className="block text-xs font-serif text-white">
            {comparedProducts.length} {comparedProducts.length === 1 ? 'Item' : 'Items'} Selected
          </span>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-[180px] sm:max-w-[220px]">
        {comparedProducts.map((p) => (
          <div key={p.id} className="relative group shrink-0">
            <img
              src={p.images[0]}
              alt={p.name}
              referrerPolicy="no-referrer"
              className="w-10 h-12 object-cover rounded-lg border border-neutral-800 bg-neutral-950"
            />
            <button
              onClick={() => onRemoveFromCompare(p.id)}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-neutral-800 hover:bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px] transition-colors"
              title="Remove"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenCompareModal}
          className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Compare ({comparedProducts.length})</span>
        </button>

        <button
          onClick={onClearCompare}
          className="p-2 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded-xl"
          title="Clear Compare"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
