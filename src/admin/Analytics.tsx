import { useMemo } from 'react';
import { TrendingUp, DollarSign, Package, Users, ShoppingBag } from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';

export default function Analytics() {
  const { products, orders } = useAdminStore();

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const ordersByStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const ordersByCategory = orders.reduce((acc, order) => {
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.product_id);
        if (product) {
          acc[product.category] = (acc[product.category] || 0) + item.quantity;
        }
      });
      return acc;
    }, {} as Record<string, number>);

    const topProducts = [...products]
      .sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
      .slice(0, 5);

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      avgOrderValue,
      ordersByStatus,
      ordersByCategory,
      topProducts,
    };
  }, [orders, products]);

  const formatPrice = (price: number) => {
    return '₦' + price.toLocaleString('en-NG');
  };

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'Total Revenue', 
            value: formatPrice(stats.totalRevenue), 
            icon: DollarSign, 
            color: '#10B981',
            trend: '+12%'
          },
          { 
            label: 'Total Orders', 
            value: stats.totalOrders.toString(), 
            icon: ShoppingBag, 
            color: '#06B6D4',
            trend: '+8%'
          },
          { 
            label: 'Avg Order Value', 
            value: formatPrice(stats.avgOrderValue), 
            icon: TrendingUp, 
            color: '#EF4444',
            trend: '+5%'
          },
          { 
            label: 'Products', 
            value: stats.totalProducts.toString(), 
            icon: Package, 
            color: '#9333EA',
            trend: '+3'
          },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
              <span className="text-green-400 text-sm font-medium">{stat.trend}</span>
            </div>
            <p className="text-gray-400 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold text-white font-['Orbitron'] mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Orders by Status</h3>
          <div className="space-y-3">
            {Object.entries(stats.ordersByStatus).map(([status, count]) => {
              const percentage = (count / stats.totalOrders) * 100;
              const colors: Record<string, string> = {
                pending: 'bg-yellow-500',
                paid: 'bg-blue-500',
                processing: 'bg-purple-500',
                shipped: 'bg-cyan-500',
                delivered: 'bg-green-500',
                cancelled: 'bg-red-500',
              };
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-300 text-sm capitalize">{status}</span>
                    <span className="text-white text-sm">{count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${colors[status] || 'bg-gray-500'} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {Object.keys(stats.ordersByStatus).length === 0 && (
              <p className="text-gray-500 text-center py-4">No order data available</p>
            )}
          </div>
        </div>

        {/* Sales by Category */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Sales by Category</h3>
          <div className="space-y-3">
            {Object.entries(stats.ordersByCategory).map(([category, count]) => {
              const totalItems = Object.values(stats.ordersByCategory).reduce((a, b) => a + b, 0);
              const percentage = totalItems > 0 ? (count / totalItems) * 100 : 0;
              const colors: Record<string, string> = {
                phones: 'bg-[#EF4444]',
                accounts: 'bg-[#9333EA]',
                cp: 'bg-[#06B6D4]',
              };
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-300 text-sm capitalize">{category}</span>
                    <span className="text-white text-sm">{count} items ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${colors[category] || 'bg-gray-500'} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {Object.keys(stats.ordersByCategory).length === 0 && (
              <p className="text-gray-500 text-center py-4">No sales data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Top Products</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.topProducts.map((product) => (
            <div key={product.id} className="bg-white/5 rounded-xl p-4">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-24 object-cover rounded-lg mb-3"
              />
              <p className="text-white text-sm font-medium truncate">{product.name}</p>
              <p className="text-[#EF4444] text-sm">₦{product.price.toLocaleString()}</p>
              <p className="text-gray-500 text-xs">{product.reviews} reviews</p>
            </div>
          ))}
          {stats.topProducts.length === 0 && (
            <p className="text-gray-500 text-center col-span-full py-4">No products available</p>
          )}
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Business Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3">
              <Users className="w-8 h-8 text-[#EF4444]" />
            </div>
            <p className="text-2xl font-bold text-white">{orders.length}</p>
            <p className="text-gray-500 text-sm">Total Customers</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#06B6D4]/20 flex items-center justify-center mx-auto mb-3">
              <Package className="w-8 h-8 text-[#06B6D4]" />
            </div>
            <p className="text-2xl font-bold text-white">
              {products.filter(p => p.stock > 0).length}
            </p>
            <p className="text-gray-500 text-sm">In Stock Products</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#10B981]/20 flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-8 h-8 text-[#10B981]" />
            </div>
            <p className="text-2xl font-bold text-white">
              {orders.filter(o => o.status === 'delivered').length}
            </p>
            <p className="text-gray-500 text-sm">Completed Orders</p>
          </div>
        </div>
      </div>
    </div>
  );
}
