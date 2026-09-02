import React, { useEffect, useState } from 'react';
import {
  catalogService,
  type ProductData,
  type CategoryData,
  type SubCategoryData,
  type CreateProductPayload,
  type ProductImageData,
} from '../../../services/catalogService';
import toast from 'react-hot-toast';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Star,
  X,
  Upload,
  Eye,
  EyeOff,
  Image as ImageIcon,
} from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | ''>('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [productImages, setProductImages] = useState<ProductImageData[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const [formData, setFormData] = useState<{
    category: number;
    sub_category: number | '';
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
    sub_category: '',
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
      const [cats, subs, prods] = await Promise.all([
        catalogService.getCategories(),
        catalogService.getSubCategories(),
        catalogService.getProducts({
          category: selectedCategory || undefined,
          sub_category: selectedSubCategory || undefined,
          search: search || undefined,
        }),
      ]);
      setCategories(cats);
      setSubCategories(subs);

      let filtered = prods;
      if (stockFilter === 'low') {
        filtered = prods.filter((p: ProductData) => Number(p.stock_quantity) > 0 && Number(p.stock_quantity) <= 5);
      } else if (stockFilter === 'out') {
        filtered = prods.filter((p: ProductData) => Number(p.stock_quantity) === 0);
      }
      setProducts(filtered);
    } catch {
      toast.error('Failed to load products catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, selectedCategory, selectedSubCategory, stockFilter]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setProductImages([]);
    const firstCatId = categories[0]?.id || 0;
    setFormData({
      category: firstCatId,
      sub_category: '',
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
    setProductImages(p.images || []);
    setFormData({
      category: p.category,
      sub_category: p.sub_category || '',
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

  const availableSubCategories = subCategories.filter(
    (sub) => sub.category === formData.category
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
      toast.error('Please select a main category');
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
        category: formData.category,
        sub_category: formData.sub_category ? Number(formData.sub_category) : null,
        mrp: Number(formData.mrp),
        offer_price: Number(formData.offer_price),
        stock_quantity: Number(formData.stock_quantity),
      };

      if (editingProduct) {
        await catalogService.updateProduct(editingProduct.id, payload);
        toast.success('Product updated successfully');
      } else {
        await catalogService.createProduct(payload);
        toast.success('Product created! You can now upload images for it.');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeviceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (!editingProduct) {
      toast.error('Please save the product first before uploading images.');
      return;
    }

    const filesArray = Array.from(e.target.files);
    try {
      setUploadingFiles(true);
      toast.loading(`Uploading ${filesArray.length} image(s)...`, { id: 'img-upload' });
      await catalogService.uploadProductImages(editingProduct.id, filesArray);
      toast.success('Images uploaded successfully from device!', { id: 'img-upload' });

      // Refresh product list and update modal images
      const updatedProductList = await catalogService.getProducts();
      setProducts(updatedProductList);
      const freshProd = updatedProductList.find((p: ProductData) => p.id === editingProduct.id);
      if (freshProd) {
        setProductImages(freshProd.images || []);
        setFormData((prev) => ({ ...prev, primary_image_url: freshProd.primary_image_url }));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to upload images from device', { id: 'img-upload' });
    } finally {
      setUploadingFiles(false);
      e.target.value = '';
    }
  };

  const handleSetPrimaryImage = async (imageId: number) => {
    try {
      await catalogService.setImagePrimary(imageId);
      toast.success('Primary image updated');
      loadData();
      if (editingProduct) {
        const freshList = await catalogService.getProducts();
        const freshProd = freshList.find((p: ProductData) => p.id === editingProduct.id);
        if (freshProd) {
          setProductImages(freshProd.images || []);
          setFormData((prev) => ({ ...prev, primary_image_url: freshProd.primary_image_url }));
        }
      }
    } catch {
      toast.error('Failed to set primary image');
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    try {
      await catalogService.deleteImage(imageId);
      toast.success('Image deleted');
      setProductImages((prev) => prev.filter((img) => img.id !== imageId));
      loadData();
    } catch {
      toast.error('Failed to delete image');
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
          <h1 className="font-brand text-3xl text-charcoal mb-1">Products Catalog</h1>
          <p className="text-[13px] text-mid-gray font-light">Manage products, subcategories, multiple device image uploads, and inventory</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-brass text-charcoal px-5 py-2.5 rounded-xl text-[12px] font-semibold hover:bg-brass-hover transition-all shadow-sm active:scale-[0.98] self-start sm:self-auto cursor-pointer"
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
            onChange={(e) => {
              setSelectedCategory(e.target.value ? Number(e.target.value) : '');
              setSelectedSubCategory('');
            }}
            className="bg-porcelain/60 border border-warm-gray/40 rounded-xl px-3 py-2 text-xs text-charcoal focus:outline-none focus:border-brass"
          >
            <option value="">All Main Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {selectedCategory && (
            <select
              value={selectedSubCategory}
              onChange={(e) => setSelectedSubCategory(e.target.value ? Number(e.target.value) : '')}
              className="bg-porcelain/60 border border-warm-gray/40 rounded-xl px-3 py-2 text-xs text-charcoal focus:outline-none focus:border-brass"
            >
              <option value="">All Sub-Categories</option>
              {subCategories
                .filter((sub) => sub.category === selectedCategory)
                .map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
            </select>
          )}

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
          <p className="text-mid-gray text-sm">No products found matching filters.</p>
        </div>
      ) : (
        <div className="bg-warm-white rounded-2xl border border-warm-gray/50 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs text-charcoal border-collapse">
            <thead>
              <tr className="bg-porcelain/80 border-b border-warm-gray/40 text-[10px] uppercase font-bold text-mid-gray tracking-wider">
                <th className="py-3 px-4">Image</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category / Sub-Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4 text-center">Active</th>
                <th className="py-3 px-4 text-center">Featured</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-gray/30">
              {products.map((p) => {
                const imgCount = p.images?.length || 0;
                return (
                  <tr key={p.id} className="hover:bg-porcelain/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-warm-gray/40 bg-porcelain">
                        {p.primary_image_url ? (
                          <img src={p.primary_image_url} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-mid-gray"><ImageIcon className="w-5 h-5" /></div>
                        )}
                        {imgCount > 1 && (
                          <span className="absolute bottom-0.5 right-0.5 bg-charcoal/80 text-white text-[9px] px-1 rounded font-bold">
                            +{imgCount}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-charcoal">
                      <div>{p.name}</div>
                      {p.badge && (
                        <span className="inline-block mt-0.5 text-[9px] bg-brass/20 text-charcoal px-2 py-0.5 rounded font-bold">
                          {p.badge}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-mid-gray">
                      <span className="font-medium text-charcoal">{p.category_name || 'Category'}</span>
                      {p.sub_category_name && (
                        <span className="block text-[10px] text-mid-gray">↳ {p.sub_category_name}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-charcoal">₹{Number(p.offer_price).toLocaleString('en-IN')}</div>
                      {Number(p.mrp) > Number(p.offer_price) && (
                        <div className="text-[10px] text-mid-gray line-through">₹{Number(p.mrp).toLocaleString('en-IN')}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                        p.stock_quantity === 0 ? 'bg-error/10 text-error' : p.stock_quantity <= 5 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {p.stock_quantity === 0 ? 'Out of Stock' : `${p.stock_quantity} left`}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => toggleActive(p)} className="p-1 text-mid-gray hover:text-charcoal transition-colors">
                        {p.is_active ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-mid-gray" />}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => toggleFeatured(p)} className="p-1 text-mid-gray hover:text-brass transition-colors">
                        <Star className={`w-4 h-4 ${p.is_featured ? 'fill-brass text-brass' : ''}`} />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-2 border border-warm-gray/40 rounded-lg text-mid-gray hover:text-brass hover:border-brass/30 transition-all cursor-pointer"
                          title="Edit Product & Upload Images"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-2 border border-warm-gray/40 rounded-lg text-mid-gray hover:text-error hover:border-error/30 transition-all cursor-pointer"
                          title="Delete Product"
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
          <div className="bg-warm-white border border-warm-gray/60 rounded-2xl w-full max-w-3xl shadow-2xl p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-warm-gray/40 pb-4">
              <div>
                <h3 className="font-brand text-2xl text-charcoal">
                  {editingProduct ? 'Edit Studio Product' : 'New Studio Product'}
                </h3>
                <p className="text-[11px] text-mid-gray">Define catalog metadata, subcategories & upload device photos</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-mid-gray hover:text-charcoal transition-colors p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Main Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const catId = Number(e.target.value);
                      setFormData({ ...formData, category: catId, sub_category: '' });
                    }}
                    className="input-field"
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="input-label">Sub-Category (Optional)</label>
                  <select
                    value={formData.sub_category}
                    onChange={(e) => setFormData({ ...formData, sub_category: e.target.value ? Number(e.target.value) : '' })}
                    className="input-field"
                  >
                    <option value="">-- Select Sub-Category --</option>
                    {availableSubCategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
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
                    <option value="Exclusive">Exclusive</option>
                    <option value="Limited Run">Limited Run</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">External Image URL (Fallback)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/…"
                    value={formData.primary_image_url}
                    onChange={(e) => setFormData({ ...formData, primary_image_url: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              {/* ─── DIRECT DEVICE MULTI-IMAGE UPLOAD SECTION ──────────────── */}
              <div className="border border-warm-gray/50 rounded-xl p-4 bg-porcelain/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-charcoal text-xs flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-brass" /> Direct Device Image Uploads
                    </span>
                    <p className="text-[10px] text-mid-gray">Select multiple image files from your computer/device to upload directly.</p>
                  </div>
                  {editingProduct ? (
                    <label className="cursor-pointer bg-charcoal text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-black transition-colors flex items-center gap-1.5 shadow-xs">
                      <Upload className="w-3.5 h-3.5 text-brass" />
                      <span>{uploadingFiles ? 'Uploading…' : 'Upload Files'}</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleDeviceImageUpload}
                        disabled={uploadingFiles}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                      Save product first to enable image upload
                    </span>
                  )}
                </div>

                {/* Uploaded Images List */}
                {productImages.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 pt-2">
                    {productImages.map((img) => (
                      <div key={img.id} className="relative group border border-warm-gray/40 rounded-lg overflow-hidden bg-white aspect-square shadow-xs">
                        <img
                          src={img.image_src || img.image_url}
                          alt={img.alt_text || 'Product image'}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-charcoal/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => img.id && handleSetPrimaryImage(img.id)}
                            title={img.is_primary ? 'Primary Image' : 'Set as Primary'}
                            className={`p-1.5 rounded-full ${img.is_primary ? 'bg-brass text-charcoal' : 'bg-white/80 text-charcoal hover:bg-brass'}`}
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </button>
                          <button
                            type="button"
                            onClick={() => img.id && handleDeleteImage(img.id)}
                            title="Delete Image"
                            className="p-1.5 rounded-full bg-white/80 text-error hover:bg-error hover:text-white transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {img.is_primary && (
                          <span className="absolute top-1 left-1 bg-brass text-charcoal text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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
                  className="flex-1 bg-brass text-charcoal rounded-xl py-3 text-xs font-semibold hover:bg-brass-hover transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Saving…' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 border border-warm-gray/50 rounded-xl text-xs font-medium text-mid-gray hover:border-charcoal transition-colors cursor-pointer"
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
