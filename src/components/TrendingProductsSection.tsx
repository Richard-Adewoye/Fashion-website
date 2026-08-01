import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  TrendingUp,
  Flame,
  Eye,
  ShoppingBag,
  RefreshCcw,
  Sparkles,
  BarChart3,
  ArrowUpRight,
  Activity,
  Zap,
  Check
} from 'lucide-react';
import { Product, ProductTrendingData, ProductColor } from '../types';

interface TrendingProductsSectionProps {
  products: Product[];
  cartCount: number;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: ProductColor) => void;
}

type ViewMetric = 'popularity' | 'views_vs_cart' | 'conversion';

export const TrendingProductsSection: React.FC<TrendingProductsSectionProps> = ({
  products,
  cartCount,
  onQuickView,
  onAddToCart,
}) => {
  const [metricMode, setMetricMode] = useState<ViewMetric>('popularity');
  const [timeframe, setTimeframe] = useState<'live' | '24h' | '7d'>('live');
  const [isLiveActive, setIsLiveActive] = useState<boolean>(true);
  const [hoveredProduct, setHoveredProduct] = useState<ProductTrendingData | null>(null);

  // Simulated live real-time metrics generator seeded with real catalog items
  const [trendingMetrics, setTrendingMetrics] = useState<ProductTrendingData[]>(() => {
    return products.slice(0, 8).map((p, idx) => {
      const baseViews = 1200 - idx * 110 + Math.floor(Math.random() * 200);
      const baseCarts = Math.floor(baseViews * (0.18 + Math.random() * 0.12));
      const baseOrders = Math.floor(baseCarts * (0.35 + Math.random() * 0.25));
      const score = Math.round(baseViews * 0.2 + baseCarts * 1.5 + baseOrders * 3.0);
      return {
        productId: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        views: baseViews,
        cartAdditions: baseCarts,
        orders: baseOrders,
        popularityScore: score,
        trendingDelta: +(Math.random() * 25 + 5).toFixed(1),
      };
    });
  });

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Live real-time ticker updating random counts every 3.5 seconds
  useEffect(() => {
    if (!isLiveActive) return;

    const interval = setInterval(() => {
      setTrendingMetrics((prev) =>
        prev.map((item) => {
          const viewInc = Math.floor(Math.random() * 12);
          const cartInc = Math.random() > 0.6 ? 1 : 0;
          const orderInc = Math.random() > 0.85 ? 1 : 0;
          const newViews = item.views + viewInc;
          const newCarts = item.cartAdditions + cartInc;
          const newOrders = item.orders + orderInc;
          const newScore = Math.round(newViews * 0.2 + newCarts * 1.5 + newOrders * 3.0);
          const deltaChange = +(item.trendingDelta + (Math.random() * 2 - 0.9)).toFixed(1);

          return {
            ...item,
            views: newViews,
            cartAdditions: newCarts,
            orders: newOrders,
            popularityScore: newScore,
            trendingDelta: Math.max(1.0, deltaChange),
          };
        })
      );
    }, 3500);

    return () => clearInterval(interval);
  }, [isLiveActive]);

  // Update metrics when user adds to cart
  useEffect(() => {
    if (cartCount > 0) {
      setTrendingMetrics((prev) =>
        prev.map((item, idx) =>
          idx === 0
            ? {
                ...item,
                cartAdditions: item.cartAdditions + 1,
                popularityScore: item.popularityScore + 15,
                trendingDelta: +(item.trendingDelta + 2.4).toFixed(1),
              }
            : item
        )
      );
    }
  }, [cartCount]);

  // D3 Chart Rendering Logic
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // Clear previous D3 SVG elements
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const containerWidth = containerRef.current.clientWidth || 800;
    const isMobile = containerWidth < 640;
    const margin = {
      top: 30,
      right: isMobile ? 20 : 40,
      bottom: 40,
      left: isMobile ? 110 : 170,
    };
    const width = containerWidth - margin.left - margin.right;
    const height = 360 - margin.top - margin.bottom;

    svg.attr('width', containerWidth).attr('height', 360);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add SVG Gradients
    const defs = svg.append('defs');

    // Amber Gold Gradient
    const goldGrad = defs
      .append('linearGradient')
      .attr('id', 'gold-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');
    goldGrad.append('stop').attr('offset', '0%').attr('stop-color', '#fbbf24');
    goldGrad.append('stop').attr('offset', '100%').attr('stop-color', '#f59e0b');

    // Cyan Sapphire Gradient
    const cyanGrad = defs
      .append('linearGradient')
      .attr('id', 'cyan-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');
    cyanGrad.append('stop').attr('offset', '0%').attr('stop-color', '#38bdf8');
    cyanGrad.append('stop').attr('offset', '100%').attr('stop-color', '#0284c7');

    // Sort metrics descending based on mode
    const sortedData = [...trendingMetrics].sort((a, b) => {
      if (metricMode === 'views_vs_cart') return b.views - a.views;
      if (metricMode === 'conversion') return (b.orders / (b.views || 1)) - (a.orders / (a.views || 1));
      return b.popularityScore - a.popularityScore;
    }).slice(0, 6);

    // Scales
    const yScale = d3
      .scaleBand()
      .domain(sortedData.map((d) => d.name))
      .range([0, height])
      .padding(0.3);

    let xMax = 100;
    if (metricMode === 'popularity') {
      xMax = d3.max(sortedData, (d) => d.popularityScore) || 500;
    } else if (metricMode === 'views_vs_cart') {
      xMax = d3.max(sortedData, (d) => d.views) || 1000;
    } else {
      xMax = d3.max(sortedData, (d) => Math.round((d.orders / (d.views || 1)) * 100)) || 25;
    }

    const xScale = d3.scaleLinear().domain([0, xMax * 1.15]).range([0, width]);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(5)
          .tickSize(-height)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', '#262626')
      .attr('stroke-dasharray', '2,2');

    // Render Bars depending on Mode
    if (metricMode === 'popularity') {
      // Single Gold Bars with D3 Transitions
      const bars = g.selectAll('.bar-gold').data(sortedData, (d: any) => d.productId);

      bars
        .enter()
        .append('rect')
        .attr('class', 'bar-gold cursor-pointer')
        .attr('y', (d) => yScale(d.name) || 0)
        .attr('height', yScale.bandwidth())
        .attr('x', 0)
        .attr('width', 0)
        .attr('rx', 6)
        .attr('fill', 'url(#gold-gradient)')
        .on('mouseenter', (event, d) => setHoveredProduct(d))
        .on('mouseleave', () => setHoveredProduct(null))
        .transition()
        .duration(800)
        .ease(d3.easeCubicOut)
        .attr('width', (d) => xScale(d.popularityScore));

      // Value labels
      g.selectAll('.label-val')
        .data(sortedData)
        .enter()
        .append('text')
        .attr('class', 'label-val')
        .attr('y', (d) => (yScale(d.name) || 0) + yScale.bandwidth() / 2 + 4)
        .attr('x', (d) => xScale(d.popularityScore) + 8)
        .attr('fill', '#fbbf24')
        .attr('font-size', '11px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .text((d) => `${d.popularityScore.toLocaleString()} pts`);
    } else if (metricMode === 'views_vs_cart') {
      // Grouped dual bars: Views (Cyan) vs Cart Additions (Gold)
      const subScale = d3
        .scaleBand()
        .domain(['views', 'carts'])
        .range([0, yScale.bandwidth()])
        .padding(0.1);

      sortedData.forEach((d) => {
        const y0 = yScale(d.name) || 0;

        // Views Bar
        g.append('rect')
          .attr('class', 'bar-view cursor-pointer')
          .attr('y', y0 + (subScale('views') || 0))
          .attr('height', subScale.bandwidth())
          .attr('x', 0)
          .attr('width', 0)
          .attr('rx', 4)
          .attr('fill', 'url(#cyan-gradient)')
          .on('mouseenter', () => setHoveredProduct(d))
          .transition()
          .duration(800)
          .attr('width', xScale(d.views));

        // Cart Bar
        g.append('rect')
          .attr('class', 'bar-cart cursor-pointer')
          .attr('y', y0 + (subScale('carts') || 0))
          .attr('height', subScale.bandwidth())
          .attr('x', 0)
          .attr('width', 0)
          .attr('rx', 4)
          .attr('fill', 'url(#gold-gradient)')
          .on('mouseenter', () => setHoveredProduct(d))
          .transition()
          .duration(800)
          .attr('width', xScale(d.cartAdditions));

        // Value text
        g.append('text')
          .attr('y', y0 + (subScale('views') || 0) + subScale.bandwidth() / 2 + 3)
          .attr('x', xScale(d.views) + 6)
          .attr('fill', '#38bdf8')
          .attr('font-size', '10px')
          .attr('font-family', 'monospace')
          .text(`${d.views} views`);

        g.append('text')
          .attr('y', y0 + (subScale('carts') || 0) + subScale.bandwidth() / 2 + 3)
          .attr('x', xScale(d.cartAdditions) + 6)
          .attr('fill', '#fbbf24')
          .attr('font-size', '10px')
          .attr('font-family', 'monospace')
          .text(`${d.cartAdditions} in bag`);
      });
    } else {
      // Conversion Rate %
      g.selectAll('.bar-conv')
        .data(sortedData)
        .enter()
        .append('rect')
        .attr('class', 'bar-conv cursor-pointer')
        .attr('y', (d) => yScale(d.name) || 0)
        .attr('height', yScale.bandwidth())
        .attr('x', 0)
        .attr('width', 0)
        .attr('rx', 6)
        .attr('fill', 'url(#gold-gradient)')
        .on('mouseenter', (event, d) => setHoveredProduct(d))
        .transition()
        .duration(800)
        .attr('width', (d) => xScale(Math.round((d.orders / (d.views || 1)) * 100)));

      g.selectAll('.label-conv')
        .data(sortedData)
        .enter()
        .append('text')
        .attr('y', (d) => (yScale(d.name) || 0) + yScale.bandwidth() / 2 + 4)
        .attr('x', (d) => xScale(Math.round((d.orders / (d.views || 1)) * 100)) + 8)
        .attr('fill', '#fbbf24')
        .attr('font-size', '11px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .text((d) => `${((d.orders / (d.views || 1)) * 100).toFixed(1)}% conv.`);
    }

    // Y Axis (Product Names)
    const yAxis = d3.axisLeft(yScale).tickSize(0);
    const yAxisG = g.append('g').call(yAxis);

    yAxisG.select('.domain').remove();
    yAxisG
      .selectAll('text')
      .attr('fill', '#e5e5e5')
      .attr('font-size', isMobile ? '10px' : '12px')
      .attr('font-family', 'serif')
      .attr('font-weight', 'bold')
      .attr('dx', '-8px')
      .style('cursor', 'pointer')
      .on('click', (event, name) => {
        const found = products.find((p) => p.name === name);
        if (found) onQuickView(found);
      });

    // Bottom Axis
    const xAxis = d3.axisBottom(xScale).ticks(5);
    const xAxisG = g.append('g').attr('transform', `translate(0,${height})`).call(xAxis);

    xAxisG.select('.domain').attr('stroke', '#404040');
    xAxisG.selectAll('text').attr('fill', '#a3a3a3').attr('font-family', 'monospace').attr('font-size', '10px');
  }, [trendingMetrics, metricMode, products]);

  const topTrending = [...trendingMetrics].sort((a, b) => b.popularityScore - a.popularityScore)[0];
  const topProduct = products.find((p) => p.id === topTrending?.productId) || products[0];

  return (
    <section id="trending-products-analytics" className="py-16 bg-neutral-950 border-t border-neutral-900 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-900 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono uppercase tracking-widest font-semibold">
                <Activity className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                Live Demand Pulse
              </span>
              {isLiveActive && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-emerald-950 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Real-time Streaming
                </span>
              )}
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-white">
              Trending Atelier Pieces
            </h2>
            <p className="text-sm font-mono text-neutral-400 mt-2 max-w-2xl">
              Visualizing live visitor engagement, item views, and bag additions calculated via our D3.js real-time analytics engine.
            </p>
          </div>

          {/* Controls & Metric Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-neutral-900 p-1 rounded-xl border border-neutral-800 flex items-center gap-1">
              <button
                onClick={() => setMetricMode('popularity')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  metricMode === 'popularity'
                    ? 'bg-amber-400 text-neutral-950 font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Popularity Score
              </button>
              <button
                onClick={() => setMetricMode('views_vs_cart')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  metricMode === 'views_vs_cart'
                    ? 'bg-amber-400 text-neutral-950 font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Views vs Bag
              </button>
              <button
                onClick={() => setMetricMode('conversion')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  metricMode === 'conversion'
                    ? 'bg-amber-400 text-neutral-950 font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Conversion %
              </button>
            </div>

            <button
              onClick={() => setIsLiveActive(!isLiveActive)}
              className={`p-2.5 rounded-xl border transition-all text-xs font-mono flex items-center gap-1.5 ${
                isLiveActive
                  ? 'bg-neutral-900 border-amber-400/50 text-amber-300'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-white'
              }`}
              title={isLiveActive ? 'Pause live metric updates' : 'Resume live updates'}
            >
              <RefreshCcw className={`w-3.5 h-3.5 ${isLiveActive ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Highlight Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-neutral-400">#1 Trending Garment</span>
              <h4 className="text-sm font-serif font-bold text-white truncate max-w-[160px] mt-0.5">
                {topProduct.name}
              </h4>
              <span className="text-xs font-mono text-amber-300 font-semibold">
                +{(topTrending?.trendingDelta || 18.5)}% demand boost
              </span>
            </div>
            <img
              src={topProduct.images[0]}
              alt={topProduct.name}
              referrerPolicy="no-referrer"
              className="w-12 h-14 object-cover rounded-lg bg-neutral-950 border border-neutral-800"
            />
          </div>

          <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-2xl flex flex-col justify-center">
            <span className="text-[10px] font-mono uppercase text-neutral-400">Total Live Garment Views</span>
            <div className="text-xl font-mono font-bold text-cyan-400 mt-1 flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>
                {trendingMetrics.reduce((sum, item) => sum + item.views, 0).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-2xl flex flex-col justify-center">
            <span className="text-[10px] font-mono uppercase text-neutral-400">Total Bag Additions</span>
            <div className="text-xl font-mono font-bold text-amber-300 mt-1 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>
                {trendingMetrics.reduce((sum, item) => sum + item.cartAdditions, 0).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-2xl flex flex-col justify-center">
            <span className="text-[10px] font-mono uppercase text-neutral-400">Avg Bag Conversion Rate</span>
            <div className="text-xl font-mono font-bold text-emerald-400 mt-1 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>
                {(
                  (trendingMetrics.reduce((sum, i) => sum + i.cartAdditions, 0) /
                    (trendingMetrics.reduce((sum, i) => sum + i.views, 0) || 1)) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>
          </div>
        </div>

        {/* D3 SVG Chart Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div
            ref={containerRef}
            className="lg:col-span-2 bg-neutral-900/60 border border-neutral-800 p-6 rounded-3xl relative overflow-hidden min-h-[380px]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase text-amber-300 font-semibold tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                D3.js Real-Time Visualization Canvas
              </span>
              <span className="text-[10px] font-mono text-neutral-500">
                Click product names to Quick View
              </span>
            </div>

            <svg ref={svgRef} className="w-full h-[360px] overflow-visible" />
          </div>

          {/* Quick Preview Card for Hovered or Top Item */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <span className="text-xs font-mono uppercase text-amber-300 tracking-wider font-semibold flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" /> Demand Highlight
              </span>
              <span className="text-[10px] font-mono bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded uppercase">
                Trending
              </span>
            </div>

            {(() => {
              const activeData = hoveredProduct || topTrending;
              const activeProd = products.find((p) => p.id === activeData?.productId) || topProduct;

              return (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <img
                      src={activeProd.images[0]}
                      alt={activeProd.name}
                      referrerPolicy="no-referrer"
                      className="w-24 h-32 object-cover rounded-2xl bg-neutral-950 border border-neutral-800 shrink-0"
                    />
                    <div className="space-y-1 min-w-0">
                      <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">
                        {activeProd.category}
                      </span>
                      <h3 className="text-base font-serif font-bold text-white truncate">
                        {activeProd.name}
                      </h3>
                      <p className="text-xs font-mono text-amber-300 font-bold">${activeProd.price}</p>
                      <p className="text-[11px] font-mono text-neutral-400 line-clamp-2 pt-1">
                        {activeProd.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-neutral-950 p-3 rounded-2xl border border-neutral-850">
                    <div>
                      <span className="text-neutral-500 text-[10px] block">Item Views</span>
                      <span className="font-bold text-cyan-300">{activeData?.views}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 text-[10px] block">Added to Bag</span>
                      <span className="font-bold text-amber-300">{activeData?.cartAdditions}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => onQuickView(activeProd)}
                      className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-mono transition-all flex items-center justify-center gap-1"
                    >
                      Quick View
                    </button>
                    <button
                      onClick={() =>
                        onAddToCart(
                          activeProd,
                          activeProd.sizes[0],
                          activeProd.colors[0]
                        )
                      }
                      className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-xl text-xs font-mono transition-all flex items-center justify-center gap-1"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> + Bag
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </section>
  );
};
