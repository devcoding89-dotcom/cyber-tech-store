import { useState } from 'react';
import { Search, Eye, Package, Truck, CheckCircle, XCircle, Clock, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useAdminStore } from '@/store/adminStore';
import { updateOrderStatus, addTrackingUpdate } from '@/lib/supabase';
import type { Order, OrderStatus } from '@/types/database';

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  paid: 'bg-blue-500/20 text-blue-400',
  processing: 'bg-purple-500/20 text-purple-400',
  shipped: 'bg-cyan-500/20 text-cyan-400',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

const statusIcons: Record<OrderStatus, typeof Clock> = {
  pending: Clock,
  paid: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

export default function OrdersManager() {
  const { orders, setOrders } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [trackingUpdate, setTrackingUpdate] = useState('');
  const [trackingLocation, setTrackingLocation] = useState('');

  const filteredOrders = orders.filter(o =>
    o.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customer_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const success = await updateOrderStatus(orderId, newStatus);
    if (success) {
      setOrders(orders.map(o => 
        o.order_id === orderId ? { ...o, status: newStatus } : o
      ));
    }
  };

  const handleAddTracking = async () => {
    if (!selectedOrder || !trackingUpdate.trim()) return;

    await addTrackingUpdate({
      order_id: selectedOrder.order_id,
      status: selectedOrder.status,
      description: trackingUpdate,
      location: trackingLocation || undefined,
    });

    setTrackingUpdate('');
    setTrackingLocation('');
  };

  const openWhatsApp = (phone: string, orderId: string) => {
    const message = `Hello! Regarding your order ${orderId} from Cyber Tech Store.`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders..."
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-[#FFD700]/50 transition-all"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-400">
            {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-white/10 to-white/5">
              <tr>
                <th className="text-left px-6 py-4 text-gray-400 text-sm font-semibold uppercase tracking-wider">Order ID</th>
                <th className="text-left px-6 py-4 text-gray-400 text-sm font-semibold uppercase tracking-wider">Customer</th>
                <th className="text-left px-6 py-4 text-gray-400 text-sm font-semibold uppercase tracking-wider">Amount</th>
                <th className="text-left px-6 py-4 text-gray-400 text-sm font-semibold uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-gray-400 text-sm font-semibold uppercase tracking-wider">Date</th>
                <th className="text-right px-6 py-4 text-gray-400 text-sm font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 stagger-fade-in">
              {filteredOrders.map((order, index) => {
                const StatusIcon = statusIcons[order.status];
                return (
                  <tr 
                    key={order.order_id} 
                    className="hover:bg-white/5 transition-all duration-200 hover:scale-[1.01] hover:shadow-md"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white text-sm font-semibold font-mono">{order.order_id}</p>
                        <p className="text-gray-500 text-xs">TRK: {order.tracking_id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white text-sm font-medium">{order.customer_name}</p>
                        <p className="text-gray-500 text-xs">{order.customer_email}</p>
                        <p className="text-gray-600 text-xs">{order.whatsapp_number}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#FFD700] font-bold text-sm">₦{(order.total_amount || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`${statusColors[order.status]} text-xs capitalize font-semibold px-3 py-1`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-400 text-sm">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openWhatsApp(order.whatsapp_number, order.order_id)}
                          className="w-9 h-9 text-green-400 hover:text-green-300 hover:bg-green-500/10 transition-all"
                          title="Contact on WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsDialogOpen(true);
                          }}
                          className="w-9 h-9 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                          title="View order details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-500 text-lg font-medium">No orders found</p>
            <p className="text-gray-600 text-sm mt-1">
              {searchQuery ? 'Try adjusting your search terms' : 'Orders will appear here when customers make purchases'}
            </p>
          </div>
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl bg-[#0f0f14] border-white/10 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-['Orbitron'] text-xl">Order Details</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-8 mt-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass rounded-xl p-6">
                  <h4 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">Order Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Order ID</span>
                      <span className="text-white font-mono font-semibold">{selectedOrder.order_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tracking ID</span>
                      <span className="text-[#FFD700] font-mono font-semibold">{selectedOrder.tracking_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date</span>
                      <span className="text-white">
                        {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status</span>
                      <Badge className={`${statusColors[selectedOrder.status]} text-xs capitalize font-semibold`}>
                        {selectedOrder.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-xl p-6">
                  <h4 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">Customer Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Name</span>
                      <span className="text-white font-medium">{selectedOrder.customer_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email</span>
                      <span className="text-white">{selectedOrder.customer_email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">WhatsApp</span>
                      <span className="text-green-400 font-medium">{selectedOrder.whatsapp_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Amount</span>
                      <span className="text-[#FFD700] font-bold text-lg">₦{(selectedOrder.total_amount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="glass rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white font-['Orbitron'] mb-6">Order Items</h4>
                <div className="space-y-4">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover shadow-md" />
                      <div className="flex-1">
                        <p className="text-white text-sm font-semibold">{item.name}</p>
                        <p className="text-gray-500 text-xs">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#FFD700] font-bold">₦{(item.price * item.quantity).toLocaleString()}</p>
                        <p className="text-gray-500 text-xs">₦{item.price.toLocaleString()} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Update */}
              <div className="glass rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white font-['Orbitron'] mb-6">Update Order Status</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {(['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      onClick={() => handleStatusChange(selectedOrder.order_id, status)}
                      className={`capitalize h-12 ${
                        selectedOrder.status === status
                          ? 'gradient-gold text-black shadow-lg glow-gold'
                          : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
                      } transition-all`}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Add Tracking Update */}
              <div className="glass rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white font-['Orbitron'] mb-6">Add Tracking Update</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      value={trackingUpdate}
                      onChange={(e) => setTrackingUpdate(e.target.value)}
                      placeholder="e.g., Order shipped via DHL"
                      className="bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-[#FFD700]/50"
                    />
                    <Input
                      value={trackingLocation}
                      onChange={(e) => setTrackingLocation(e.target.value)}
                      placeholder="Location (optional)"
                      className="bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-[#FFD700]/50"
                    />
                  </div>
                  <Button
                    onClick={handleAddTracking}
                    disabled={!trackingUpdate.trim()}
                    className="btn-primary hover:scale-105 transition-transform"
                  >
                    Add Tracking Update
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
