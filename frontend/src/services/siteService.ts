import { api } from '../utils/api';

export interface HeroBannerData {
  id?: number;
  tagline: string;
  title: string;
  quote: string;
  cta_text: string;
  cta_link: string;
  image_url: string;
  accent_badge: string;
  order: number;
  is_active: boolean;
}

export interface SiteSettingsData {
  id?: number;
  ticker_text: string;
  brand_quote: string;
  brand_author: string;
  contact_email: string;
  contact_phone: string;
  company_legal_name: string;
  company_location: string;
  updated_at?: string;
}

export const siteService = {
  async getHeroBanners(): Promise<HeroBannerData[]> {
    const res = await api.get('/hero-banners/');
    return res.data.results || res.data;
  },

  async createHeroBanner(banner: Partial<HeroBannerData>): Promise<HeroBannerData> {
    const res = await api.post('/hero-banners/', banner);
    return res.data;
  },

  async updateHeroBanner(id: number, banner: Partial<HeroBannerData>): Promise<HeroBannerData> {
    const res = await api.put(`/hero-banners/${id}/`, banner);
    return res.data;
  },

  async deleteHeroBanner(id: number): Promise<void> {
    await api.delete(`/hero-banners/${id}/`);
  },

  async getSiteSettings(): Promise<SiteSettingsData> {
    const res = await api.get('/site-settings/');
    return res.data;
  },

  async updateSiteSettings(settings: Partial<SiteSettingsData>): Promise<SiteSettingsData> {
    const res = await api.put('/site-settings/', settings);
    return res.data;
  },
};
