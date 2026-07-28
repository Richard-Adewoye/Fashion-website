import React, { useState } from 'react';
import { X, Ruler, Sparkles } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [unit, setUnit] = useState<'cm' | 'inches'>('cm');
  const [chest, setChest] = useState<number>(90);
  const [waist, setWaist] = useState<number>(72);
  const [hips, setHips] = useState<number>(96);

  // Simple size calculation logic
  const calculateSize = (): string => {
    const val = unit === 'inches' ? chest * 2.54 : chest;
    if (val < 84) return 'XS (Atelier Size 34)';
    if (val < 92) return 'S (Atelier Size 36)';
    if (val < 100) return 'M (Atelier Size 38)';
    if (val < 108) return 'L (Atelier Size 40)';
    return 'XL (Atelier Size 42)';
  };

  return (
    <div id="sizeguide-modal-overlay" className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        id="sizeguide-modal-card"
        className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 text-white space-y-6 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-950 border border-neutral-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Ruler className="w-5 h-5 text-amber-400" />
          <h3 className="text-xl font-serif uppercase tracking-wider">Atelier Fit Calculator</h3>
        </div>

        {/* Interactive Fit Calculator */}
        <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 space-y-4">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-amber-300 uppercase">Input Body Measurements:</span>
            <div className="flex bg-neutral-900 border border-neutral-800 rounded-lg p-0.5">
              <button
                onClick={() => setUnit('cm')}
                className={`px-3 py-1 rounded-md ${unit === 'cm' ? 'bg-amber-400 text-neutral-950 font-bold' : 'text-neutral-400'}`}
              >
                Centimeters (cm)
              </button>
              <button
                onClick={() => setUnit('inches')}
                className={`px-3 py-1 rounded-md ${unit === 'inches' ? 'bg-amber-400 text-neutral-950 font-bold' : 'text-neutral-400'}`}
              >
                Inches (in)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <label className="block text-neutral-400 mb-1">Chest / Bust ({unit})</label>
              <input
                type="number"
                value={chest}
                onChange={(e) => setChest(Number(e.target.value))}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">Natural Waist ({unit})</label>
              <input
                type="number"
                value={waist}
                onChange={(e) => setWaist(Number(e.target.value))}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">Full Hips ({unit})</label>
              <input
                type="number"
                value={hips}
                onChange={(e) => setHips(Number(e.target.value))}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Result Output */}
          <div className="p-4 bg-amber-400/10 border border-amber-400/30 rounded-xl text-center space-y-1">
            <span className="text-[10px] font-mono uppercase text-amber-300">Recommended Size</span>
            <p className="text-xl font-serif font-bold text-white">{calculateSize()}</p>
            <p className="text-[11px] text-neutral-400 font-mono">
              Designed for a relaxed, architectural fit. Choose one size down for a slim tailored contour.
            </p>
          </div>
        </div>

        {/* Standard Measurement Matrix */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono uppercase text-neutral-400">Standard Conversion Matrix</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-amber-300">
                  <th className="py-2 px-3">Size</th>
                  <th className="py-2 px-3">Bust/Chest (cm)</th>
                  <th className="py-2 px-3">Waist (cm)</th>
                  <th className="py-2 px-3">Hips (cm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                <tr><td className="py-2 px-3 font-bold text-white">XS</td><td>80-84</td><td>64-68</td><td>88-92</td></tr>
                <tr><td className="py-2 px-3 font-bold text-white">S</td><td>85-89</td><td>69-73</td><td>93-97</td></tr>
                <tr><td className="py-2 px-3 font-bold text-white">M</td><td>90-95</td><td>74-79</td><td>98-103</td></tr>
                <tr><td className="py-2 px-3 font-bold text-white">L</td><td>96-102</td><td>80-86</td><td>104-110</td></tr>
                <tr><td className="py-2 px-3 font-bold text-white">XL</td><td>103-110</td><td>87-94</td><td>111-118</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
