import { useState } from 'react';
import { ArrowLeft, MessageCircle, Send, User, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCartStore } from '@/store/cartStore';
import { generateOrderId, generateTrackingId, createOrder } from '@/lib/supabase';

interface WhatsAppCheckoutProps {
  onClose: () => void;
  onSuccess: (orderId: string, trackingId: string) => void;
}

const WHATSAPP_NUMBER = '2349138987295';

export default function WhatsAppCheckout({ onClose, onSuccess }: WhatsAppCheckoutProps) {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const totalAmount = getTotalPrice();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerInfo.name || !customerInfo.phone) {
      return;
    }

    setIsSubmitting(true);

    // Generate order and tracking IDs
    const orderId = generateOrderId();
    const trackingId = generateTrackingId();

    // Build WhatsApp message
    const itemsList = items.map(item => 
      `• ${item.name} x${item.quantity} - ₦${(item.price * item.quantity).toLocaleString()}`
    ).join('%0A');

    const message = 
      `*NEW ORDER - CYBER TECH STORE*%0A%0A` +
      `*Order ID:* ${orderId}%0A` +
      `*Tracking ID:* ${trackingId}%0A%0A` +
      `*Customer Details:*%0A` +
      `Name: ${customerInfo.name}%0A` +
      `Email: ${customerInfo.email || 'N/A'}%0A` +
      `Phone: ${customerInfo.phone}%0A%0A` +
      `*Order Items:*%0A${itemsList}%0A%0A` +
      `*Total Amount: ₦${totalAmount.toLocaleString()}*%0A%0A` +
      `Please confirm my order. Thank you!`;

    // Save order to Supabase
    try {
      await createOrder({
        order_id: orderId,
        tracking_id: trackingId,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email || 'N/A',
        customer_phone: customerInfo.phone,
        whatsapp_number: WHATSAPP_NUMBER,
        items: items.map(item => ({
          product_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        total_amount: totalAmount,
        status: 'pending',
        payment_status: 'pending'
      });
    } catch (dbErr) {
      console.error('Error saving order to Supabase:', dbErr);
    }

    // Clear cart immediately upon ordering
    clearCart();

    // Open WhatsApp
    const url = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${message}`;
    window.open(url, '_blank');

    // Success
    setIsSubmitting(false);
    onSuccess(orderId, trackingId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto glass rounded-2xl p-6 md:p-8 border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white font-['Orbitron']">Checkout</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full gradient-gold text-black text-sm flex items-center justify-center font-bold">1</span>
              Your Details
            </h3>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-gray-300 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name *
                </Label>
                <Input
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email (optional)
                </Label>
                <Input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  placeholder="your@email.com"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number *
                </Label>
                <Input
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  placeholder="08012345678"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                  required
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full gradient-gold text-black text-sm flex items-center justify-center font-bold">2</span>
              Order Summary
            </h3>
            
            <div className="bg-white/5 rounded-xl p-4 space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-300">{item.name} x{item.quantity}</span>
                  <span className="text-white">₦{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-white/10 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-[#3B82F6] font-bold text-lg">{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-white font-semibold">Pay via WhatsApp</p>
                <p className="text-gray-400 text-sm">You will be redirected to WhatsApp to complete your order</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-white/10 hover:bg-white/5"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-6"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Order on WhatsApp
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
