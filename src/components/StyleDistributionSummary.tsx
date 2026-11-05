import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { Product, ProductStyle, FilterState } from '../types';
import { Sparkles, BarChart3, PieChart as PieIcon, Filter, Check, ChevronDown, ChevronUp, Layers } from 'lucide-react';

interface StyleDistributionSummaryProps {
  products: Product[];
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
}

interface StyleStat {
  name: ProductStyle;
  count: number;
  percentage: number;
  color: string;
  gradient: string;
  description: string;
  avgPrice: number;
}

const STYLE_METADATA: Record<ProductStyle, { color: string; gradient: string; description: string }> = {
  Minimalist: {
    color: '#FBBF24', // Amber 400
    gradient: 'from-amber-400 to-amber-600',
    description: 'Clean lines, neutral palette & pure architectural form',
  },
  Classic: {
    color: '#E2D4B7', // Champagne / Warm Ivory
    gradient: 'from-[#F3ECE0] to-[#C7B299]',
    description: 'Timeless sartorial tailoring, heritage silhouettes & enduring cuts',
  },
  Industrial: {
    color: '#94A3B8', // Slate / Steel
    gradient: 'from-slate-300 to-slate-500',
    description: 'Structured tailoring, utilitarian hardware & raw precision',
  },
  Bohemian: {
    color: '#F97316', // Terracotta / Warm Clay
    gradient: 'from-amber-500 to-rose-600',
    description: 'Eclectic artisanal textures, organic drape & relaxed energy',
  },
};

export const StyleDistributionSummary: React.FC<StyleDistributionSummaryProps> = ({
  products,
  filterState,
  setFilterState,
}) => {
  const [chartType, setChartType] = useState<'bar' | 'donut'>('bar');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [hoveredStyle, setHoveredStyle] = useState<string | null>(null);

  // Compute distribution data
  const styleStats: StyleStat[] = useMemo(() => {
    const counts: Record<string, { count: number; totalCost: number }> = {};
    const total = products.length;

    products.forEach((p) => {
      const styleKey = p.style || 'Classic';
      if (!counts[styleKey]) {
        counts[styleKey] = { count: 0, totalCost: 0 };
      }
      counts[styleKey].count += 1;
      counts[styleKey].totalCost += p.price;
    });

    const definedStyles: ProductStyle[] = ['Minimalist', 'Classic', 'Industrial', 'Bohemian'];
    const catalogStyles = Object.keys(counts) as ProductStyle[];
    const allStyles = [
      ...definedStyles.filter((s) => counts[s] !== undefined),
      ...catalogStyles.filter((s) => !definedStyles.includes(s)),
    ];

    return allStyles.map((style) => {
      const item = counts[style] || { count: 0, totalCost: 0 };
      const meta = STYLE_METADATA[style] || {
        color: '#D4AF37',
        gradient: 'from-amber-400 to-yellow-600',
        description: 'Curated aesthetic collection',
      };
      return {
        name: style,
        count: item.count,
        percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
        color: meta.color,
        gradient: meta.gradient,
        description: meta.description,
        avgPrice: item.count > 0 ? Math.round(item.totalCost / item.count) : 0,
      };
    });
  }, [products]);

  const dominantStyle = useMemo(() => {
    if (styleStats.length === 0) return null;
    return [...styleStats].sort((a, b) => b.count - a.count)[0];
  }, [styleStats]);

  const handleToggleStyle = (style: ProductStyle) => {
    setFilterState((prev) => {
      const exists = prev.styles.includes(style);
      return {
        ...prev,
        styles: exists ? prev.styles.filter((s) => s !== style) : [...prev.styles, style],
      };
    });
  };

  const isStyleFiltered = (style: ProductStyle) => filterState.styles.includes(style);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: StyleStat = payload[0].payload;
      return (
        <div className="bg-neutral-950/95 border border-amber-400/40 backdrop-blur-md rounded-xl p-3 shadow-2xl ring-1 ring-black/80 font-mono text-xs space-y-1.5 min-w-[200px]">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5">
            <span className="text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
              {data.name}
            </span>
            <span className="text-white font-bold">{data.count} items</span>
          </div>
          <div className="flex justify-between text-[11px] text-neutral-400 pt-0.5">
            <span>Catalog Share:</span>
            <span className="text-neutral-200 font-semibold">{data.percentage}%</span>
          </div>
          <div className="flex justify-between text-[11px] text-neutral-400">
            <span>Average Price:</span>
            <span className="text-amber-200 font-semibold">${data.avgPrice}</span>
          </div>
          <p className="text-[10px] text-neutral-400 italic pt-1 border-t border-neutral-800/80 line-clamp-2">
            {data.description}
          </p>
          <div className="text-[9px] text-amber-400/80 pt-1 text-right uppercase">
            Click to {filterState.styles.includes(data.name) ? 'remove filter' : 'filter catalog'}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section
      id="style-distribution-summary"
      aria-label="Style Distribution Summary"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4"
    >
      <div className="bg-neutral-900/70 border border-neutral-800 rounded-3xl p-6 sm:p-8 backdrop-blur-sm relative overflow-hidden transition-all duration-300 hover:border-neutral-700/80 shadow-xl">
        {/* Ambient Subtle Background Accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-400/10 text-amber-400 rounded-lg border border-amber-400/20">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="text-lg sm:text-xl font-serif text-white tracking-wide">
                Atelier Aesthetic Architecture
              </h3>
            </div>
            <p className="text-xs text-neutral-400 font-mono mt-1">
              Distribution of {products.length} luxury garments across signature aesthetic archetypes
            </p>
          </div>

          {/* Controls: Chart Type Toggle & Collapse */}
          <div className="flex items-center gap-2">
            {/* Chart Type Toggle */}
            <div className="flex items-center bg-neutral-950 border border-neutral-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setChartType('bar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase transition-all ${
                  chartType === 'bar'
                    ? 'bg-amber-400 text-neutral-950 font-bold shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Bar Chart View"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bars</span>
              </button>
              <button
                type="button"
                onClick={() => setChartType('donut')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase transition-all ${
                  chartType === 'donut'
                    ? 'bg-amber-400 text-neutral-950 font-bold shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Donut Chart View"
              >
                <PieIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Donut</span>
              </button>
            </div>

            {/* Quick Filter Reset if styles active */}
            {filterState.styles.length > 0 && (
              <button
                type="button"
                onClick={() => setFilterState((prev) => ({ ...prev, styles: [] }))}
                className="px-3 py-1.5 text-xs font-mono uppercase bg-neutral-950 text-amber-300 hover:text-white border border-amber-400/30 rounded-xl transition-colors flex items-center gap-1"
              >
                <Filter className="w-3 h-3" />
                <span>Reset ({filterState.styles.length})</span>
              </button>
            )}

            {/* Minimize/Expand Toggle */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800/60 rounded-xl transition-colors border border-neutral-800"
              title={isExpanded ? 'Minimize summary' : 'Expand summary'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsible Content */}
        {isExpanded && (
          <div className="space-y-6 relative z-10">
            {/* Visual Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {styleStats.map((stat) => {
                const isSelected = isStyleFiltered(stat.name);
                return (
                  <button
                    key={stat.name}
                    type="button"
                    onClick={() => handleToggleStyle(stat.name)}
                    onMouseEnter={() => setHoveredStyle(stat.name)}
                    onMouseLeave={() => setHoveredStyle(null)}
                    className={`p-3.5 rounded-2xl border text-left transition-all duration-200 relative group overflow-hidden ${
                      isSelected
                        ? 'bg-amber-400/15 border-amber-400 ring-1 ring-amber-400/50 shadow-md'
                        : hoveredStyle === stat.name
                        ? 'bg-neutral-800/80 border-neutral-700'
                        : 'bg-neutral-950/60 border-neutral-800/90 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: stat.color }}
                        />
                        <span className="text-xs font-mono uppercase font-bold text-white tracking-wider">
                          {stat.name}
                        </span>
                      </span>
                      {isSelected ? (
                        <span className="w-4 h-4 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center text-[10px]">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-neutral-500 group-hover:text-amber-300">
                          {stat.percentage}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-serif text-amber-200 font-semibold">
                        {stat.count}
                        <span className="text-[11px] font-mono font-normal text-neutral-400 ml-1">
                          {stat.count === 1 ? 'item' : 'items'}
                        </span>
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400">
                        avg ${stat.avgPrice}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-800 h-1 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${stat.percentage}%`,
                          backgroundColor: stat.color,
                        }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Recharts Visual Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-neutral-950/70 border border-neutral-800/80 rounded-2xl p-4 sm:p-6">
              {/* Chart Canvas */}
              <div className="lg:col-span-8 h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'bar' ? (
                    <BarChart
                      data={styleStats}
                      margin={{ top: 15, right: 15, left: -15, bottom: 5 }}
                    >
                      <XAxis
                        dataKey="name"
                        stroke="#737373"
                        tick={{ fill: '#A3A3A3', fontSize: 11, fontFamily: 'monospace' }}
                        tickLine={false}
                        axisLine={{ stroke: '#262626' }}
                      />
                      <YAxis
                        allowDecimals={false}
                        stroke="#737373"
                        tick={{ fill: '#737373', fontSize: 10, fontFamily: 'monospace' }}
                        tickLine={false}
                        axisLine={{ stroke: '#262626' }}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(251, 191, 36, 0.05)' }} />
                      <Bar
                        dataKey="count"
                        radius={[8, 8, 2, 2]}
                        onClick={(data: any) => handleToggleStyle(data.name)}
                        className="cursor-pointer"
                      >
                        {styleStats.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={entry.color}
                            fillOpacity={
                              filterState.styles.length === 0 || isStyleFiltered(entry.name)
                                ? 0.95
                                : 0.3
                            }
                            stroke={isStyleFiltered(entry.name) ? '#FBBF24' : '#262626'}
                            strokeWidth={isStyleFiltered(entry.name) ? 2 : 1}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  ) : (
                    <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <Tooltip content={<CustomTooltip />} />
                      <Pie
                        data={styleStats}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        onClick={(data: any) => handleToggleStyle(data.name)}
                        className="cursor-pointer"
                      >
                        {styleStats.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={entry.color}
                            fillOpacity={
                              filterState.styles.length === 0 || isStyleFiltered(entry.name)
                                ? 0.95
                                : 0.35
                            }
                            stroke="#171717"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </div>

              {/* Chart Insights & Fast Interaction */}
              <div className="lg:col-span-4 space-y-4 border-t lg:border-t-0 lg:border-l border-neutral-800/80 pt-4 lg:pt-0 lg:pl-6">
                <div>
                  <span className="text-[10px] font-mono uppercase text-amber-400 tracking-wider flex items-center gap-1">
                    <Layers className="w-3 h-3" /> Catalog Insight
                  </span>
                  <p className="text-sm font-serif text-white mt-1">
                    {dominantStyle ? (
                      <>
                        <span className="text-amber-300 font-semibold">{dominantStyle.name}</span> leads the current season with{' '}
                        <span className="font-mono text-amber-200">{dominantStyle.count} items</span> ({dominantStyle.percentage}%).
                      </>
                    ) : (
                      'All seasonal styles are balanced across catalog.'
                    )}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs font-mono text-neutral-400">
                  <div className="flex justify-between py-1 border-b border-neutral-900">
                    <span>Active Filters:</span>
                    <span className="text-amber-300 font-bold">
                      {filterState.styles.length > 0
                        ? filterState.styles.join(', ')
                        : 'All (None applied)'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-900">
                    <span>Archetypes:</span>
                    <span className="text-neutral-200">{styleStats.length} defined</span>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-500 font-light">
                  Tip: Click on any bar, donut segment, or style card to dynamically filter the catalog below.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
