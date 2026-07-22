import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCartStore } from '@/store/cartStore';
import { generateOrderId, generateTrackingId } from '@/lib/supabase';
import type { Order } from '@/types/database';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

interface StripeCheckoutProps {
  onClose: () => void;
  onSuccess: (orderId: string, trackingId: string) => void;
}

function CheckoutForm({ onClose, onSuccess }: StripeCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { items, getTotalPrice, clearCart } = useCartStore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
  });

  const totalAmount = getTotalPrice();
  const finalAmount = totalAmount * 1.08; // Including 8% tax

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      setError('Stripe is not loaded yet. Please try again.');
      return;
    }

    if (!customerInfo.name || !customerInfo.email || !customerInfo.whatsapp) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Check if Stripe key is configured
      if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY === 'your-stripe-key-here') {
        setError('Payment system not configured. Please contact admin or use WhatsApp checkout.');
        setIsProcessing(false);
        return;
      }

      // Create payment method
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement)!,
        billing_details: {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
        },
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        setIsProcessing(false);
        return;
      }

      // Generate order and tracking IDs
      const orderId = generateOrderId();
      const trackingId = generateTrackingId();

      // Create order object (in production, send to your backend)
      const orderData: Omit<Order, 'id' | 'created_at'> = {
        order_id: orderId,
        tracking_id: trackingId,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone || customerInfo.whatsapp,
        whatsapp_number: customerInfo.whatsapp,
        items: items.map(item => ({
          product_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        total_amount: finalAmount,
        status: 'pending',
        payment_status: 'paid',
        stripe_payment_intent_id: paymentMethod.id,
      };

      // For demo purposes - simulate payment processing
      // In production, this would call your backend API to create a PaymentIntent
      console.log('Payment method created:', paymentMethod.id);
      console.log('Order data:', orderData);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time

      // Success!
      clearCart();
      onSuccess(orderId, trackingId);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        '::placeholder': {
          color: '#6b7280',
        },
      },
      invalid: {
        color: '#3B82F6',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-full gradient-gold text-black text-sm flex items-center justify-center font-bold">1</span>
          Customer Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Full Name *</Label>
            <Input
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
              placeholder="John Doe"
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Email *</Label>
            <Input
              type="email"
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
              placeholder="john@example.com"
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Phone Number</Label>
            <Input
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
              placeholder="+1 234 567 890"
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">WhatsApp Number *</Label>
            <Input
              value={customerInfo.whatsapp}
              onChange={(e) => setCustomerInfo({ ...customerInfo, whatsapp: e.target.value })}
              placeholder="+1234567890"
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
              required
            />
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-full gradient-gold text-black text-sm flex items-center justify-center font-bold">2</span>
          Payment Details
        </h3>
        
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <Label className="text-gray-300 mb-2 block">Card Information</Label>
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <CardElement options={cardElementOptions} />
          </div>
          <div className="flex items-center gap-2 mt-3 text-gray-500 text-sm">
            <Lock className="w-4 h-4" />
            <span>Your payment is secured with SSL encryption</span>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Order Summary</h3>
        <div className="bg-white/5 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Subtotal</span>
            <span className="text-white">${totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Tax (8%)</span>
            <span className="text-white">${(totalAmount * 0.08).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Shipping</span>
            <span className="text-green-400">Free</span>
          </div>
          <div className="border-t border-white/10 pt-2 mt-2">
            <div className="flex justify-between">
              <span className="text-white font-semibold">Total</span>
              <span className="text-[#3B82F6] font-bold text-lg">${finalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1 border-white/10 hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cart
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 btn-primary py-6"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Pay ${finalAmount.toFixed(2)}
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}

export default function StripeCheckoutWrapper({ onClose, onSuccess }: StripeCheckoutProps) {
  return (
    <Elements stripe={stripePromise}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass rounded-2xl p-6 md:p-8 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white font-['Orbitron']">Checkout</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              ×
            </button>
          </div>
          <CheckoutForm onClose={onClose} onSuccess={onSuccess} />
        </div>
      </div>
    </Elements>
  );
}
