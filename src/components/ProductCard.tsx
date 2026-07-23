import { useState } from 'react';
import { ShoppingCart, Star, Check, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/types/database';
import { useCartStore } from '@/store/cartStore';
import ProductDetailsModal from './ProductDetailsModal';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showAdded, setShowAdded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addItem, getItemCount, updateQuantity } = useCartStore();
  const itemCount = getItemCount(product.id);

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

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Don't open modal if clicking on buttons or icons inside buttons
    if (target.closest('button')) {
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <>
      <div
        className="group relative bg-[#020510] rounded-2xl overflow-hidden border border-white/5 card-hover cursor-pointer h-full flex flex-col justify-between"
        style={{
          animationDelay: `${index * 0.1}s`,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        <div>
          {/* Badge */}
          {product.badge && (
            <div className="absolute top-3 left-3 z-10">
              <Badge className="gradient-gold text-black font-semibold text-xs px-2 py-1">
                {product.badge}
              </Badge>
            </div>
          )}

          {product.is_new && !product.badge && (
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-[#06B6D4] text-white font-semibold text-xs px-2 py-1">
                NEW
              </Badge>
            </div>
          )}

          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-[#1a1a20] to-[#020510]">
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-500 ${
                isHovered ? 'scale-110' : 'scale-100'
              }`}
            />
            
            {/* Overlay on hover */}
            <div
              className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="text-center p-4">
                <p className="text-sm text-gray-300 mb-2">View Details</p>
                {itemCount > 0 ? (
                  <div className="flex items-center gap-3 bg-white/10 rounded-lg p-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleQuantityChange(-1)}
                      className="w-8 h-8 hover:bg-white/20"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-white font-semibold w-8">{itemCount}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleQuantityChange(1)}
                      className="w-8 h-8 hover:bg-white/20"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleAddToCart}
                    className="gradient-gold text-black hover:opacity-90"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Rating */}
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-3 h-3 fill-[#3B82F6] text-[#3B82F6]" />
              <span className="text-xs text-gray-400">
                {product.rating} ({product.reviews.toLocaleString()})
              </span>
            </div>

            {/* Title */}
            <h3 className="text-white font-semibold text-sm mb-1 line-clamp-1 group-hover:text-[#3B82F6] transition-colors font-['Orbitron']">
              {product.name}
            </h3>

            {/* Description */}
            <p className="text-gray-500 text-xs mb-3 line-clamp-2">
              {product.description}
            </p>

            {/* Features */}
            <div className="flex flex-wrap gap-1 mb-3">
              {product.features && product.features.slice(0, 2).map((feature) => (
                <span
                  key={feature}
                  className="text-[10px] px-2 py-0.5 bg-white/5 text-gray-400 rounded"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Price & Stock */}
        <div className="p-4 pt-0 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[#3B82F6] font-bold text-lg font-['Orbitron']">
                {formatPrice(product.price)}
              </span>
              {product.original_price && (
                <span className="text-gray-600 text-sm line-through">
                  {formatPrice(product.original_price)}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {product.stock > 50 ? 'In Stock' : `${product.stock} left`}
            </p>
          </div>

          {/* Add Button */}
          <Button
            size="icon"
            onClick={handleAddToCart}
            className={`w-10 h-10 rounded-full transition-all duration-300 ${
              showAdded
                ? 'bg-green-500 hover:bg-green-500'
                : 'gradient-gold hover:opacity-90'
            }`}
          >
            {showAdded ? (
              <Check className="w-5 h-5 text-white" />
            ) : (
              <ShoppingCart className="w-5 h-5 text-black" />
            )}
          </Button>
        </div>

        {/* Hover Border Effect */}
        <div
          className={`absolute inset-0 rounded-2xl border-2 transition-all duration-300 pointer-events-none ${
            isHovered ? 'border-blue-500/50' : 'border-transparent'
          }`}
        />
      </div>

      <ProductDetailsModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
