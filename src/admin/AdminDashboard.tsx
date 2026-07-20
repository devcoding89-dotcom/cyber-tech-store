import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingBag, Users, 
  LogOut, TrendingUp, Menu, ChevronRight, DollarSign, AlertCircle, PackageCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminStore } from '@/store/adminStore';
import { getAllProducts, getAllOrders } from '@/lib/supabase';
import ProductsManager from './ProductsManager';
import OrdersManager from './OrdersManager';
import Analytics from './Analytics';

type TabType = 'dashboard' | 'products' | 'orders' | 'analytics';

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { products, orders, setProducts, setOrders, setLoading } = useAdminStore();
  const navigate = useNavigate();

  // Load data on mount
  useEffect(() => {
    loadData();
    // Also set up a refresh interval to keep data fresh
    const interval = setInterval(loadData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Reload data when switching to products tab
  useEffect(() => {
    if (activeTab === 'products') {
      loadData();
    }
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, ordersData] = await Promise.all([
        getAllProducts(),
        getAllOrders()
      ]);
      setProducts(productsData);
      setOrders(ordersData);
      console.log('✅ Data loaded:', { products: productsData.length, orders: ordersData.length });
    } catch (error) {
      console.error('❌ Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    lowStock: products.filter(p => p.stock < 10).length,
  };

  const formatPrice = (price: number) => {
    return '₦' + price.toLocaleString('en-NG');
  };

  const menuItems = [
    { id: 'dashboard' as TabType, name: 'Dashboard', icon: LayoutDashboard },
    { id: 'products' as TabType, name: 'Products', icon: Package },
    { id: 'orders' as TabType, name: 'Orders', icon: ShoppingBag },
    { id: 'analytics' as TabType, name: 'Analytics', icon: TrendingUp },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-fade-in">
              {[
                { label: 'Total Products', value: stats.totalProducts, icon: Package, color: '#FFD700', trend: '+2' },
                { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: '#06B6D4', trend: '+12' },
                { label: 'Revenue', value: formatPrice(stats.totalRevenue), icon: DollarSign, color: '#10B981', trend: '+18%' },
                { label: 'Pending Orders', value: stats.pendingOrders, icon: AlertCircle, color: '#F59E0B', trend: stats.pendingOrders > 0 ? 'Action needed' : 'All clear' },
              ].map((stat, index) => (
                <div 
                  key={stat.label} 
                  className="glass rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                      <p className="text-3xl font-bold text-white font-['Orbitron'] mt-2">{stat.value}</p>
                      <p className="text-xs mt-1" style={{ color: stat.color }}>{stat.trend}</p>
                    </div>
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center glow-gold"
                      style={{ backgroundColor: `${stat.color}20` }}
                    >
                      <stat.icon className="w-7 h-7" style={{ color: stat.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Orders */}
              <div className="glass rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white font-['Orbitron']">Recent Orders</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setActiveTab('orders')}
                    className="text-[#FFD700] hover:text-[#FFD700] hover:bg-[#FFD700]/10 transition-all"
                  >
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <div className="space-y-4 stagger-fade-in">
                  {orders.slice(0, 5).map((order, index) => (
                    <div 
                      key={order.order_id} 
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#FFD700]/20 flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-[#FFD700]" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{order.order_id}</p>
                          <p className="text-gray-500 text-xs">{order.customer_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[#FFD700] font-semibold text-sm">₦{(order.total_amount || 0).toLocaleString()}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                          order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <div className="text-center py-8">
                      <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500">No orders yet</p>
                      <p className="text-gray-600 text-sm mt-1">New orders will appear here</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Low Stock Alert */}
              <div className="glass rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white font-['Orbitron']">Low Stock Alert</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setActiveTab('products')}
                    className="text-[#FFD700] hover:text-[#FFD700] hover:bg-[#FFD700]/10 transition-all"
                  >
                    Manage <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <div className="space-y-4 stagger-fade-in">
                  {products.filter(p => p.stock < 10).slice(0, 5).map((product, index) => (
                    <div 
                      key={product.id} 
                      className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{product.name}</p>
                        <p className="text-gray-500 text-xs">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                          product.stock <= 5 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {product.stock} left
                        </span>
                      </div>
                    </div>
                  ))}
                  {stats.lowStock === 0 && (
                    <div className="flex items-center gap-3 py-8">
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                        <PackageCheck className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <span className="text-green-400 font-medium">All products are well stocked!</span>
                        <p className="text-gray-500 text-sm">No low stock alerts</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white font-['Orbitron'] mb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  onClick={() => setActiveTab('products')}
                  className="h-20 flex flex-col items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10"
                  variant="ghost"
                >
                  <Package className="w-6 h-6 text-[#FFD700]" />
                  <span className="text-sm">Add Product</span>
                </Button>
                <Button
                  onClick={() => setActiveTab('orders')}
                  className="h-20 flex flex-col items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10"
                  variant="ghost"
                >
                  <ShoppingBag className="w-6 h-6 text-[#06B6D4]" />
                  <span className="text-sm">View Orders</span>
                </Button>
                <Button
                  onClick={() => setActiveTab('analytics')}
                  className="h-20 flex flex-col items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10"
                  variant="ghost"
                >
                  <TrendingUp className="w-6 h-6 text-[#10B981]" />
                  <span className="text-sm">Analytics</span>
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  className="h-20 flex flex-col items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10"
                  variant="ghost"
                >
                  <Users className="w-6 h-6 text-[#9333EA]" />
                  <span className="text-sm">View Store</span>
                </Button>
              </div>
            </div>
          </div>
        );
      case 'products':
        return <ProductsManager />;
      case 'orders':
        return <OrdersManager />;
      case 'analytics':
        return <Analytics />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 glass border-r border-white/10 
        flex flex-col transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center">
              <span className="text-black font-bold text-lg font-['Orbitron']">C</span>
            </div>
            <div>
              <h1 className="text-white font-bold font-['Orbitron']">CYBER TECH</h1>
              <p className="text-[#FFD700] text-xs">Admin Portal</p>
            </div>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false); // Close sidebar on mobile after selection
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === item.id
                      ? 'gradient-gold text-black shadow-lg glow-gold'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Back to Store */}
        <div className="px-4 py-2">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-[#FFD700] hover:bg-white/5 transition-all"
          >
            <Users className="w-5 h-5" />
            Back to Store
          </button>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <Button
            onClick={onLogout}
            variant="ghost"
            className="w-full flex items-center gap-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <header className="lg:hidden glass sticky top-0 z-30 border-b border-white/10 px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="text-white hover:bg-white/10"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h2 className="text-lg font-bold text-white font-['Orbitron'] capitalize">
              {activeTab}
            </h2>
            <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center">
              <Users className="w-5 h-5 text-black" />
            </div>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:block glass sticky top-0 z-10 border-b border-white/10 px-8 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white font-['Orbitron'] capitalize">
              {activeTab}
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">Welcome back, Admin</span>
              <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center">
                <Users className="w-5 h-5 text-black" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
