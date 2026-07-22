import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Upload, ImageIcon, RotateCw, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useAdminStore } from '@/store/adminStore';
import { createProduct, updateProduct, deleteProduct, getAllProducts } from '@/lib/supabase';
import { uploadProductImage } from '@/lib/imageUpload';
import type { Product, Category } from '@/types/database';

const categories: { value: Category; label: string }[] = [
  { value: 'phones', label: 'Phones' },
  { value: 'chargers', label: 'Chargers' },
  { value: 'powerbanks', label: 'Powerbanks' },
  { value: 'accessories', label: 'Accessories' },
];

export default function ProductsManager() {
  const { products, addProduct, updateProduct: updateProductInStore, removeProduct, setProducts } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [imageInputMethod, setImageInputMethod] = useState<'url' | 'upload'>('url'); // Default to URL input

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    category: 'phones' as Category,
    image: '',
    stock: '',
    rating: '4.5',
    reviews: '0',
    features: '',
    badge: '',
    is_new: false,
    is_bestseller: false,
  });

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      original_price: '',
      category: 'phones',
      image: '',
      stock: '',
      rating: '4.5',
      reviews: '0',
      features: '',
      badge: '',
      is_new: false,
      is_bestseller: false,
    });
    setImagePreview('');
    setImageInputMethod('url');
    setEditingProduct(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, image: base64String });
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      original_price: product.original_price?.toString() || '',
      category: product.category,
      image: product.image,
      stock: product.stock.toString(),
      rating: product.rating.toString(),
      reviews: product.reviews.toString(),
      features: product.features.join(', '),
      badge: product.badge || '',
      is_new: product.is_new || false,
      is_bestseller: product.is_bestseller || false,
    });
    setImagePreview(product.image);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    const success = await deleteProduct(id);
    if (success) {
      removeProduct(id);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await getAllProducts();
      setProducts(data);
      console.log('✅ Products refreshed:', data.length);
      alert(`✅ Refreshed! Found ${data.length} products`);
    } catch (error) {
      console.error('Error refreshing products:', error);
      alert('Failed to refresh products. Check console for details.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      alert('Please enter a product name');
      return;
    }
    if (!formData.description.trim()) {
      alert('Please enter a product description');
      return;
    }
    const priceVal = parseFloat(formData.price);
    if (!formData.price || isNaN(priceVal) || priceVal <= 0) {
      alert('Please enter a valid price');
      return;
    }
    const stockVal = parseInt(formData.stock, 10);
    if (formData.stock === '' || isNaN(stockVal) || stockVal < 0) {
      alert('Please enter valid stock quantity');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('📝 Starting product submission:', formData.name);
      
      // Use image URL or upload if it's base64, or use placeholder
      let imageUrl = formData.image?.trim() || '';

      if (imageUrl && !imageUrl.startsWith('data:') && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        imageUrl = 'https://' + imageUrl;
      }
      
      if (!imageUrl) {
        // Use a default placeholder image
        imageUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';
        console.log('📦 Using placeholder image');
      } else if (imageUrl.startsWith('data:')) {
        // Only upload if it's a base64 encoded image
        console.log('🖼️ Uploading product image...');
        const uploadedUrl = await uploadProductImage(imageUrl, formData.name);
        
        if (!uploadedUrl) {
          console.warn('⚠️ Image upload failed, using placeholder');
          imageUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';
        } else {
          imageUrl = uploadedUrl;
        }
      }

      const origPriceVal = formData.original_price ? parseFloat(formData.original_price) : null;
      const ratingVal = formData.rating ? parseFloat(formData.rating) : 4.5;
      const reviewsVal = formData.reviews ? parseInt(formData.reviews, 10) : 0;

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: priceVal,
        original_price: (origPriceVal !== null && !isNaN(origPriceVal)) ? origPriceVal : undefined,
        category: formData.category,
        image: imageUrl,
        stock: stockVal,
        rating: isNaN(ratingVal) ? 4.5 : ratingVal,
        reviews: isNaN(reviewsVal) ? 0 : reviewsVal,
        features: formData.features ? formData.features.split(',').map(f => f.trim()).filter(Boolean) : [],
        badge: formData.badge?.trim() || undefined,
        is_new: Boolean(formData.is_new),
        is_bestseller: Boolean(formData.is_bestseller),
      };

      console.log('📝 Submitting product to database:', productData.name);

      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, productData);
        if (updated) {
          updateProductInStore(editingProduct.id, updated);
          console.log('✅ Product updated successfully');
          alert('Product updated successfully!');
        } else {
          console.error('Failed to update product');
          alert('Failed to update product. Please check database permissions or try again.');
        }
      } else {
        const created = await createProduct(productData);
        if (created) {
          addProduct(created);
          console.log('✅ Product created successfully:', created);
          alert('Product created successfully!');
        } else {
          console.error('Failed to create product');
          alert('Failed to create product. Please check database permissions or try again.');
        }
      }

      // Re-sync with Supabase to make sure list is 100% fresh
      const updatedList = await getAllProducts();
      if (updatedList && updatedList.length > 0) {
        setProducts(updatedList);
      }
    } catch (error) {
      console.error('Error submitting product:', error);
      alert('An error occurred while saving. Check console for details.');
    } finally {
      setIsSubmitting(false);
      setIsDialogOpen(false);
      resetForm();
    }
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
              placeholder="Search products..."
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-[#EF4444]/50 transition-all"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            className="border-white/10 hover:bg-white/5 text-gray-300 hover:text-white"
          >
            <RotateCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={resetForm}
                className="btn-primary hover:scale-105 transition-transform shadow-lg glow-gold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl bg-[#100000] border-white/10 text-white max-h-[90vh] overflow-y-auto z-[100]">
            <DialogHeader>
              <DialogTitle className="text-white font-['Orbitron'] text-xl">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              {/* Name and Category Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Product Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Category *</Label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                    className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-[#EF4444]/50"
                  >
                    {categories.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-white">Description *</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter product description"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  required
                />
              </div>

              {/* Price Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Price (₦) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Original Price (₦)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    placeholder="0.00"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Stock and Badge Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Stock *</Label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Badge (optional)</Label>
                  <Input
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="Hot, New, Sale..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Image Section - Optional */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Product Image (Optional)</Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setImageInputMethod('url')}
                      className={`text-xs px-2 py-1 rounded ${
                        imageInputMethod === 'url'
                          ? 'bg-[#EF4444] text-black'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMethod('upload')}
                      className={`text-xs px-2 py-1 rounded ${
                        imageInputMethod === 'upload'
                          ? 'bg-[#EF4444] text-black'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      Upload
                    </button>
                  </div>
                </div>

                {imageInputMethod === 'url' ? (
                  <div className="space-y-2">
                    <Input
                      type="text"
                      value={formData.image}
                      onChange={(e) => {
                        setFormData({ ...formData, image: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                      placeholder="https://example.com/image.jpg"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                    />
                    <p className="text-xs text-gray-400">
                      Paste an image URL or leave empty to use a placeholder
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label 
                      htmlFor="image-upload"
                      className="flex items-center justify-center w-full h-40 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-red-500/50 hover:bg-white/5 transition-all bg-white/2"
                    >
                      <div className="text-center">
                        {imagePreview ? (
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-full h-full object-contain p-2 rounded-lg"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Building2 className="w-8 h-8 text-gray-500" />
                            <span className="text-sm text-gray-300">Click to upload image</span>
                            <span className="text-xs text-gray-500">JPG, PNG up to 5MB</span>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                )}

                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      setFormData({ ...formData, image: '' });
                    }}
                    className="text-xs text-red-400 hover:text-red-300 mt-2"
                  >
                    Clear image
                  </button>
                )}
              </div>

              {/* Rating and Reviews Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Rating</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    placeholder="4.5"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Reviews Count</Label>
                  <Input
                    type="number"
                    value={formData.reviews}
                    onChange={(e) => setFormData({ ...formData, reviews: e.target.value })}
                    placeholder="0"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <Label className="text-white">Features (comma separated)</Label>
                <Input
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Feature 1, Feature 2, Feature 3"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>

              {/* Checkboxes */}
              <div className="flex gap-6 py-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_new}
                    onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 accent-[#EF4444] cursor-pointer"
                  />
                  <span className="text-sm text-gray-300">Mark as New Product</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_bestseller}
                    onChange={(e) => setFormData({ ...formData, is_bestseller: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 accent-[#EF4444] cursor-pointer"
                  />
                  <span className="text-sm text-gray-300">Mark as Bestseller</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-6 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 border-white/10 text-gray-300 hover:bg-white/5 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#EF4444] text-black hover:bg-[#EF4444]/90 font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? '� Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products Table */}
      <div className="glass rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-white/10 to-white/5">
              <tr>
                <th className="text-left px-6 py-4 text-gray-400 text-sm font-semibold uppercase tracking-wider">Product</th>
                <th className="text-left px-6 py-4 text-gray-400 text-sm font-semibold uppercase tracking-wider">Category</th>
                <th className="text-left px-6 py-4 text-gray-400 text-sm font-semibold uppercase tracking-wider">Price</th>
                <th className="text-left px-6 py-4 text-gray-400 text-sm font-semibold uppercase tracking-wider">Stock</th>
                <th className="text-left px-6 py-4 text-gray-400 text-sm font-semibold uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-4 text-gray-400 text-sm font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 stagger-fade-in">
              {filteredProducts.map((product, index) => (
                <tr 
                  key={product.id} 
                  className="hover:bg-white/5 transition-all duration-200 hover:scale-[1.01] hover:shadow-md"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover shadow-md"
                        />
                        {product.is_new && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">N</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">{product.name}</p>
                        {product.badge && (
                          <Badge className="mt-1 text-xs gradient-gold text-black">{product.badge}</Badge>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-300 text-sm capitalize font-medium">{product.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className="text-[#EF4444] font-bold text-sm">₦{product.price.toLocaleString()}</span>
                      {product.original_price && (
                        <span className="text-gray-500 text-xs line-through ml-2 block">₦{product.original_price.toLocaleString()}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                      product.stock > 20 ? 'bg-green-500/20 text-green-400' :
                      product.stock > 10 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {product.stock} units
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {product.is_new && (
                        <Badge className="bg-blue-500/20 text-blue-400 text-xs">NEW</Badge>
                      )}
                      {product.is_bestseller && (
                        <Badge className="bg-red-500/20 text-[#EF4444] text-xs">BEST</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(product)}
                        className="w-9 h-9 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                        title="Edit product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(product.id)}
                        className="w-9 h-9 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-500 text-lg font-medium">No products found</p>
            <p className="text-gray-600 text-sm mt-1">
              {searchQuery ? 'Try adjusting your search terms' : 'Add your first product to get started'}
            </p>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
