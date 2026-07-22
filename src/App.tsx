import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navigation from './sections/Navigation';
import Hero from './sections/Hero';
import Products from './sections/Products';
import PhonesSection from './sections/PhonesSection';
import ChargersSection from './sections/ChargersSection';
import PowerbanksSection from './sections/PowerbanksSection';
import OrderTracking from './sections/OrderTracking';
import Cart from './sections/Cart';
import Footer from './sections/Footer';
import AdminApp from './admin/AdminApp';
import { getAllProducts } from './lib/supabase';
import { useAdminStore } from './store/adminStore';

function MainApp() {
  const { setProducts } = useAdminStore();
  const location = useLocation();

  useEffect(() => {
    // Load products from Supabase on mount
    const loadProducts = async () => {
      const products = await getAllProducts();
      if (products.length > 0) {
        setProducts(products);
      }
    };
    loadProducts();
  }, []);

  // Scroll to section based on hash
  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-x-hidden">
      <Navigation />
      <main>
        <Hero />
        <Products />
        <PhonesSection />
        <ChargersSection />
        <PowerbanksSection />
        <OrderTracking />
      </main>
      <Footer />
      <Cart />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainApp />} />
      <Route path="/admin" element={<AdminApp />} />
      <Route path="/admin/*" element={<AdminApp />} />
    </Routes>
  );
}

export default App;
