import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  RotateCcw,
  Sliders,
  Download,
  Sparkles,
  Check,
  AlertCircle,
  Eye,
  Maximize2,
  RefreshCw,
  Sun,
  Palette,
  Layers,
  ShoppingBag
} from 'lucide-react';
import { Product, ProductColor } from '../types';

interface VirtualTryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  selectedColor: ProductColor;
  onAddToCart?: (product: Product, size: string, color: ProductColor) => void;
}

export const VirtualTryOnModal: React.FC<VirtualTryOnModalProps> = ({
  isOpen,
  onClose,
  product,
  selectedColor: initialColor,
  onAddToCart,
}) => {
  const [currentColor, setCurrentColor] = useState<ProductColor>(initialColor);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Garment overlay transform controls
  const [scale, setScale] = useState<number>(1);
  const [positionX, setPositionX] = useState<number>(0);
  const [positionY, setPositionY] = useState<number>(0);
  const [opacity, setOpacity] = useState<number>(0.85);
  const [blendMode, setBlendMode] = useState<'normal' | 'multiply' | 'overlay'>('normal');

  // Dragging state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Captured snapshots gallery
  const [snapshots, setSnapshots] = useState<string[]>([]);
  const [flashAnimation, setFlashAnimation] = useState<boolean>(false);
  const [addedToCartToast, setAddedToCartToast] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayImageRef = useRef<HTMLImageElement | null>(null);

  // Sync initial color
  useEffect(() => {
    setCurrentColor(initialColor);
  }, [initialColor]);

  // Handle Camera initialization
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (cameraStream) {
        stopCamera();
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported on this browser or environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setCameraStream(stream);
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.log('Video play error:', e));
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setIsCameraActive(false);
      setCameraError(
        err.message || 'Camera access was declined or is unavailable in preview iframe. Virtual Mannequin Studio active.'
      );
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Dragging handlers for repositioning garment
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - positionX, y: e.clientY - positionY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPositionX(e.clientX - dragStartRef.current.x);
    setPositionY(e.clientY - dragStartRef.current.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetOverlayTransform = () => {
    setScale(1);
    setPositionX(0);
    setPositionY(0);
    setOpacity(0.85);
  };

  // Capture Snapshot
  const captureSnapshot = () => {
    setFlashAnimation(true);
    setTimeout(() => setFlashAnimation(false), 300);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 1000;

    // Background: draw video frame or fallback studio gradient
    if (isCameraActive && videoRef.current && videoRef.current.readyState === 4) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    } else {
      // Studio background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, '#171717');
      grad.addColorStop(1, '#0a0a0a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle mannequin silhouette
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, 220, 80, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw Garment Overlay
    const garmentImg = overlayImageRef.current;
    if (garmentImg && garmentImg.complete) {
      ctx.save();
      ctx.globalAlpha = opacity;

      const baseWidth = 450 * scale;
      const baseHeight = 550 * scale;
      const drawX = canvas.width / 2 - baseWidth / 2 + positionX;
      const drawY = canvas.height / 2 - baseHeight / 2 + positionY + 50;

      ctx.drawImage(garmentImg, drawX, drawY, baseWidth, baseHeight);
      ctx.restore();
    }

    // Draw ÉLAN Watermark & Details
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 20px serif';
    ctx.fillText('ÉLAN PARIS — VIRTUAL TRY-ON', 30, 50);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px monospace';
    ctx.fillText(`${product.name} (${currentColor.name})`, 30, 80);
    ctx.fillText(new Date().toLocaleDateString(), 30, 105);

    const dataUrl = canvas.toDataURL('image/png');
    setSnapshots((prev) => [dataUrl, ...prev]);
  };

  if (!isOpen) return null;

  return (
    <div
      id="virtual-tryon-modal-overlay"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onMouseUp={handleMouseUp}
    >
      <div
        id="virtual-tryon-card"
        className="w-full max-w-5xl bg-neutral-950 border border-neutral-800 rounded-3xl p-4 sm:p-6 text-white space-y-4 relative max-h-[95vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onMouseMove={handleMouseMove}
      >
        {/* Flash Effect on Capture */}
        {flashAnimation && (
          <div className="absolute inset-0 bg-white z-50 animate-ping opacity-75 rounded-3xl pointer-events-none" />
        )}

        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-serif font-bold uppercase tracking-wider text-white">
                  Virtual Atelier Fitting Room
                </h3>
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-amber-400/40 uppercase">
                  Live AR Mirror
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono">
                Real-time webcam overlay for <span className="text-white">{product.name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCameraActive && (
              <button
                onClick={toggleCameraFacing}
                className="p-2 bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white rounded-full text-xs font-mono"
                title="Flip Camera"
              >
                <RefreshCw className="w-4 h-4" />
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

        {/* Main Split Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          {/* CAMERA FEED & OVERLAY STAGE (2 Cols) */}
          <div className="lg:col-span-2 relative bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden flex flex-col items-center justify-center min-h-[400px] select-none">
            {/* Live Video Feed */}
            {isCameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100 min-h-[420px]"
              />
            ) : (
              <div className="w-full h-full min-h-[420px] bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center text-amber-400 shadow-xl">
                  <Camera className="w-10 h-10 animate-pulse" />
                </div>
                <div className="max-w-md space-y-1">
                  <h4 className="text-sm font-serif font-bold text-white">Atelier Mannequin Studio Mode</h4>
                  <p className="text-xs font-mono text-neutral-400">
                    {cameraError || 'Camera feed inactive. You can adjust the garment sliders over the studio silhouette below.'}
                  </p>
                </div>
                <button
                  onClick={startCamera}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-mono font-bold rounded-xl flex items-center gap-2 shadow-lg"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Enable Camera Stream
                </button>
              </div>
            )}

            {/* GARMENT OVERLAY LAYER */}
            <div
              className="absolute cursor-grab active:cursor-grabbing flex items-center justify-center pointer-events-auto"
              style={{
                transform: `translate(${positionX}px, ${positionY}px) scale(${scale})`,
                opacity: opacity,
                mixBlendMode: blendMode,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              }}
              onMouseDown={handleMouseDown}
            >
              <img
                ref={overlayImageRef}
                src={product.images[0]}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="max-h-[360px] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] filter transition-all"
                style={{
                  filter: currentColor.hex
                    ? `drop-shadow(0px 10px 25px rgba(0,0,0,0.5))`
                    : 'none',
                }}
              />
            </div>

            {/* Alignment Guide Lines */}
            <div className="absolute inset-0 pointer-events-none border border-amber-400/20 rounded-2xl flex flex-col items-center justify-between p-4">
              <div className="w-full flex justify-between text-[10px] font-mono text-amber-400/60">
                <span>[SHOULDER ALIGNMENT]</span>
                <span>DRAG GARMENT TO ADJUST</span>
              </div>
              <div className="w-48 h-0.5 border-t border-dashed border-amber-400/40" />
              <div className="text-[10px] font-mono text-amber-400/60">[TORSO FIT]</div>
            </div>

            {/* Stage Floating Quick Action Bar */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2 bg-neutral-950/85 backdrop-blur-md p-2.5 rounded-2xl border border-neutral-800">
              <button
                onClick={captureSnapshot}
                className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-bold text-xs font-mono rounded-xl flex items-center gap-2 shadow-lg"
              >
                <Camera className="w-4 h-4" />
                <span>Snap Fitting Photo</span>
              </button>

              <button
                onClick={resetOverlayTransform}
                className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-mono rounded-xl flex items-center gap-1.5"
                title="Reset Fit Position"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Fit</span>
              </button>
            </div>
          </div>

          {/* CONTROLS & COLOR SWATCHES PANEL (1 Col) */}
          <div className="space-y-5 bg-neutral-900/60 border border-neutral-800 p-5 rounded-2xl flex flex-col justify-between">
            <div className="space-y-5">
              {/* Product Card Overview */}
              <div className="flex items-center gap-3 bg-neutral-950 p-3 rounded-xl border border-neutral-850">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-14 object-cover rounded-lg bg-neutral-900 border border-neutral-800"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-serif font-bold text-white truncate">{product.name}</h4>
                  <p className="text-[11px] font-mono text-amber-300">${product.price}</p>
                </div>
              </div>

              {/* Color Swatch Selector */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase text-neutral-400 flex items-center justify-between">
                  <span>Color Swatch:</span>
                  <span className="text-white font-bold">{currentColor.name}</span>
                </label>
                <div className="flex items-center gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setCurrentColor(color)}
                      className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                        currentColor.name === color.name
                          ? 'border-amber-400 ring-2 ring-amber-400/40 scale-110'
                          : 'border-neutral-700 opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {currentColor.name === color.name && (
                        <Check className="w-3 h-3 text-white drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Garment Fit Adjustment Sliders */}
              <div className="space-y-4 pt-2 border-t border-neutral-800">
                <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-amber-300 font-bold">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Garment Fit & Scale Controls</span>
                </div>

                {/* Scale Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-neutral-400">
                    <span>Garment Size Scale</span>
                    <span className="text-white font-bold">{Math.round(scale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.8"
                    step="0.05"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full accent-amber-400 bg-neutral-950 cursor-pointer h-1.5 rounded-lg"
                  />
                </div>

                {/* Opacity Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-neutral-400">
                    <span>Overlay Transparency</span>
                    <span className="text-white font-bold">{Math.round(opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={opacity}
                    onChange={(e) => setOpacity(parseFloat(e.target.value))}
                    className="w-full accent-amber-400 bg-neutral-950 cursor-pointer h-1.5 rounded-lg"
                  />
                </div>

                {/* Position Y Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-neutral-400">
                    <span>Vertical Height Shift</span>
                    <span className="text-white font-bold">{positionY}px</span>
                  </div>
                  <input
                    type="range"
                    min="-150"
                    max="150"
                    step="5"
                    value={positionY}
                    onChange={(e) => setPositionY(parseInt(e.target.value))}
                    className="w-full accent-amber-400 bg-neutral-950 cursor-pointer h-1.5 rounded-lg"
                  />
                </div>
              </div>

              {/* Snapshots Gallery */}
              {snapshots.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-neutral-800">
                  <span className="text-xs font-mono uppercase text-neutral-400 block">
                    Captured Photos ({snapshots.length})
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {snapshots.map((snap, idx) => (
                      <div key={idx} className="relative group shrink-0">
                        <img
                          src={snap}
                          alt="Snapshot"
                          className="w-14 h-16 object-cover rounded-lg border border-neutral-700 bg-neutral-950"
                        />
                        <a
                          href={snap}
                          download={`ELAN-TryOn-${product.name}.png`}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg text-amber-300"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Add to Cart Action */}
            <div className="pt-4 border-t border-neutral-800 space-y-2">
              <button
                onClick={() => {
                  if (onAddToCart) {
                    onAddToCart(product, product.sizes[0] || 'M', currentColor);
                    setAddedToCartToast(true);
                    setTimeout(() => setAddedToCartToast(false), 2500);
                  }
                }}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                {addedToCartToast ? (
                  <>
                    <Check className="w-4 h-4 text-neutral-950" />
                    <span>Added {currentColor.name} to Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add {currentColor.name} to Bag</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Hidden Canvas for High Res Snapshot Processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};
