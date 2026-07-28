import React, { useEffect, useState } from 'react';
import { catalogService, type ProductData, type CategoryData, type CreateProductPayload } from '../../../services/catalogService';
import toast from 'react-hot-toast';
import {
  ShoppingBag,
  Plus,
  Edit2,
  Trash2,
  Search,
  Star,
  X,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [formData, setFormData] = useState<{
    category: number;
    name: string;
    description: string;
    mrp: number | string;
    offer_price: number | string;
    stock_quantity: number;
    is_active: boolean;
    is_featured: boolean;
    badge: string;
    primary_image_url: string;
  }>({
    category: 0,
    name: '',
    description: '',
    mrp: '',
    offer_price: '',
    stock_quantity: 0,
    is_active: true,
    is_featured: false,
    badge: '',
    primary_image_url: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cats, prods] = await Promise.all([
        catalogService.getCategories(),
        catalogService.getProducts({
          category: selectedCategory || undefined,
          search: search || undefined,
        }),
      ]);
      setCategories(cats);

      let filtered = prods;
      if (stockFilter === 'low') {
        filtered = prods.filter((p: ProductData) => Number(p.stock_quantity) > 0 && Number(p.stock_quantity) <= 5);
      } else if (stockFilter === 'out') {
        filtered = prods.filter((p: ProductData) => Number(p.stock_quantity) === 0);
      }
      setProducts(filtered);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, selectedCategory, stockFilter]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      category: categories[0]?.id || 0,
      name: '',
      description: '',
      mrp: '',
      offer_price: '',
      stock_quantity: 10,
      is_active: true,
      is_featured: false,
      badge: '',
      primary_image_url: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: ProductData) => {
    setEditingProduct(p);
    setFormData({
      category: p.category,
      name: p.name,
      description: p.description || '',
      mrp: p.mrp,
      offer_price: p.offer_price,
      stock_quantity: p.stock_quantity,
      is_active: p.is_active,
      is_featured: p.is_featured,
      badge: p.badge || '',
      primary_image_url: p.primary_image_url || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }

    try {
      setSubmitting(true);
      const payload: CreateProductPayload = {
        ...formData,
        mrp: Number(formData.mrp),
        offer_price: Number(formData.offer_price),
        stock_quantity: Number(formData.stock_quantity),
      };

      if (editingProduct) {
        await catalogService.updateProduct(editingProduct.id, payload);
        toast.success('Product updated successfully');
      } else {
        await catalogService.createProduct(payload);
        toast.success('Product created successfully');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await catalogService.deleteProduct(id);
      toast.success('Product deleted');
      loadData();
    } catch {
      toast.error('Could not delete product');
    }
  };

  const toggleFeatured = async (p: ProductData) => {
    try {
      await catalogService.updateProduct(p.id, { is_featured: !p.is_featured });
      toast.success(`${p.name} ${!p.is_featured ? 'featured on homepage' : 'removed from featured'}`);
      loadData();
    } catch {
      toast.error('Update failed');
    }
  };

  const toggleActive = async (p: ProductData) => {
    try {
      await catalogService.updateProduct(p.id, { is_active: !p.is_active });
      toast.success(`${p.name} ${!p.is_active ? 'published to storefront' : 'hidden from storefront'}`);
      loadData();
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-gray/40 pb-6">
        <div>
          <h1 className="font-brand text-3xl text-charcoal mb-1">Products</h1>
          <p className="text-[13px] text-mid-gray font-light">Manage catalog items, pricing, inventory & low-stock alerts</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-brass text-charcoal px-5 py-2.5 rounded-xl text-[12px] font-semibold hover:bg-brass-hover transition-all shadow-sm active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Toolbar / Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-warm-white p-4 rounded-2xl border border-warm-gray/50 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative max-w-xs flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-mid-gray absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-porcelain/60 border border-warm-gray/40 rounded-xl pl-10 pr-4 py-2 text-xs text-charcoal focus:outline-none focus:border-brass"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : '')}
            className="bg-porcelain/60 border border-warm-gray/40 rounded-xl px-3 py-2 text-xs text-charcoal focus:outline-none focus:border-brass"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e: any) => setStockFilter(e.target.value)}
            className="bg-porcelain/60 border border-warm-gray/40 rounded-xl px-3 py-2 text-xs text-charcoal focus:outline-none focus:border-brass"
          >
            <option value="all">All Inventory</option>
            <option value="low">Low Stock (&le; 5)</option>
            <option value="out">Out of Stock (0)</option>
          </select>
        </div>

        <span className="text-[11px] text-mid-gray font-medium">Total: {products.length} Products</span>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-brass border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-xs font-medium text-mid-gray uppercase tracking-widest">Loading Catalog…</span>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-warm-white border border-dashed border-warm-gray rounded-2xl p-12 text-center shadow-sm">
          <ShoppingBag className="w-10 h-10 text-mid-gray/30 mx-auto mb-3" />
          <h3 className="text-base font-bold text-charcoal mb-1">No Products Match Your Criteria</h3>
          <p className="text-[13px] text-mid-gray font-light mb-4">Add your first studio product to display it on the storefront.</p>
          <button onClick={openCreateModal} className="btn-primary">Add Product</button>
        </div>
      ) : (
        <div className="bg-warm-white border border-warm-gray/50 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-warm-gray/40 bg-porcelain/40 text-[10px] uppercase tracking-widest text-mid-gray font-bold">
                <th className="py-3.5 px-6">Product</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6 text-right">Selling Price</th>
                <th className="py-3.5 px-6 text-center">Stock Level</th>
                <th className="py-3.5 px-6 text-center">Status</th>
                <th className="py-3.5 px-6 text-center">Homepage</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-gray/30 text-xs text-charcoal">
              {products.map((p) => {
                const isOut = Number(p.stock_quantity) === 0;
                const isLow = Number(p.stock_quantity) > 0 && Number(p.stock_quantity) <= 5;

                return (
                  <tr key={p.id} className="hover:bg-porcelain/30 transition-colors">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-porcelain border border-warm-gray/40 overflow-hidden shrink-0">
                          {p.primary_image_url ? (
                            <img src={p.primary_image_url} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-mid-gray/40">
                              <ShoppingBag className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-charcoal">{p.name}</div>
                          {p.badge && (
                            <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-brass bg-brass/10 border border-brass/20 px-2 py-0.5 rounded mt-0.5">
                              {p.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-6 text-mid-gray font-medium">{p.category_name}</td>

                    <td className="py-3 px-6 text-right">
                      <div className="font-bold text-charcoal">₹{p.offer_price}</div>
                      {p.mrp !== p.offer_price && (
                        <div className="text-[10px] text-mid-gray line-through">₹{p.mrp}</div>
                      )}
                    </td>

                    {/* Stock Level Indicator */}
                    <td className="py-3 px-6 text-center">
                      {isOut ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-error bg-error/10 border border-error/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          <AlertTriangle className="w-3 h-3" /> Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          <AlertTriangle className="w-3 h-3" /> Low Stock ({p.stock_quantity})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success bg-success/10 border border-success/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          <CheckCircle className="w-3 h-3" /> {p.stock_quantity} Units
                        </span>
                      )}
                    </td>

                    {/* Active Status */}
                    <td className="py-3 px-6 text-center">
                      <button
                        onClick={() => toggleActive(p)}
                        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition-all ${
                          p.is_active
                            ? 'bg-charcoal text-warm-white'
                            : 'bg-warm-gray/40 text-mid-gray'
                        }`}
                      >
                        {p.is_active ? <Eye className="w-3 h-3 text-brass" /> : <EyeOff className="w-3 h-3" />}
                        {p.is_active ? 'Live' : 'Hidden'}
                      </button>
                    </td>

                    {/* Featured Toggle */}
                    <td className="py-3 px-6 text-center">
                      <button
                        onClick={() => toggleFeatured(p)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          p.is_featured
                            ? 'bg-brass/20 text-brass border-brass/40'
                            : 'text-mid-gray/40 border-warm-gray/40 hover:text-brass'
                        }`}
                        title={p.is_featured ? 'Featured on Home' : 'Not Featured'}
                      >
                        <Star className={`w-4 h-4 ${p.is_featured ? 'fill-brass' : ''}`} />
                      </button>
                    </td>

                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-2 border border-warm-gray/40 rounded-lg text-mid-gray hover:text-brass hover:border-brass/30 transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-2 border border-warm-gray/40 rounded-lg text-mid-gray hover:text-error hover:border-error/30 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-warm-white border border-warm-gray/60 rounded-2xl w-full max-w-2xl shadow-2xl p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-warm-gray/40 pb-4">
              <h3 className="font-brand text-2xl text-charcoal">
                {editingProduct ? 'Edit Studio Product' : 'New Studio Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-mid-gray hover:text-charcoal transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: Number(e.target.value) })}
                    className="input-field"
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label">Product Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Imperial Brass Porcelain Bowl"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Description</label>
                <textarea
                  placeholder="Material specs, craft details, firing temperature…"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="input-label">MRP (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="2200"
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="input-label">Offer Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="1850"
                    value={formData.offer_price}
                    onChange={(e) => setFormData({ ...formData, offer_price: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="input-label">Stock Quantity *</label>
                  <input
                    type="number"
                    placeholder="15"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Badge Tag</label>
                  <select
                    value={formData.badge || ''}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="input-field"
                  >
                    <option value="">No Badge</option>
                    <option value="Best Seller">Best Seller</option>
                    <option value="Artisan Pick">Artisan Pick</option>
                    <option value="New Arrival">New Arrival</option>
                    <option value="Limited Run">Limited Run</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Primary Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/…"
                    value={formData.primary_image_url}
                    onChange={(e) => setFormData({ ...formData, primary_image_url: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="accent-brass w-4 h-4 rounded"
                  />
                  <span className="text-charcoal font-medium">Visible on Storefront</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="accent-brass w-4 h-4 rounded"
                  />
                  <span className="text-charcoal font-medium">Feature on Homepage</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-warm-gray/40">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-brass text-charcoal rounded-xl py-3 text-xs font-semibold hover:bg-brass-hover transition-all shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving…' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 border border-warm-gray/50 rounded-xl text-xs font-medium text-mid-gray hover:border-charcoal transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminProducts;
