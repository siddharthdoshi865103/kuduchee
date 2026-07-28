import { api } from '../utils/api';
import { type ProductData } from './catalogService';

export interface WishlistItemData {
  id: number;
  product: number;
  product_details: ProductData;
  created_at: string;
}

export const wishlistService = {
  async getWishlist() {
    const res = await api.get('/wishlist/');
    return res.data.results || res.data;
  },

  async addToWishlist(productId: number) {
    const res = await api.post('/wishlist/', { product: productId });
    return res.data;
  },

  async removeFromWishlist(id: number) {
    await api.delete(`/wishlist/${id}/`);
  },
};
