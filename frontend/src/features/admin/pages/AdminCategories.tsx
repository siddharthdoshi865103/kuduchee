import React, { useEffect, useState } from 'react';
import {
  catalogService,
  type CategoryData,
  type SubCategoryData,
} from '../../../services/catalogService';
import toast from 'react-hot-toast';
import { Layers, Plus, Edit2, Trash2, Search, Star, X, ChevronDown, ChevronRight, FolderTree } from 'lucide-react';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedCatId, setExpandedCatId] = useState<number | null>(null);

  // Category Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);
  const [catFormData, setCatFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    is_featured: false,
  });

  // SubCategory Modal State
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategoryData | null>(null);
  const [subFormData, setSubFormData] = useState({
    category: 0,
    name: '',
    description: '',
    is_active: true,
  });

  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cats, subs] = await Promise.all([
        catalogService.getCategories({ search }),
        catalogService.getSubCategories(),
      ]);
      setCategories(cats);
      setSubCategories(subs);
      if (cats.length > 0 && expandedCatId === null) {
        setExpandedCatId(cats[0].id);
      }
    } catch {
      toast.error('Failed to load categories catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  // Category Actions
  const openCreateCatModal = () => {
    setEditingCategory(null);
    setCatFormData({ name: '', description: '', image_url: '', is_featured: false });
    setIsCatModalOpen(true);
  };

  const openEditCatModal = (cat: CategoryData) => {
    setEditingCategory(cat);
    setCatFormData({
      name: cat.name,
      description: cat.description || '',
      image_url: cat.image_url || '',
      is_featured: cat.is_featured,
    });
    setIsCatModalOpen(true);
  };

  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catFormData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      setSubmitting(true);
      if (editingCategory) {
        await catalogService.updateCategory(editingCategory.id, catFormData);
        toast.success('Category updated successfully');
      } else {
        await catalogService.createCategory(catFormData);
        toast.success('Category created successfully');
      }
      setIsCatModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.name?.[0] || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCat = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete main category "${name}"?`)) return;
    try {
      await catalogService.deleteCategory(id);
      toast.success('Category deleted');
      loadData();
    } catch {
      toast.error('Could not delete category');
    }
  };

  const toggleCatFeatured = async (cat: CategoryData) => {
    try {
      await catalogService.updateCategory(cat.id, { is_featured: !cat.is_featured });
      toast.success(`${cat.name} ${!cat.is_featured ? 'featured on storefront' : 'removed from featured'}`);
      loadData();
    } catch {
      toast.error('Update failed');
    }
  };

  // SubCategory Actions
  const openCreateSubModal = (parentCatId: number) => {
    setEditingSubCategory(null);
    setSubFormData({
      category: parentCatId,
      name: '',
      description: '',
      is_active: true,
    });
    setIsSubModalOpen(true);
  };

  const openEditSubModal = (sub: SubCategoryData) => {
    setEditingSubCategory(sub);
    setSubFormData({
      category: sub.category,
      name: sub.name,
      description: sub.description || '',
      is_active: sub.is_active,
    });
    setIsSubModalOpen(true);
  };

  const handleSubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subFormData.name.trim()) {
      toast.error('SubCategory name is required');
      return;
    }

    try {
      setSubmitting(true);
      if (editingSubCategory) {
        await catalogService.updateSubCategory(editingSubCategory.id, subFormData);
        toast.success('SubCategory updated');
      } else {
        await catalogService.createSubCategory(subFormData);
        toast.success('SubCategory created');
      }
      setIsSubModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.name?.[0] || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSub = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete sub-category "${name}"?`)) return;
    try {
      await catalogService.deleteSubCategory(id);
      toast.success('SubCategory deleted');
      loadData();
    } catch {
      toast.error('Could not delete sub-category');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-gray/40 pb-6">
        <div>
          <h1 className="font-brand text-3xl text-charcoal mb-1">Categories & Sub-Categories</h1>
          <p className="text-[13px] text-mid-gray font-light">Manage nested categories, sub-categories, and storefront series</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openCreateCatModal}
            className="flex items-center gap-2 bg-brass text-charcoal px-5 py-2.5 rounded-xl text-[12px] font-semibold hover:bg-brass-hover transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Main Category
          </button>
        </div>
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
        <span className="text-[11px] text-mid-gray font-medium">
          {categories.length} Categories · {subCategories.length} Sub-Categories
        </span>
      </div>

      {/* Categories & Subcategories List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-brass border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-xs font-medium text-mid-gray uppercase tracking-widest">Loading Catalog Structure…</span>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-warm-white border border-dashed border-warm-gray rounded-2xl p-12 text-center shadow-sm">
          <Layers className="w-10 h-10 text-mid-gray/30 mx-auto mb-3" />
          <h3 className="text-base font-bold text-charcoal mb-1">No Categories Found</h3>
          <p className="text-[13px] text-mid-gray font-light mb-4">Create your first category to start organizing products into sub-categories.</p>
          <button onClick={openCreateCatModal} className="btn-primary">Add Category</button>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => {
            const catSubs = subCategories.filter((sub) => sub.category === cat.id);
            const isExpanded = expandedCatId === cat.id;

            return (
              <div key={cat.id} className="bg-warm-white border border-warm-gray/50 rounded-2xl overflow-hidden shadow-xs transition-all">
                {/* Main Category Row */}
                <div className="p-4 flex items-center justify-between gap-4 bg-porcelain/30 hover:bg-porcelain/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setExpandedCatId(isExpanded ? null : cat.id)}
                      className="p-1 rounded-lg text-mid-gray hover:text-charcoal hover:bg-warm-gray/30 transition-colors cursor-pointer"
                    >
                      {isExpanded ? <ChevronDown className="w-5 h-5 text-brass" /> : <ChevronRight className="w-5 h-5" />}
                    </button>

                    <div className="w-10 h-10 rounded-xl bg-porcelain border border-warm-gray/40 overflow-hidden shrink-0">
                      {cat.image_url ? (
                        <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-mid-gray/40">
                          <Layers className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-charcoal flex items-center gap-2">
                        {cat.name}
                        <span className="text-[10px] bg-warm-gray/30 text-mid-gray font-normal px-2 py-0.5 rounded-full border border-warm-gray/40">
                          {catSubs.length} Sub-categories
                        </span>
                      </h3>
                      {cat.description && (
                        <p className="text-[11px] text-mid-gray font-light line-clamp-1">{cat.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleCatFeatured(cat)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        cat.is_featured
                          ? 'bg-brass/15 text-brass border border-brass/30'
                          : 'bg-warm-gray/30 text-mid-gray border border-warm-gray/40'
                      }`}
                    >
                      <Star className={`w-3 h-3 ${cat.is_featured ? 'fill-brass' : ''}`} />
                      {cat.is_featured ? 'Featured' : 'Standard'}
                    </button>

                    <button
                      onClick={() => openCreateSubModal(cat.id)}
                      className="px-3 py-1.5 bg-porcelain border border-warm-gray/50 hover:border-brass text-charcoal rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-brass" /> Sub-Category
                    </button>

                    <button
                      onClick={() => openEditCatModal(cat)}
                      className="p-2 border border-warm-gray/40 rounded-lg text-mid-gray hover:text-brass hover:border-brass/30 transition-all cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteCat(cat.id, cat.name)}
                      className="p-2 border border-warm-gray/40 rounded-lg text-mid-gray hover:text-error hover:border-error/30 transition-all cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* SubCategories Drawer */}
                {isExpanded && (
                  <div className="border-t border-warm-gray/40 bg-white/70 p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-mid-gray uppercase tracking-wider px-3 pb-1 border-b border-warm-gray/30">
                      <span className="flex items-center gap-1.5"><FolderTree className="w-3.5 h-3.5 text-brass" /> Sub-Category Name</span>
                      <span>Actions</span>
                    </div>

                    {catSubs.length === 0 ? (
                      <div className="py-4 text-center text-mid-gray text-xs">
                        No sub-categories created under "{cat.name}" yet.{' '}
                        <button
                          onClick={() => openCreateSubModal(cat.id)}
                          className="text-brass font-bold hover:underline"
                        >
                          Create one now
                        </button>
                      </div>
                    ) : (
                      catSubs.map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-porcelain/60 transition-colors border border-transparent hover:border-warm-gray/40">
                          <div className="pl-2">
                            <span className="font-semibold text-xs text-charcoal">{sub.name}</span>
                            {sub.description && (
                              <p className="text-[11px] text-mid-gray font-light">{sub.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditSubModal(sub)}
                              className="p-1.5 text-mid-gray hover:text-brass transition-colors cursor-pointer"
                              title="Edit SubCategory"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSub(sub.id, sub.name)}
                              className="p-1.5 text-mid-gray hover:text-error transition-colors cursor-pointer"
                              title="Delete SubCategory"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Main Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-warm-white border border-warm-gray/60 rounded-2xl w-full max-w-lg shadow-2xl p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-warm-gray/40 pb-4">
              <h3 className="font-brand text-xl text-charcoal">
                {editingCategory ? 'Edit Main Category' : 'New Main Category'}
              </h3>
              <button
                onClick={() => setIsCatModalOpen(false)}
                className="text-mid-gray hover:text-charcoal transition-colors p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCatSubmit} className="space-y-4 text-xs">
              <div>
                <label className="input-label">Category Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Tableware & Fine Dining"
                  value={catFormData.name}
                  onChange={(e) => setCatFormData({ ...catFormData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="input-label">Description</label>
                <textarea
                  placeholder="Short summary of this collection…"
                  rows={3}
                  value={catFormData.description}
                  onChange={(e) => setCatFormData({ ...catFormData, description: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">Cover Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/…"
                  value={catFormData.image_url}
                  onChange={(e) => setCatFormData({ ...catFormData, image_url: e.target.value })}
                  className="input-field"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={catFormData.is_featured}
                  onChange={(e) => setCatFormData({ ...catFormData, is_featured: e.target.checked })}
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
                  className="flex-1 bg-brass text-charcoal rounded-xl py-3 text-xs font-semibold hover:bg-brass-hover transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Saving…' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-5 border border-warm-gray/50 rounded-xl text-xs font-medium text-mid-gray hover:border-charcoal transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SubCategory Modal */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-warm-white border border-warm-gray/60 rounded-2xl w-full max-w-md shadow-2xl p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-warm-gray/40 pb-4">
              <h3 className="font-brand text-xl text-charcoal">
                {editingSubCategory ? 'Edit Sub-Category' : 'New Sub-Category'}
              </h3>
              <button
                onClick={() => setIsSubModalOpen(false)}
                className="text-mid-gray hover:text-charcoal transition-colors p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubSubmit} className="space-y-4 text-xs">
              <div>
                <label className="input-label">Parent Main Category *</label>
                <select
                  value={subFormData.category}
                  onChange={(e) => setSubFormData({ ...subFormData, category: Number(e.target.value) })}
                  className="input-field"
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="input-label">Sub-Category Name *</label>
                <input
                  type="text"
                  placeholder="e.g. 16-Piece Sets, Serving Bowls"
                  value={subFormData.name}
                  onChange={(e) => setSubFormData({ ...subFormData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="input-label">Description</label>
                <textarea
                  placeholder="Short description of this sub-category series…"
                  rows={2}
                  value={subFormData.description}
                  onChange={(e) => setSubFormData({ ...subFormData, description: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-warm-gray/40">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-brass text-charcoal rounded-xl py-3 text-xs font-semibold hover:bg-brass-hover transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Saving…' : editingSubCategory ? 'Update SubCategory' : 'Create SubCategory'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsSubModalOpen(false)}
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

export default AdminCategories;
