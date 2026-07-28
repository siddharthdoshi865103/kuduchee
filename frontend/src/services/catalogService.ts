import { api } from '../utils/api';

export interface CategoryData {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  is_featured: boolean;
  product_count: number;
  created_at: string;
}

export interface ProductVariantData {
  id?: number;
  product?: number;
  name: string;
  sku?: string;
  mrp?: number | string;
  offer_price?: number | string;
  stock_quantity: number;
}

export interface ProductImageData {
  id?: number;
  product?: number;
  image_url: string;
  alt_text?: string;
  is_primary?: boolean;
}

export interface ProductData {
  id: number;
  category: number;
  category_name?: string;
  category_slug?: string;
  name: string;
  slug: string;
  description: string;
  mrp: string | number;
  offer_price: string | number;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  badge?: string | null;
  primary_image_url: string;
  is_in_stock?: boolean;
  is_low_stock?: boolean;
  reviews_count?: number;
  avg_rating?: number;
  variants?: ProductVariantData[];
  images?: ProductImageData[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateProductPayload {
  category: number;
  name: string;
  description?: string;
  mrp: number;
  offer_price: number;
  stock_quantity: number;
  is_active?: boolean;
  is_featured?: boolean;
  badge?: string;
  primary_image_url?: string;
}

export const catalogService = {
  // ─── Categories ─────────────────────────────────────────────────────────────
  async getCategories(params?: { is_featured?: boolean; search?: string }) {
    const res = await api.get('/categories/', { params });
    return res.data.results || res.data;
  },

  async createCategory(data: Partial<CategoryData>) {
    const res = await api.post('/categories/', data);
    return res.data;
  },

  async updateCategory(id: number, data: Partial<CategoryData>) {
    const res = await api.put(`/categories/${id}/`, data);
    return res.data;
  },

  async deleteCategory(id: number) {
    await api.delete(`/categories/${id}/`);
  },

  // ─── Products ───────────────────────────────────────────────────────────────
  async getProducts(params?: {
    category?: number;
    category__slug?: string;
    is_active?: boolean;
    is_featured?: boolean;
    badge?: string;
    search?: string;
    ordering?: string;
  }) {
    const res = await api.get('/products/', { params });
    return res.data.results || res.data;
  },

  async getProductBySlug(slug: string) {
    const res = await api.get(`/products/?slug=${slug}`);
    const items = res.data.results || res.data;
    return items[0] || null;
  },

  async createProduct(data: CreateProductPayload) {
    const res = await api.post('/products/', data);
    return res.data;
  },

  async updateProduct(id: number, data: Partial<CreateProductPayload>) {
    const res = await api.patch(`/products/${id}/`, data);
    return res.data;
  },

  async deleteProduct(id: number) {
    await api.delete(`/products/${id}/`);
  },

  // ─── Variants & Images ──────────────────────────────────────────────────────
  async createVariant(variant: ProductVariantData) {
    const res = await api.post('/variants/', variant);
    return res.data;
  },

  async deleteVariant(id: number) {
    await api.delete(`/variants/${id}/`);
  },

  async createImage(image: ProductImageData) {
    const res = await api.post('/images/', image);
    return res.data;
  },

  async deleteImage(id: number) {
    await api.delete(`/images/${id}/`);
  },
};
