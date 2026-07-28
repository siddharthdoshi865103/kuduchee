import { api } from '../utils/api';

export interface PaymentSettingsData {
  id: number;
  upi_id: string;
  payee_name: string;
  qr_code_url: string;
  is_qr_enabled: boolean;
  is_razorpay_enabled: boolean;
  razorpay_key_id?: string;
  razorpay_key_secret?: string;
}

export interface OrderItemData {
  id: number;
  product?: number;
  product_name: string;
  variant_name: string;
  unit_price: number | string;
  quantity: number;
  total_price: number | string;
}

export interface RefundBankDetails {
  account_number?: string;
  ifsc_code?: string;
  bank_name?: string;
  holder_name?: string;
  upi_id?: string;
}

export interface OrderData {
  id: number;
  order_number: string;
  customer_username: string;
  customer_email: string;
  status:
    | 'PENDING_VERIFICATION'
    | 'APPROVED'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'CANCEL_REQUESTED'
    | 'CANCELLED'
    | 'REFUND_PROCESSED'
    | 'REJECTED';
  total_amount: number | string;
  shipping_address_snapshot: Record<string, any>;
  payment_method: string;
  utr_number: string;
  payment_proof_url: string;
  rejection_reason?: string;
  cancellation_reason?: string;
  refund_bank_details?: RefundBankDetails;
  refund_transaction_ref?: string;
  refund_notes?: string;
  tracking_notes?: string;
  tracking_number?: string;
  courier_partner?: string;
  items: OrderItemData[];
  created_at: string;
  updated_at: string;
}

export interface AnalyticsData {
  total_orders: number;
  total_revenue: number;
  pending_verification: number;
  approved: number;
  delivered: number;
  rejected: number;
  top_products: Array<{ product_name: string; total_sold: number; total_sales: number }>;
  categories: Array<{ name: string; prod_count: number }>;
}

export interface CreateOrderPayload {
  shipping_address_snapshot: Record<string, any>;
  payment_method: string;
  utr_number?: string;
  payment_proof_url?: string;
}

export const orderService = {
  async getPaymentSettings(): Promise<PaymentSettingsData> {
    const res = await api.get('/payments/settings/');
    return res.data;
  },

  async updatePaymentSettings(data: Partial<PaymentSettingsData>) {
    const res = await api.put('/payments/settings/', data);
    return res.data;
  },

  async getOrders(): Promise<OrderData[]> {
    const res = await api.get('/orders/');
    return res.data.results || res.data;
  },

  async getOrderById(id: string | number): Promise<OrderData> {
    const res = await api.get(`/orders/${id}/`);
    return res.data;
  },

  async createOrder(payload: CreateOrderPayload): Promise<OrderData> {
    const res = await api.post('/orders/', payload);
    return res.data;
  },

  async approveOrder(orderId: number): Promise<OrderData> {
    const res = await api.post(`/orders/${orderId}/approve/`);
    return res.data;
  },

  async rejectOrder(orderId: number, rejection_reason: string): Promise<OrderData> {
    const res = await api.post(`/orders/${orderId}/reject/`, { rejection_reason });
    return res.data;
  },

  async updateDelivery(
    orderId: number,
    payload: {
      status?: string;
      tracking_number?: string;
      courier_partner?: string;
      tracking_notes?: string;
    }
  ): Promise<OrderData> {
    const res = await api.post(`/orders/${orderId}/update-delivery/`, payload);
    return res.data;
  },

  async requestCancelOrder(
    orderId: number,
    payload: { cancellation_reason: string; refund_bank_details?: RefundBankDetails }
  ): Promise<OrderData> {
    const res = await api.post(`/orders/${orderId}/request-cancel/`, payload);
    return res.data;
  },

  async approveCancelOrder(
    orderId: number,
    payload: { status?: string; refund_transaction_ref?: string; refund_notes?: string }
  ): Promise<OrderData> {
    const res = await api.post(`/orders/${orderId}/approve-cancel/`, payload);
    return res.data;
  },

  async rejectCancelOrder(orderId: number, rejection_reason: string): Promise<OrderData> {
    const res = await api.post(`/orders/${orderId}/reject-cancel/`, { rejection_reason });
    return res.data;
  },

  async reorder(orderId: number) {
    const res = await api.post(`/orders/${orderId}/reorder/`);
    return res.data;
  },

  async getAnalytics(): Promise<AnalyticsData> {
    const res = await api.get('/analytics/dashboard/');
    return res.data;
  },

  async createRazorpayOrder(amount: number) {
    const res = await api.post('/payments/razorpay/', { action: 'create_order', amount });
    return res.data;
  },

  async getUsersInfo() {
    const res = await api.get('/analytics/users/');
    return res.data;
  },
};
