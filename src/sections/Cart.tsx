import { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, Package, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/store/cartStore';
import WhatsAppCheckout from '@/components/WhatsAppCheckout';
import OrderSuccess from '@/components/OrderSuccess';

export default function Cart() {
  const { items, isOpen, setCartOpen, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderDetails, setOrderDetails] = useState<{ orderId: string; trackingId: string } | null>(null);

  const totalPrice = getTotalPrice();

  const handleCheckoutSuccess = (orderId: string, trackingId: string) => {
    setOrderDetails({ orderId, trackingId });
    setShowCheckout(false);
    setOrderComplete(true);
  };

  const handleCloseSuccess = () => {
    setOrderComplete(false);
    setOrderDetails(null);
    setCartOpen(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setCartOpen}>
        <SheetContent className="w-full sm:max-w-lg bg-[#0a0000] border-l border-white/10 flex flex-col">
          <SheetHeader className="space-y-2.5 pb-4">
            <SheetTitle className="flex items-center gap-2 text-white font-['Orbitron']">
              <ShoppingCart className="w-5 h-5 text-[#EF4444]" />
              Your Cart
              {items.length > 0 && (
                <span className="text-sm text-gray-400 font-normal">
                  ({items.length} {items.length === 1 ? 'item' : 'items'})
                </span>
              )}
            </SheetTitle>
          </SheetHeader>

          <Separator className="bg-white/10" />

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <Package className="w-12 h-12 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Your cart is empty</h3>
              <p className="text-gray-500 max-w-xs mb-6">
                Looks like you haven&apos;t added anything to your cart yet.
              </p>
              <Button
                onClick={() => setCartOpen(false)}
                className="gradient-gold text-black hover:opacity-90"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    {/* Image */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#1a1a20] flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium text-sm truncate">{item.name}</h4>
                      <p className="text-gray-500 text-xs mb-2 line-clamp-1">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[#EF4444] font-semibold">
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </span>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-white text-sm w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-500 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <Separator className="bg-white/10" />

              {/* Summary */}
              <div className="py-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Delivery</span>
                  <span className="text-green-400">Free</span>
                </div>
                <Separator className="bg-white/10" />
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-[#EF4444] font-['Orbitron']">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={() => { setCartOpen(false); setShowCheckout(true); }}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-6 text-lg"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Order on WhatsApp
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCartOpen(false)}
                  className="w-full border-white/10 hover:bg-white/5"
                >
                  Continue Shopping
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* WhatsApp Checkout Modal */}
      {showCheckout && (
        <WhatsAppCheckout
          onClose={() => setShowCheckout(false)}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      {/* Order Success Modal */}
      {orderComplete && orderDetails && (
        <OrderSuccess
          orderId={orderDetails.orderId}
          trackingId={orderDetails.trackingId}
          onClose={handleCloseSuccess}
        />
      )}
    </>
  );
}
