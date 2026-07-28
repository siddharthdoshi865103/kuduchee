import React, { useEffect, useState } from 'react';
import { catalogService, type CategoryData } from '../../../services/catalogService';
import toast from 'react-hot-toast';
import { Layers, Plus, Edit2, Trash2, Search, Star, X } from 'lucide-react';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    is_featured: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await catalogService.getCategories({ search });
      setCategories(data);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [search]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', image_url: '', is_featured: false });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: CategoryData) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      image_url: cat.image_url || '',
      is_featured: cat.is_featured,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      setSubmitting(true);
      if (editingCategory) {
        await catalogService.updateCategory(editingCategory.id, formData);
        toast.success('Category updated successfully');
      } else {
        await catalogService.createCategory(formData);
        toast.success('Category created successfully');
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.name?.[0] || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      await catalogService.deleteCategory(id);
      toast.success('Category deleted');
      loadCategories();
    } catch {
      toast.error('Could not delete category');
    }
  };

  const toggleFeatured = async (cat: CategoryData) => {
    try {
      await catalogService.updateCategory(cat.id, { is_featured: !cat.is_featured });
      toast.success(`${cat.name} ${!cat.is_featured ? 'featured on storefront' : 'removed from featured'}`);
      loadCategories();
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-gray/40 pb-6">
        <div>
          <h1 className="font-brand text-3xl text-charcoal mb-1">Categories</h1>
          <p className="text-[13px] text-mid-gray font-light">Organize studio collections & storefront series</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-brass text-charcoal px-5 py-2.5 rounded-xl text-[12px] font-semibold hover:bg-brass-hover transition-all shadow-sm active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 bg-warm-white p-4 rounded-2xl border border-warm-gray/50 shadow-sm">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-mid-gray absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search categories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-porcelain/60 border border-warm-gray/40 rounded-xl pl-10 pr-4 py-2 text-xs text-charcoal focus:outline-none focus:border-brass"
          />
        </div>
        <span className="text-[11px] text-mid-gray font-medium">Total: {categories.length} Categories</span>
      </div>

      {/* Table / Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-brass border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-xs font-medium text-mid-gray uppercase tracking-widest">Loading Collections…</span>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-warm-white border border-dashed border-warm-gray rounded-2xl p-12 text-center shadow-sm">
          <Layers className="w-10 h-10 text-mid-gray/30 mx-auto mb-3" />
          <h3 className="text-base font-bold text-charcoal mb-1">No Categories Found</h3>
          <p className="text-[13px] text-mid-gray font-light mb-4">Create your first category to start organizing products.</p>
          <button onClick={openCreateModal} className="btn-primary">Add Category</button>
        </div>
      ) : (
        <div className="bg-warm-white border border-warm-gray/50 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-warm-gray/40 bg-porcelain/40 text-[10px] uppercase tracking-widest text-mid-gray font-bold">
                <th className="py-3.5 px-6">Image</th>
                <th className="py-3.5 px-6">Name</th>
                <th className="py-3.5 px-6">Slug</th>
                <th className="py-3.5 px-6 text-center">Products</th>
                <th className="py-3.5 px-6 text-center">Home Featured</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-gray/30 text-xs text-charcoal">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-porcelain/30 transition-colors">
                  <td className="py-3 px-6">
                    <div className="w-12 h-12 rounded-xl bg-porcelain border border-warm-gray/40 overflow-hidden shrink-0">
                      {cat.image_url ? (
                        <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-mid-gray/40">
                          <Layers className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-6 font-semibold">
                    <div>{cat.name}</div>
                    {cat.description && (
                      <div className="text-[11px] font-normal text-mid-gray line-clamp-1">{cat.description}</div>
                    )}
                  </td>
                  <td className="py-3 px-6 font-mono text-[11px] text-mid-gray">{cat.slug}</td>
                  <td className="py-3 px-6 text-center font-bold">
                    <span className="bg-porcelain px-3 py-1 rounded-full text-charcoal border border-warm-gray/40">
                      {cat.product_count}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => toggleFeatured(cat)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                        cat.is_featured
                          ? 'bg-brass/15 text-brass border border-brass/30'
                          : 'bg-warm-gray/30 text-mid-gray border border-warm-gray/40'
                      }`}
                    >
                      <Star className={`w-3 h-3 ${cat.is_featured ? 'fill-brass' : ''}`} />
                      {cat.is_featured ? 'Featured' : 'Standard'}
                    </button>
                  </td>
                  <td className="py-3 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-2 border border-warm-gray/40 rounded-lg text-mid-gray hover:text-brass hover:border-brass/30 transition-all"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-2 border border-warm-gray/40 rounded-lg text-mid-gray hover:text-error hover:border-error/30 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Drawer for Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-warm-white border border-warm-gray/60 rounded-2xl w-full max-w-lg shadow-2xl p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-warm-gray/40 pb-4">
              <h3 className="font-brand text-xl text-charcoal">
                {editingCategory ? 'Edit Category' : 'New Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-mid-gray hover:text-charcoal transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="input-label">Category Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Tableware & Fine Dining"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="input-label">Description</label>
                <textarea
                  placeholder="Short summary of this collection…"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">Cover Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/…"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="input-field"
                />
                {formData.image_url && (
                  <div className="mt-2 w-20 h-20 rounded-xl overflow-hidden border border-warm-gray">
                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <label className="flex items-center gap-3 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="accent-brass w-4 h-4 rounded"
                />
                <div>
                  <span className="text-xs font-semibold text-charcoal block">Feature on Homepage</span>
                  <span className="text-[11px] text-mid-gray">Displays this collection on the storefront home page</span>
                </div>
              </label>

              <div className="flex gap-3 pt-4 border-t border-warm-gray/40">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-brass text-charcoal rounded-xl py-3 text-xs font-semibold hover:bg-brass-hover transition-all shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving…' : editingCategory ? 'Update Category' : 'Create Category'}
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
export default AdminCategories;
