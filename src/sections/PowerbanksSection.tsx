import { useState, useEffect, useRef } from 'react';
import { BatteryCharging, Filter, ChevronDown, Check, Star, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ProductCard from '@/components/ProductCard';
import { getAllProducts } from '@/lib/supabase';
import type { Product } from '@/types/database';

type SortOption = 'featured' | 'price-low' | 'price-high' | 'rating';

export default function PowerbanksSection() {
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [isVisible, setIsVisible] = useState(false);
  const [powerbanks, setPowerbanks] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    // Robust fallback to ensure content is visible on mobile
    const fallbackTimeout = setTimeout(() => {
      setIsVisible(true);
    }, 400);

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimeout);
    };
  }, []);

  useEffect(() => {
    loadPowerbanks();
    // Refresh powerbanks every 5 seconds
    const interval = setInterval(loadPowerbanks, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadPowerbanks = async () => {
    try {
      const allProducts = await getAllProducts();
      setPowerbanks(allProducts.filter(p => p.category === 'powerbanks'));
    } catch (error) {
      console.error('Error loading powerbanks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sortProducts = (products: Product[]): Product[] => {
    switch (sortBy) {
      case 'price-low':
        return [...products].sort((a, b) => a.price - b.price);
      case 'price-high':
        return [...products].sort((a, b) => b.price - a.price);
      case 'rating':
        return [...products].sort((a, b) => b.rating - a.rating);
      default:
        return products;
    }
  };

  const sortedPowerbanks = sortProducts(powerbanks);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  return (
    <section ref={sectionRef} id="powerbanks" className="relative py-24 bg-[#030712] border-t border-white/5">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-[#06B6D4]/5 rounded-full blur-[200px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div>
            <Badge className="mb-4 bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/30">
              <BatteryCharging className="w-3 h-3 mr-1" />
              Portable Power
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold font-['Orbitron'] text-white mb-4">
              PREMIUM <span className="text-[#06B6D4]">POWERBANKS</span>
            </h2>
            <p className="text-gray-400 max-w-xl">
              Stay charged wherever you go. Explore high-capacity portable power banks with fast USB-C Power Delivery (PD) outputs.
            </p>
          </div>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-white/10 hover:bg-white/5">
                <Filter className="w-4 h-4 mr-2" />
                Sort by: {sortOptions.find(o => o.value === sortBy)?.label}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#020510] border-white/10">
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className="text-gray-300 hover:text-white hover:bg-white/5 cursor-pointer"
                >
                  {sortBy === option.value && (
                    <Check className="w-4 h-4 mr-2 text-[#06B6D4]" />
                  )}
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats Bar */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {[
            { label: 'Max Capacity', value: '50,000 mAh' },
            { label: 'Output Ports', value: 'Triple USB' },
            { label: 'Avg Rating', value: '4.7' },
            { label: 'Safety standard', value: 'Aviation Safe' },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-[#06B6D4] font-['Orbitron']">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">Loading powerbanks...</div>
          </div>
        ) : sortedPowerbanks.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500 text-center">
              <p className="text-lg font-semibold">No powerbanks available</p>
              <p className="text-sm mt-1">Admin will upload items shortly</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedPowerbanks.map((powerbank, index) => (
              <div
                key={powerbank.id}
                className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${150 + index * 50}ms` }}
              >
                <ProductCard product={powerbank} />
              </div>
            ))}
          </div>
        )}

        {/* Features */}
        <div className={`mt-16 glass rounded-2xl p-8 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'High-Density Cells',
                desc: 'Premium lithium polymer cells packed into compact, portable designs.',
                icon: BatteryCharging,
              },
              {
                title: 'Universal Compatibility',
                desc: 'Charges iPhone, Android, tablets, smart watches, and wireless earbuds.',
                icon: Star,
              },
              {
                title: 'Multi-Protection Shield',
                desc: 'Safeguards your devices against short circuits, over-voltage, and over-current.',
                icon: Shield,
              },
            ].map((feature) => (
              <div key={feature.title} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#06B6D4]/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-[#06B6D4]" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">{feature.title}</h4>
                  <p className="text-gray-500 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
