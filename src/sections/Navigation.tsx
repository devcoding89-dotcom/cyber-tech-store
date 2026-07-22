import { useState, useEffect } from 'react';
import { ShoppingCart, Menu, Phone, Zap, BatteryCharging, Home, MapPin, Shield, Cable } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navLinks = [
  { name: 'Home', href: '#home', icon: Home },
  { name: 'Phones', href: '#phones', icon: Phone },
  { name: 'Chargers', href: '#chargers', icon: Zap },
  { name: 'Powerbanks', href: '#powerbanks', icon: BatteryCharging },
  { name: 'Accessories', href: '#accessories', icon: Cable },
  { name: 'Track Order', href: '#tracking', icon: MapPin },
];

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toggleCart, getTotalItems } = useCartStore();
  const cartItemCount = getTotalItems();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'glass py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => scrollToSection('#home')}
            className="flex items-center gap-2 group"
          >
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute inset-0 gradient-gold rounded-lg rotate-45 group-hover:rotate-90 transition-transform duration-500" />
              <span className="relative text-black font-bold text-lg font-['Orbitron']">C</span>
            </div>
            <span className="text-xl font-bold font-['Orbitron'] text-white group-hover:text-[#3B82F6] transition-colors">
              CYBER TECH<span className="text-[#3B82F6]"> STORE</span>
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => scrollToSection(link.href)}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300 flex items-center gap-2"
              >
                <link.icon className="w-4 h-4" />
                {link.name}
              </button>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Admin Link */}
            <Link
              to="/admin"
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-400 hover:text-[#3B82F6] transition-colors"
            >
              <Shield className="w-4 h-4" />
              Admin
            </Link>

            {/* Cart Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCart}
              className="relative hover:bg-white/10 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-gray-300" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 gradient-gold text-black text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                  {cartItemCount}
                </span>
              )}
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="hover:bg-white/10">
                  <Menu className="w-5 h-5 text-gray-300" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-[#030712] border-l border-white/10">
                <div className="flex flex-col gap-4 mt-8">
                  {navLinks.map((link) => (
                    <button
                      key={link.name}
                      onClick={() => scrollToSection(link.href)}
                      className="px-4 py-3 text-lg font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300 flex items-center gap-3 text-left"
                    >
                      <link.icon className="w-5 h-5 text-[#3B82F6]" />
                      {link.name}
                    </button>
                  ))}
                  <Link
                    to="/admin"
                    className="px-4 py-3 text-lg font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300 flex items-center gap-3"
                  >
                    <Shield className="w-5 h-5 text-[#9333EA]" />
                    Admin Portal
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
