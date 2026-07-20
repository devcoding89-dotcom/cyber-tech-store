import { useState, useEffect, useRef } from 'react';
import { Phone, Zap, BatteryCharging, Shield, Flame, Sparkles, TrendingUp, Cable } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductCard from '@/components/ProductCard';
import { getAllProducts } from '@/lib/supabase';
import type { Product, Category } from '@/types/database';

const categories = [
  { id: 'featured' as const, name: 'Featured', icon: Flame, description: 'Handpicked best sellers' },
  { id: 'phones' as Category, name: 'Phones', icon: Phone, description: 'Latest smartphones' },
  { id: 'chargers' as Category, name: 'Chargers', icon: Zap, description: 'Fast chargers & cables' },
  { id: 'powerbanks' as Category, name: 'Powerbanks', icon: BatteryCharging, description: 'High-capacity power banks' },
  { id: 'accessories' as Category, name: 'Accessories', icon: Cable, description: 'Cases, protectors & other gear' },
];

export default function Products() {
  const [isVisible, setIsVisible] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
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

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    loadProducts();
    // Set up interval to refresh products every 5 seconds
    const interval = setInterval(loadProducts, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProducts = (category: string): Product[] => {
    if (category === 'featured') {
      return products.filter(p => p.is_bestseller || p.is_new).slice(0, 8);
    }
    return products.filter(p => p.category === category);
  };

  const scrollToCategory = (categoryId: string) => {
    const element = document.querySelector(`#${categoryId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section ref={sectionRef} className="relative py-24 bg-[#0a0a0f]">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#9333EA]/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Badge className="mb-4 bg-white/5 text-[#FFD700] border-[#FFD700]/30">
            <Sparkles className="w-3 h-3 mr-1" />
            Our Products
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold font-['Orbitron'] text-white mb-4">
            EXPLORE OUR <span className="text-[#FFD700]">COLLECTION</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Browse our extensive collection of premium phones, high-speed chargers, high-capacity power banks, and accessories. 
            All products come with direct support and full warranty.
          </p>
        </div>

        {/* Category Tabs */}
        <Tabs defaultValue="featured" className="w-full">
          <div className={`flex justify-center mb-12 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="data-[state=active]:gradient-gold data-[state=active]:text-black px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-all"
                >
                  <category.icon className="w-4 h-4 mr-2" />
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {categories.map((category) => {
            const categoryProducts = getProducts(category.id);
            return (
            <TabsContent key={category.id} value={category.id} className="mt-0">
              <div className={`transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                {/* Category Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white font-['Orbitron'] flex items-center gap-2">
                      <category.icon className="w-6 h-6 text-[#FFD700]" />
                      {category.name}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">{category.description}</p>
                  </div>
                </div>

                {/* Products Grid */}
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-gray-400">Loading products...</div>
                  </div>
                ) : categoryProducts.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-gray-500 text-center">
                      <p className="text-lg font-semibold">No products available</p>
                      <p className="text-sm mt-1">Check back soon for more items</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categoryProducts.slice(0, 4).map((product, index) => (
                      <ProductCard key={product.id} product={product} index={index} />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            );
          })}
        </Tabs>

        {/* Trust Badges */}
        <div className={`mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {[
            { icon: TrendingUp, title: 'Best Prices', desc: 'Competitive rates' },
            { icon: Sparkles, title: 'Genuine Tech', desc: '100% authentic' },
            { icon: Flame, title: 'Warranty', desc: 'Full product coverage' },
            { icon: Shield, title: 'Secure Shop', desc: 'Buyer protection' },
          ].map((badge) => (
            <div
              key={badge.title}
              className="glass rounded-xl p-6 text-center hover:bg-white/10 transition-colors group"
            >
              <badge.icon className="w-8 h-8 text-[#FFD700] mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="text-white font-semibold mb-1">{badge.title}</h4>
              <p className="text-gray-500 text-sm">{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
