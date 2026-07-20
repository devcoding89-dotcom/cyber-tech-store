import { useState } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, MapPin, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface TrackingStep {
  status: string;
  description: string;
  location?: string;
  timestamp: string;
  completed: boolean;
  current: boolean;
}

const WHATSAPP_NUMBER = '2349138987295';

export default function OrderTracking() {
  const [trackingId, setTrackingId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [orderFound, setOrderFound] = useState(false);
  const [trackingData, setTrackingData] = useState<{
    orderId: string;
    status: string;
    steps: TrackingStep[];
  } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    setIsSearching(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock data for demo
    if (trackingId.toUpperCase().startsWith('TRK-')) {
      setOrderFound(true);
      setTrackingData({
        orderId: 'ORD-' + trackingId.slice(4),
        status: 'shipped',
        steps: [
          {
            status: 'Order Placed',
            description: 'Your order has been received and is being processed',
            timestamp: '2024-01-15 10:30 AM',
            completed: true,
            current: false,
          },
          {
            status: 'Payment Confirmed',
            description: 'Payment has been successfully processed',
            timestamp: '2024-01-15 10:35 AM',
            completed: true,
            current: false,
          },
          {
            status: 'Processing',
            description: 'Your order is being prepared',
            timestamp: '2024-01-15 02:00 PM',
            completed: true,
            current: false,
          },
          {
            status: 'Shipped',
            description: 'Your order has been shipped',
            location: 'Distribution Center',
            timestamp: '2024-01-16 09:00 AM',
            completed: true,
            current: true,
          },
          {
            status: 'Delivered',
            description: 'Your order will be delivered soon',
            timestamp: '',
            completed: false,
            current: false,
          },
        ],
      });
    } else {
      setOrderFound(false);
      setTrackingData(null);
    }

    setIsSearching(false);
  };

  const openWhatsApp = () => {
    const message = `Hello Cyber Tech Store!%0AI'm checking on my order.%0A*Tracking ID:* ${trackingId}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    window.open(url, '_blank');
  };

  return (
    <section id="tracking" className="relative py-24 bg-[#0a0a0f]">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#06B6D4]/5 rounded-full blur-[200px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold font-['Orbitron'] text-white mb-4">
            TRACK YOUR <span className="text-[#06B6D4]">ORDER</span>
          </h2>
          <p className="text-gray-400">
            Enter your tracking ID to check the status of your order
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-12">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="Enter tracking ID (e.g., TRK-XXXXXX)"
                className="pl-12 py-6 bg-white/5 border-white/10 text-white placeholder:text-gray-600 text-lg"
              />
            </div>
            <Button
              type="submit"
              disabled={isSearching || !trackingId.trim()}
              className="btn-primary px-8"
            >
              {isSearching ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Searching...
                </span>
              ) : (
                'Track'
              )}
            </Button>
          </div>
        </form>

        {/* Results */}
        {orderFound && trackingData && (
          <div className="glass rounded-2xl p-8 border border-[#06B6D4]/20">
            {/* Order Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-gray-500 text-sm mb-1">Order ID</p>
                <p className="text-white font-mono text-lg">{trackingData.orderId}</p>
              </div>
              <Badge className="bg-[#06B6D4]/20 text-[#06B6D4] text-sm px-4 py-1 capitalize">
                {trackingData.status}
              </Badge>
            </div>

            {/* Progress Timeline */}
            <div className="space-y-6">
              {trackingData.steps.map((step, index) => (
                <div key={step.status} className="relative flex gap-4">
                  {/* Connector Line */}
                  {index < trackingData.steps.length - 1 && (
                    <div 
                      className={`absolute left-5 top-10 w-0.5 h-full ${
                        step.completed ? 'bg-[#06B6D4]' : 'bg-white/10'
                      }`}
                    />
                  )}

                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    step.completed 
                      ? 'bg-[#06B6D4]' 
                      : step.current 
                        ? 'bg-[#06B6D4]/20 border-2 border-[#06B6D4]' 
                        : 'bg-white/10'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : step.current ? (
                      <Truck className="w-5 h-5 text-[#06B6D4]" />
                    ) : (
                      <Clock className="w-5 h-5 text-gray-500" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <h4 className={`font-semibold ${
                      step.completed || step.current ? 'text-white' : 'text-gray-500'
                    }`}>
                      {step.status}
                    </h4>
                    <p className="text-gray-400 text-sm mt-1">{step.description}</p>
                    {step.location && (
                      <p className="flex items-center gap-1 text-[#06B6D4] text-sm mt-1">
                        <MapPin className="w-3 h-3" />
                        {step.location}
                      </p>
                    )}
                    {step.timestamp && (
                      <p className="text-gray-500 text-xs mt-2">{step.timestamp}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Support */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <Button
                onClick={openWhatsApp}
                variant="outline"
                className="w-full border-green-500/30 text-green-400 hover:bg-green-500/10"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Contact Support on WhatsApp
              </Button>
            </div>
          </div>
        )}

        {/* Not Found */}
        {!orderFound && trackingId && !isSearching && (
          <div className="text-center py-12 glass rounded-2xl">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Order Not Found</h3>
            <p className="text-gray-500 mb-6">
              We couldn&apos;t find an order with that tracking ID. Please check and try again.
            </p>
            <Button
              onClick={openWhatsApp}
              variant="outline"
              className="border-green-500/30 text-green-400 hover:bg-green-500/10"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact Support on WhatsApp
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
