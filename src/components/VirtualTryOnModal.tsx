import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, RefreshCw, Upload, Maximize2 } from 'lucide-react';
import { Product } from '../types';

interface VirtualTryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const VirtualTryOnModal: React.FC<VirtualTryOnModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Camera access denied or unavailable.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
          <h3 className="text-white font-serif text-lg">Virtual Try-On: {product.name}</h3>
          <button onClick={onClose} className="p-2 bg-black/40 rounded-full text-white hover:bg-black/60">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Feed */}
        <div className="relative aspect-video bg-black flex items-center justify-center">
          {error ? (
            <p className="text-rose-400 font-mono text-sm">{error}</p>
          ) : (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          )}

          {/* Product Overlay */}
          <motion.img
            drag
            src={product.images[0]}
            alt="Virtual Try-On Overlay"
            className="absolute w-1/2 h-auto object-contain cursor-move"
            initial={{ opacity: 0.8 }}
            whileHover={{ scale: 1.05 }}
          />
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-950 flex justify-between items-center">
          <p className="text-[10px] text-neutral-500 font-mono">
            Drag product to position · Camera feed active
          </p>
          <button onClick={startCamera} className="flex items-center gap-2 text-xs font-mono text-amber-400 hover:text-white">
            <RefreshCw className="w-3.5 h-3.5" /> Restart Camera
          </button>
        </div>
      </motion.div>
    </div>
  );
};
