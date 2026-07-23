import { useState } from 'react';
import { ShoppingCart, Star, Check, Plus, Minus, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/types/database';
import { useCartStore } from '@/store/cartStore';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailsModal({ product, isOpen, onClose }: ProductDetailsModalProps) {
  const { addItem, getItemCount, updateQuantity } = useCartStore();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showAdded, setShowAdded] = useState(false);

  if (!product) return null;

  const itemCount = getItemCount(product.id);
  
  // Combine main image and extra images
  const allImages = [product.image, ...(product.images || [])].filter(Boolean);

  const handleAddToCart = () => {
    addItem(product);
    setShowAdded(true);
    setTimeout(() => setShowAdded(false), 1500);
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = itemCount + delta;
    updateQuantity(product.id, newQuantity);
  };

  const formatPrice = (price: number) => {
    return '₦' + price.toLocaleString('en-NG');
  };

  // Calculate discount percentage if original price is available
  const discountPercentage = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl bg-[#020510] border-white/10 text-white max-h-[90vh] overflow-y-auto z-[100] p-0 rounded-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>{product.description}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:divide-x md:divide-white/5">
          {/* Left: Images Gallery */}
          <div className="p-6 md:p-8 flex flex-col justify-between gap-6">
            {/* Main Image Container */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-b from-[#1a1a20] to-[#020510] border border-white/5 flex items-center justify-center">
              <img
                src={allImages[activeImageIndex] || product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
              
              {/* Floating Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {product.badge && (
                  <Badge className="gradient-gold text-black font-bold text-xs px-3 py-1 rounded-md">
                    {product.badge}
                  </Badge>
                )}
                {product.is_new && (
                  <Badge className="bg-[#3B82F6] text-white font-bold text-xs px-3 py-1 rounded-md">
                    NEW ARRIVAL
                  </Badge>
                )}
                {discountPercentage > 0 && (
                  <Badge className="bg-red-500 text-white font-bold text-xs px-3 py-1 rounded-md">
                    -{discountPercentage}% OFF
                  </Badge>
                )}
              </div>
            </div>

            {/* Thumbnail Row */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      activeImageIndex === idx
                        ? 'border-[#3B82F6] scale-95 shadow-md shadow-blue-500/20'
                        : 'border-white/5 hover:border-white/20'
                    }`}
                  >
                    <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info and Action Details */}
          <div className="p-6 md:p-8 flex flex-col gap-6">
            <div>
              {/* Category */}
              <span className="text-xs text-[#3B82F6] font-semibold tracking-widest uppercase mb-2 block font-['Orbitron']">
                {product.category}
              </span>

              {/* Title */}
              <h2 className="text-2xl md:text-3xl font-bold font-['Orbitron'] text-white leading-tight mb-3">
                {product.name}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'fill-[#3B82F6] text-[#3B82F6]'
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-400 font-semibold">
                  {product.rating.toFixed(1)} ({product.reviews.toLocaleString()} verified reviews)
                </span>
              </div>
            </div>

            {/* Price & Discounts */}
            <div className="bg-white/2 border border-white/5 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Price</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-[#3B82F6] font-['Orbitron']">
                    {formatPrice(product.price)}
                  </span>
                  {product.original_price && (
                    <span className="text-gray-500 line-through text-md">
                      {formatPrice(product.original_price)}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Stock Indicator */}
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Availability</p>
                {product.stock > 10 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-green-400 font-semibold bg-green-500/10 px-3 py-1 rounded-full">
                    <Check className="w-3.5 h-3.5" /> In Stock
                  </span>
                ) : product.stock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-yellow-400 font-semibold bg-yellow-500/10 px-3 py-1 rounded-full">
                    <AlertCircle className="w-3.5 h-3.5" /> Only {product.stock} left
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 px-3 py-1 rounded-full">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-sm text-gray-400 font-bold font-['Orbitron'] uppercase tracking-wider">
                Product Description
              </h4>
              <p className="text-sm text-gray-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Features list */}
            {product.features && product.features.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm text-gray-400 font-bold font-['Orbitron'] uppercase tracking-wider">
                  Key Qualities
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <div className="w-4 h-4 rounded-full bg-blue-500/10 flex items-center justify-center text-[#3B82F6] flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart Actions */}
            <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-4 items-center">
              {itemCount > 0 ? (
                <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-1.5 w-full sm:w-auto justify-between sm:justify-start">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleQuantityChange(-1)}
                    className="w-10 h-10 hover:bg-white/10 text-white rounded-lg"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-white font-bold w-12 text-center text-lg">{itemCount}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleQuantityChange(1)}
                    disabled={itemCount >= product.stock}
                    className="w-10 h-10 hover:bg-white/10 text-white rounded-lg"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ) : null}

              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`w-full py-6 text-md font-bold font-['Orbitron'] transition-all rounded-xl flex-1 ${
                  showAdded
                    ? 'bg-green-500 text-white hover:bg-green-500'
                    : 'gradient-gold text-black hover:opacity-90 hover:scale-[1.02] active:scale-95 shadow-lg shadow-gold/25'
                }`}
              >
                {showAdded ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    ADDED TO CART!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    ADD TO CART
                  </>
                )}
              </Button>
            </div>

            {/* Trust Policy */}
            <div className="flex items-center justify-center gap-6 text-xs text-gray-500 pt-2">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span>1 Year Warranty</span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                <span>Genuine Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
