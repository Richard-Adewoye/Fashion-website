import React, { useState } from 'react';
import {
  X,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  FileText,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Product } from '../types';

interface OrderItem {
  id: string;
  name: string;
  size: string;
  colorName: string;
  colorHex: string;
  price: number;
  quantity: number;
  image: string;
}

export interface OrderDetails {
  orderId: string;
  date: string;
  status: 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered';
  estimatedDelivery: string;
  carrier: string;
  trackingNumber: string;
  shippingAddress: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  timeline: {
    title: string;
    description: string;
    timestamp: string;
    completed: boolean;
    current?: boolean;
    location?: string;
  }[];
}

const INITIAL_ORDERS: OrderDetails[] = [
  {
    orderId: 'ELAN-8942',
    date: 'July 30, 2026',
    status: 'Shipped',
    estimatedDelivery: 'August 3, 2026',
    carrier: 'DHL Express International',
    trackingNumber: 'DHL-9482-3019-ELAN',
    shippingAddress: '742 Evergreen Terrace, San Francisco, CA 94102',
    items: [
      {
        id: 'elan-01',
        name: 'The Sovereign Double-Breasted Cashmere Coat',
        size: 'M',
        colorName: 'Camel',
        colorHex: '#C19A6B',
        price: 1850,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&q=80&w=800',
      },
      {
        id: 'elan-06',
        name: 'Silk-Blend Structured Blazer',
        size: 'M',
        colorName: 'Midnight Navy',
        colorHex: '#1B263B',
        price: 980,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800',
      },
    ],
    subtotal: 2830,
    shippingFee: 0,
    tax: 226.4,
    total: 3056.4,
    timeline: [
      {
        title: 'Order Placed & Confirmed',
        description: 'Payment authorized and order sent to Paris Atelier.',
        timestamp: 'July 30, 2026 • 09:14 AM',
        completed: true,
        location: 'Paris, France',
      },
      {
        title: 'Atelier Quality Inspection & Hand-Packing',
        description: 'Garments passed 12-point stitching, fabric, and hand-finish checks.',
        timestamp: 'July 31, 2026 • 02:45 PM',
        completed: true,
        location: 'Élan Atelier, Paris',
      },
      {
        title: 'In Transit with DHL Express',
        description: 'Departed international hub. Custom clearance completed in transit.',
        timestamp: 'August 1, 2026 • 08:30 AM',
        completed: true,
        current: true,
        location: 'Leipzig Logistics Hub, Germany',
      },
      {
        title: 'Out for Local Delivery',
        description: 'Assigned to local courier vehicle for final destination.',
        timestamp: 'Expected Aug 3 • Morning',
        completed: false,
        location: 'San Francisco, CA Hub',
      },
      {
        title: 'Delivered',
        description: 'Package delivered to recipient signature required.',
        timestamp: 'Expected Aug 3 • By 5:00 PM',
        completed: false,
      },
    ],
  },
  {
    orderId: 'ELAN-7103',
    date: 'June 14, 2026',
    status: 'Delivered',
    estimatedDelivery: 'June 17, 2026',
    carrier: 'FedEx Priority',
    trackingNumber: 'FDX-7740-1129-ELAN',
    shippingAddress: '742 Evergreen Terrace, San Francisco, CA 94102',
    items: [
      {
        id: 'elan-02',
        name: 'Architectural Silk Midi Dress',
        size: 'S',
        colorName: 'Champagne',
        colorHex: '#F7E7CE',
        price: 1250,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800',
      },
    ],
    subtotal: 1250,
    shippingFee: 0,
    tax: 100,
    total: 1350,
    timeline: [
      {
        title: 'Order Placed & Confirmed',
        description: 'Order confirmed and verified.',
        timestamp: 'June 14, 2026 • 11:20 AM',
        completed: true,
      },
      {
        title: 'Atelier Quality Inspection',
        description: 'Inspected and wrapped in signature garment sleeve.',
        timestamp: 'June 15, 2026 • 10:00 AM',
        completed: true,
      },
      {
        title: 'In Transit',
        description: 'On route via FedEx Express Air.',
        timestamp: 'June 16, 2026 • 06:15 PM',
        completed: true,
      },
      {
        title: 'Out for Delivery',
        description: 'On delivery vehicle.',
        timestamp: 'June 17, 2026 • 09:10 AM',
        completed: true,
      },
      {
        title: 'Delivered',
        description: 'Signed for by resident at front desk.',
        timestamp: 'June 17, 2026 • 01:40 PM',
        completed: true,
        current: true,
        location: 'San Francisco, CA',
      },
    ],
  },
];

interface OrderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (product: Product) => void;
  products?: Product[];
}

export const OrderStatusModal: React.FC<OrderStatusModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  products = [],
}) => {
  const [ordersList, setOrdersList] = useState<OrderDetails[]>(INITIAL_ORDERS);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('ELAN-8942');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentOrder =
    ordersList.find((o) => o.orderId.toLowerCase() === selectedOrderId.toLowerCase()) ||
    ordersList[0];

  const handleSearchOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const match = ordersList.find((o) =>
      o.orderId.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
    if (match) {
      setSelectedOrderId(match.orderId);
    } else {
      // Generate a dynamic mock order entry for queried order ID
      const newMockOrder: OrderDetails = {
        orderId: searchQuery.trim().toUpperCase(),
        date: 'Today',
        status: 'Processing',
        estimatedDelivery: '3 Business Days',
        carrier: 'DHL Express Global',
        trackingNumber: `DHL-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(
          1000 + Math.random() * 9000
        )}-ELAN`,
        shippingAddress: 'User Selected Destination',
        items: [
          {
            id: 'elan-04',
            name: 'Monolith Oversized Trench Coat',
            size: 'L',
            colorName: 'Charcoal',
            colorHex: '#36454F',
            price: 1420,
            quantity: 1,
            image:
              'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=800',
          },
        ],
        subtotal: 1420,
        shippingFee: 0,
        tax: 113.6,
        total: 1533.6,
        timeline: [
          {
            title: 'Order Placed & Confirmed',
            description: 'Order registered in ÉLAN Global Concierge System.',
            timestamp: 'Just Now',
            completed: true,
            location: 'System Center',
          },
          {
            title: 'Atelier Quality Inspection',
            description: 'Garment undergoing final artisan check.',
            timestamp: 'In Progress',
            completed: false,
            current: true,
            location: 'Atelier Workshop',
          },
          {
            title: 'In Transit',
            description: 'Awaiting courier dispatch.',
            timestamp: 'Pending',
            completed: false,
          },
          {
            title: 'Delivered',
            description: 'Final delivery.',
            timestamp: 'Pending',
            completed: false,
          },
        ],
      };
      setOrdersList((prev) => [newMockOrder, ...prev]);
      setSelectedOrderId(newMockOrder.orderId);
    }
  };

  const handleSimulateAdvanceStatus = () => {
    setOrdersList((prev) =>
      prev.map((ord) => {
        if (ord.orderId !== currentOrder.orderId) return ord;

        const statuses: ('Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered')[] = [
          'Processing',
          'Shipped',
          'Out for Delivery',
          'Delivered',
        ];
        const currentIndex = statuses.indexOf(ord.status);
        const nextIndex = (currentIndex + 1) % statuses.length;
        const nextStatus = statuses[nextIndex];

        // Update timeline completed flags
        const newTimeline = ord.timeline.map((step, idx) => {
          if (idx <= nextIndex) {
            return {
              ...step,
              completed: true,
              current: idx === nextIndex,
              timestamp: idx === nextIndex ? 'Updated Just Now' : step.timestamp,
            };
          }
          return { ...step, completed: false, current: false };
        });

        return {
          ...ord,
          status: nextStatus,
          timeline: newTimeline,
        };
      })
    );
  };

  const copyTracking = () => {
    navigator.clipboard.writeText(currentOrder.trackingNumber);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div
      id="order-status-modal-overlay"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div
        id="order-status-modal-card"
        className="w-full max-w-5xl bg-neutral-950 border border-neutral-800 rounded-3xl p-4 sm:p-8 text-white space-y-6 relative max-h-[92vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-serif font-bold uppercase tracking-wider text-white">
                  Atelier Order Dashboard & Live Status
                </h3>
              </div>
              <p className="text-xs text-neutral-400 font-mono">
                Track artisan packaging, international logistics, and real-time courier milestones.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateAdvanceStatus}
              className="px-3 py-1.5 bg-neutral-900 border border-amber-400/40 text-amber-300 hover:bg-neutral-800 text-xs font-mono rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              title="Simulate advancing the order status to next stage"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>Simulate Next Step</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-900 border border-neutral-800 hover:bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Order Selector Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
          {/* Search Input */}
          <form onSubmit={handleSearchOrder} className="md:col-span-1 relative">
            <input
              type="text"
              placeholder="Search Order ID (e.g. ELAN-8942)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 text-xs font-mono text-white placeholder-neutral-500 pl-9 pr-8 py-2.5 rounded-xl border border-neutral-800 focus:border-amber-400 focus:outline-none"
            />
            <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-neutral-500" />
            <button type="submit" className="hidden">
              Search
            </button>
          </form>

          {/* Quick Select Buttons */}
          <div className="md:col-span-2 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[10px] font-mono uppercase text-neutral-500 shrink-0">Recent Orders:</span>
            {ordersList.map((ord) => (
              <button
                key={ord.orderId}
                onClick={() => setSelectedOrderId(ord.orderId)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 border shrink-0 ${
                  selectedOrderId === ord.orderId
                    ? 'bg-amber-400 text-neutral-950 font-bold border-amber-400'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                <span>#{ord.orderId}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                    ord.status === 'Delivered'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {ord.status}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
          {/* Main Status Hero Card */}
          <div className="bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800 p-5 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-serif font-bold text-white">Order #{currentOrder.orderId}</h4>
                  <span
                    className={`px-3 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                      currentOrder.status === 'Delivered'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                        : currentOrder.status === 'Shipped' || currentOrder.status === 'Out for Delivery'
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 animate-pulse'
                        : 'bg-sky-950 text-sky-300 border border-sky-800'
                    }`}
                  >
                    {currentOrder.status}
                  </span>
                </div>
                <p className="text-xs font-mono text-neutral-400 mt-1">
                  Placed on {currentOrder.date} • Courier: <span className="text-white">{currentOrder.carrier}</span>
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-mono text-neutral-400 uppercase block">Estimated Delivery</span>
                <span className="text-sm font-serif font-bold text-amber-300">{currentOrder.estimatedDelivery}</span>
              </div>
            </div>

            {/* Tracking Code Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-950 p-3 rounded-xl border border-neutral-850 text-xs font-mono">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400" />
                <span className="text-neutral-400">Tracking Code:</span>
                <strong className="text-white font-bold">{currentOrder.trackingNumber}</strong>
              </div>
              <button
                onClick={copyTracking}
                className="text-amber-300 hover:text-amber-100 underline text-[11px] transition-colors"
              >
                {isCopied ? 'Copied to Clipboard!' : 'Copy Tracking'}
              </button>
            </div>
          </div>

          {/* VISUAL TIMELINE COMPONENT */}
          <div id="order-timeline-section" className="bg-neutral-900/60 border border-neutral-800 p-6 rounded-3xl space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-mono uppercase text-amber-300 font-bold tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" /> Live Tracking Timeline
              </h4>
              <span className="text-[10px] font-mono text-neutral-500">Real-time status updates</span>
            </div>

            {/* Horizontal Step Progress Bar (Desktop) */}
            <div className="hidden md:grid grid-cols-4 gap-2 relative">
              {/* Connecting Line */}
              <div className="absolute top-5 left-[12%] right-[12%] h-1 bg-neutral-800 -z-0">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700"
                  style={{
                    width:
                      currentOrder.status === 'Processing'
                        ? '15%'
                        : currentOrder.status === 'Shipped'
                        ? '50%'
                        : currentOrder.status === 'Out for Delivery'
                        ? '80%'
                        : '100%',
                  }}
                />
              </div>

              {[
                { label: 'Order Confirmed', icon: CheckCircle2, stepStatus: 'completed' },
                {
                  label: 'Quality Check & Packing',
                  icon: Package,
                  stepStatus: currentOrder.status !== 'Processing' ? 'completed' : 'current',
                },
                {
                  label: 'In Transit / Shipped',
                  icon: Truck,
                  stepStatus:
                    currentOrder.status === 'Shipped'
                      ? 'current'
                      : currentOrder.status === 'Out for Delivery' || currentOrder.status === 'Delivered'
                      ? 'completed'
                      : 'pending',
                },
                {
                  label: 'Delivered',
                  icon: MapPin,
                  stepStatus: currentOrder.status === 'Delivered' ? 'completed' : 'pending',
                },
              ].map((step, idx) => {
                const Icon = step.icon;
                const isComp = step.stepStatus === 'completed';
                const isCurr = step.stepStatus === 'current';

                return (
                  <div key={idx} className="flex flex-col items-center text-center space-y-2 z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        isComp
                          ? 'bg-amber-400 text-neutral-950 border-amber-400 shadow-lg shadow-amber-400/20'
                          : isCurr
                          ? 'bg-neutral-950 text-amber-300 border-amber-400 ring-4 ring-amber-400/20 animate-pulse'
                          : 'bg-neutral-900 text-neutral-600 border-neutral-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-xs font-mono font-bold ${
                        isComp || isCurr ? 'text-white' : 'text-neutral-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Vertical Detailed Step List */}
            <div className="space-y-4 pt-2 border-t border-neutral-800/60">
              {currentOrder.timeline.map((step, idx) => (
                <div key={idx} className="flex items-start gap-4 relative">
                  {/* Vertical Indicator */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center border text-xs shrink-0 ${
                        step.completed
                          ? 'bg-amber-400 text-neutral-950 border-amber-400 font-bold'
                          : step.current
                          ? 'bg-neutral-900 text-amber-300 border-amber-400 ring-2 ring-amber-400/40 animate-pulse'
                          : 'bg-neutral-950 text-neutral-600 border-neutral-800'
                      }`}
                    >
                      {step.completed ? '✓' : idx + 1}
                    </div>
                    {idx < currentOrder.timeline.length - 1 && (
                      <div className={`w-0.5 h-10 ${step.completed ? 'bg-amber-400/60' : 'bg-neutral-800'}`} />
                    )}
                  </div>

                  {/* Step Description */}
                  <div className="space-y-1 min-w-0 pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h5 className="text-sm font-serif font-bold text-white">{step.title}</h5>
                      {step.location && (
                        <span className="text-[10px] font-mono bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded border border-neutral-700">
                          {step.location}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-neutral-400">{step.description}</p>
                    <span className="text-[10px] font-mono text-amber-300/80 block">{step.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Garments in Order & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Garments List */}
            <div className="md:col-span-2 bg-neutral-900/60 border border-neutral-800 p-5 rounded-3xl space-y-4">
              <h4 className="text-xs font-mono uppercase text-neutral-400 tracking-wider">
                Garments Included ({currentOrder.items.length})
              </h4>
              <div className="divide-y divide-neutral-800">
                {currentOrder.items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-20 object-cover rounded-xl bg-neutral-950 border border-neutral-800 shrink-0 cursor-pointer hover:opacity-90"
                      onClick={() => {
                        const matched = products.find((p) => p.id === item.id);
                        if (matched && onSelectProduct) {
                          onClose();
                          onSelectProduct(matched);
                        }
                      }}
                    />
                    <div className="space-y-1 min-w-0 flex-1">
                      <h5
                        onClick={() => {
                          const matched = products.find((p) => p.id === item.id);
                          if (matched && onSelectProduct) {
                            onClose();
                            onSelectProduct(matched);
                          }
                        }}
                        className="text-sm font-serif font-bold text-white truncate cursor-pointer hover:text-amber-300"
                      >
                        {item.name}
                      </h5>
                      <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
                        <span>Size: <strong className="text-white">{item.size}</strong></span>
                        <span className="flex items-center gap-1">
                          Color:{' '}
                          <span
                            className="w-3 h-3 rounded-full border border-neutral-700 inline-block"
                            style={{ backgroundColor: item.colorHex }}
                          />
                          <strong className="text-white">{item.colorName}</strong>
                        </span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-amber-300 text-sm">
                      ${item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Address & Pricing Breakdown */}
            <div className="bg-neutral-900/60 border border-neutral-800 p-5 rounded-3xl space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-neutral-500 block">Shipping Address</span>
                  <p className="text-xs font-mono text-neutral-300 mt-1 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{currentOrder.shippingAddress}</span>
                  </p>
                </div>

                <div className="border-t border-neutral-800 pt-3 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-neutral-400">
                    <span>Subtotal</span>
                    <span>${currentOrder.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Complimentary Express Shipping</span>
                    <span className="text-emerald-400 font-bold">FREE</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Estimated Tax</span>
                    <span>${currentOrder.tax}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white border-t border-neutral-800 pt-2">
                    <span>Total Paid</span>
                    <span className="text-amber-300">${currentOrder.total}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800 space-y-2">
                <button
                  onClick={() => alert(`Downloading Invoice for Order #${currentOrder.orderId}...`)}
                  className="w-full py-2 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 rounded-xl text-xs font-mono transition-colors flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" /> Download Tax Invoice (PDF)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
