import { api } from '../utils/api';
import { type ProductData, type ProductVariantData } from './catalogService';

export interface CartItemData {
  id: number;
  product: number;
  product_details: ProductData;
  variant?: number | null;
  variant_details?: ProductVariantData | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export const cartService = {
  async getCart() {
    const res = await api.get('/cart/');
    return res.data.results || res.data;
  },

  async addToCart(productId: number, variantId?: number | null, quantity = 1) {
    const res = await api.post('/cart/', {
      product: productId,
      variant: variantId || null,
      quantity,
    });
    return res.data;
  },

  async updateQuantity(cartItemId: number, quantity: number) {
    const res = await api.patch(`/cart/${cartItemId}/`, { quantity });
    return res.data;
  },

  async removeFromCart(cartItemId: number) {
    await api.delete(`/cart/${cartItemId}/`);
  },

  async clearCart() {
    const items = await this.getCart();
    await Promise.all(items.map((item: CartItemData) => this.removeFromCart(item.id)));
  },
};
