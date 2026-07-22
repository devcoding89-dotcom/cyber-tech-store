import { useEffect } from 'react';
import { Check, MessageCircle, Package, Truck, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderSuccessProps {
  orderId: string;
  trackingId: string;
  onClose: () => void;
}

const WHATSAPP_NUMBER = '2349138987295';

export default function OrderSuccess({ orderId, trackingId, onClose }: OrderSuccessProps) {
  const openWhatsApp = () => {
    const message = `Hello Cyber Tech Store!%0A%0A` +
      `I just placed an order.%0A%0A` +
      `*Order ID:* ${orderId}%0A` +
      `*Tracking ID:* ${trackingId}%0A%0A` +
      `Please confirm my order.`;
    
    const url = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${message}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="w-full max-w-lg glass rounded-2xl p-8 border border-white/10 text-center">
        {/* Success Animation */}
        <div className="relative mb-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-green-500/30 flex items-center justify-center animate-pulse">
              <Check className="w-10 h-10 text-green-400" />
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-white font-['Orbitron'] mb-2">
          Order Sent!
        </h2>
        <p className="text-gray-400 mb-8">
          Your order details have been sent to us on WhatsApp. We will confirm shortly.
        </p>

        {/* Order Details */}
        <div className="bg-white/5 rounded-xl p-6 mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <div className="text-left">
                <p className="text-gray-500 text-xs">Order ID</p>
                <p className="text-white font-mono font-semibold">{orderId}</p>
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(orderId)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Copy Order ID"
            >
              <Copy className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#06B6D4]/20 flex items-center justify-center">
                <Truck className="w-5 h-5 text-[#06B6D4]" />
              </div>
              <div className="text-left">
                <p className="text-gray-500 text-xs">Tracking ID</p>
                <p className="text-[#06B6D4] font-mono font-semibold">{trackingId}</p>
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(trackingId)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Copy Tracking ID"
            >
              <Copy className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* WhatsApp CTA */}
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            Please confirm your order by sending the message on WhatsApp.
          </p>
          
          <Button
            onClick={openWhatsApp}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-6 text-lg"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Continue to WhatsApp
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>

          <Button
            variant="outline"
            onClick={onClose}
            className="w-full border-white/10 hover:bg-white/5"
          >
            Continue Shopping
          </Button>
        </div>

        {/* Tracking Info */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-gray-500 text-sm">
            You can track your order anytime using your Tracking ID
          </p>
        </div>
      </div>
    </div>
  );
}
