import React, { useEffect, useState } from 'react';
import { orderService, type PaymentSettingsData } from '../../../services/orderService';
import { siteService, type HeroBannerData, type SiteSettingsData } from '../../../services/siteService';
import toast from 'react-hot-toast';
import { CreditCard, Save, Image as ImageIcon, Plus, Trash2, Edit2, Type } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PAYMENTS' | 'HERO' | 'TICKER'>('PAYMENTS');

  // Payment Settings State
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettingsData>({
    id: 1,
    upi_id: 'kuduchee@upi',
    payee_name: 'Kaviz Creations Private Limited',
    qr_code_url: '',
    is_qr_enabled: true,
    is_razorpay_enabled: false,
    razorpay_key_id: '',
    razorpay_key_secret: '',
  });

  // Hero Banners & Site Settings State
  const [heroBanners, setHeroBanners] = useState<HeroBannerData[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettingsData>({
    ticker_text: 'Handcrafted Studio Stoneware · Fired at 1280°C for Lifetime Durability · 100% Lead-Free & Food-Safe Porcelain',
    brand_quote: 'Serve What You Deserve.',
    brand_author: 'Kuduchee',
    contact_email: 'anil.panda@kuduchee.com',
    contact_phone: '9971118219',
    company_legal_name: 'Kaviz Creations Private Limited',
    company_location: '510 A, Sun West Bank, Ashram Road, Ahmedabad, Gujarat 380009',
  });

  // New/Edit Hero Slide Form State
  const [editingBanner, setEditingBanner] = useState<Partial<HeroBannerData>>({
    tagline: 'AUTUMN / WINTER STUDIO COLLECTION',
    title: '',
    quote: 'Serve What You Deserve.',
    cta_text: 'Discover Collection',
    cta_link: '/shop',
    image_url: '',
    accent_badge: 'Handcrafted Batch 06 · Limited Run',
    order: 0,
    is_active: true,
  });
  const [isEditingSlide, setIsEditingSlide] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadAllSettings = async () => {
    try {
      setLoading(true);
      const [pSet, hBanners, sSet] = await Promise.all([
        orderService.getPaymentSettings(),
        siteService.getHeroBanners(),
        siteService.getSiteSettings(),
      ]);
      setPaymentSettings(pSet);
      setHeroBanners(hBanners);
      setSiteSettings(sSet);
    } catch {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllSettings();
  }, []);

  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await orderService.updatePaymentSettings(paymentSettings);
      toast.success('Payment & Gateway settings updated live!');
    } catch {
      toast.error('Failed to save payment settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await siteService.updateSiteSettings(siteSettings);
      toast.success('Home page ticker & quotes updated live!');
    } catch {
      toast.error('Failed to save site settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveHeroBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner.title || !editingBanner.image_url) {
      toast.error('Slide title and background image URL are required.');
      return;
    }

    try {
      setSaving(true);
      if (editingBanner.id) {
        await siteService.updateHeroBanner(editingBanner.id, editingBanner);
        toast.success('Hero slide updated!');
      } else {
        await siteService.createHeroBanner(editingBanner);
        toast.success('New Hero slide created!');
      }
      setIsEditingSlide(false);
      setEditingBanner({
        tagline: 'AUTUMN / WINTER STUDIO COLLECTION',
        title: '',
        quote: 'Elegance is when the inside is as beautiful as the outside.',
        cta_text: 'Discover Collection',
        cta_link: '/shop',
        image_url: '',
        accent_badge: 'Handcrafted Batch 06 · Limited Run',
        order: heroBanners.length,
        is_active: true,
      });
      loadAllSettings();
    } catch {
      toast.error('Failed to save Hero slide');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteHeroBanner = async (id: number) => {
    if (!window.confirm('Delete this hero slide?')) return;
    try {
      await siteService.deleteHeroBanner(id);
      toast.success('Hero slide deleted');
      loadAllSettings();
    } catch {
      toast.error('Failed to delete slide');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl font-sans">
      <div>
        <h1 className="font-brand text-3xl text-charcoal mb-1">Storefront &amp; Home Page Manager</h1>
        <p className="text-[13px] text-mid-gray font-light">Manage Hero carousel slides, top announcement ticker, brand quotes &amp; payment gateways live</p>
      </div>

      {/* Tab Navigation Header */}
      <div className="flex border-b border-warm-gray/40 gap-4">
        <button
          onClick={() => setActiveTab('PAYMENTS')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'PAYMENTS'
              ? 'border-brass text-brass'
              : 'border-transparent text-mid-gray hover:text-charcoal'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payment Gateways &amp; UPI</span>
        </button>

        <button
          onClick={() => setActiveTab('HERO')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'HERO'
              ? 'border-brass text-brass'
              : 'border-transparent text-mid-gray hover:text-charcoal'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Hero Carousel Slides ({heroBanners.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('TICKER')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'TICKER'
              ? 'border-brass text-brass'
              : 'border-transparent text-mid-gray hover:text-charcoal'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>Ticker &amp; Brand Quotes</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-brass border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-xs font-medium text-mid-gray uppercase tracking-widest">Loading Manager…</span>
        </div>
      ) : (
        <>
          {/* TAB 1: PAYMENT GATEWAYS */}
          {activeTab === 'PAYMENTS' && (
            <form onSubmit={handleSavePaymentSettings} className="space-y-6">
              <div className="bg-warm-white border border-warm-gray/50 rounded-2xl p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-warm-gray/40 pb-5">
                  <div className="w-10 h-10 bg-brass/10 rounded-xl flex items-center justify-center text-brass">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-charcoal">Gateway-Agnostic Payment Configuration</h3>
                    <p className="text-[12px] text-mid-gray">Managed live — checkout reads these settings automatically</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Merchant UPI ID *</label>
                      <input
                        type="text"
                        value={paymentSettings.upi_id}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, upi_id: e.target.value })}
                        className="input-field font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="input-label">Payee Legal Name *</label>
                      <input
                        type="text"
                        value={paymentSettings.payee_name}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, payee_name: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="input-label">Direct UPI QR Code Image URL</label>
                    <input
                      type="url"
                      value={paymentSettings.qr_code_url}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, qr_code_url: e.target.value })}
                      className="input-field font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-4 border-t border-warm-gray/40 pt-5 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-charcoal block">Razorpay Payment Gateway</span>
                      <span className="text-[11px] text-mid-gray">Cards, NetBanking, Wallets &amp; Instant UPI</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paymentSettings.is_razorpay_enabled}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, is_razorpay_enabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-warm-gray peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brass"></div>
                    </label>
                  </div>

                  {paymentSettings.is_razorpay_enabled && (
                    <div className="p-5 bg-brass/10 border border-brass/30 rounded-xl space-y-4 animate-fadeIn">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="input-label">Razorpay Key ID</label>
                          <input
                            type="text"
                            value={paymentSettings.razorpay_key_id || ''}
                            onChange={(e) => setPaymentSettings({ ...paymentSettings, razorpay_key_id: e.target.value })}
                            className="input-field font-mono"
                          />
                        </div>
                        <div>
                          <label className="input-label">Razorpay Key Secret</label>
                          <input
                            type="password"
                            value={paymentSettings.razorpay_key_secret || ''}
                            onChange={(e) => setPaymentSettings({ ...paymentSettings, razorpay_key_secret: e.target.value })}
                            className="input-field font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button type="submit" disabled={saving} className="btn-soft flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving…' : 'Save Payment Settings'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: HERO CAROUSEL MANAGER */}
          {activeTab === 'HERO' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-warm-white p-4 rounded-2xl border border-warm-gray/50 shadow-sm">
                <div>
                  <h3 className="text-sm font-bold text-charcoal">Home Hero Slides ({heroBanners.length})</h3>
                  <p className="text-[11px] text-mid-gray">Every slide added here appears on the customer home page carousel.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingBanner({
                      tagline: 'AUTUMN / WINTER STUDIO COLLECTION',
                      title: '',
                      quote: 'Elegance is when the inside is as beautiful as the outside.',
                      cta_text: 'Discover Collection',
                      cta_link: '/shop',
                      image_url: '',
                      accent_badge: 'Handcrafted Batch 06 · Limited Run',
                      order: heroBanners.length,
                      is_active: true,
                    });
                    setIsEditingSlide(true);
                  }}
                  className="btn-primary text-xs flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Slide</span>
                </button>
              </div>

              {/* Form Modal/Drawer for Slide */}
              {isEditingSlide && (
                <form onSubmit={handleSaveHeroBanner} className="bg-warm-white border-2 border-brass/40 rounded-2xl p-6 shadow-xl space-y-4 animate-fadeIn text-xs">
                  <h4 className="font-brand text-lg text-charcoal border-b border-warm-gray/40 pb-2">
                    {editingBanner.id ? 'Edit Hero Slide' : 'Create New Hero Slide'}
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Slide Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. Opulence Fired in Stoneware."
                        value={editingBanner.title || ''}
                        onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                        className="input-field font-brand text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="input-label">Category / Sub-Tagline</label>
                      <input
                        type="text"
                        placeholder="e.g. AUTUMN / WINTER STUDIO COLLECTION"
                        value={editingBanner.tagline || ''}
                        onChange={(e) => setEditingBanner({ ...editingBanner, tagline: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="input-label">Background Image URL *</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={editingBanner.image_url || ''}
                      onChange={(e) => setEditingBanner({ ...editingBanner, image_url: e.target.value })}
                      className="input-field font-mono"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Button Text</label>
                      <input
                        type="text"
                        placeholder="Discover Collection"
                        value={editingBanner.cta_text || ''}
                        onChange={(e) => setEditingBanner({ ...editingBanner, cta_text: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="input-label">Button Link URL</label>
                      <input
                        type="text"
                        placeholder="/shop"
                        value={editingBanner.cta_link || ''}
                        onChange={(e) => setEditingBanner({ ...editingBanner, cta_link: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="input-label">Studio Quote / Description</label>
                    <textarea
                      rows={2}
                      value={editingBanner.quote || ''}
                      onChange={(e) => setEditingBanner({ ...editingBanner, quote: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={saving} className="bg-brass text-charcoal px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-[11px] hover:bg-brass-hover transition-all">
                      {saving ? 'Saving…' : 'Save Hero Slide'}
                    </button>
                    <button type="button" onClick={() => setIsEditingSlide(false)} className="px-5 border border-warm-gray/50 rounded-xl text-mid-gray hover:border-charcoal">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* List of Active Slides */}
              <div className="space-y-4">
                {heroBanners.map((slide) => (
                  <div key={slide.id} className="bg-warm-white border border-warm-gray/50 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="w-24 h-16 rounded-xl bg-porcelain border border-warm-gray/40 overflow-hidden shrink-0">
                        <img src={slide.image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="truncate">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brass block">{slide.tagline}</span>
                        <h4 className="font-brand text-base text-charcoal truncate">{slide.title}</h4>
                        <p className="text-xs text-mid-gray line-clamp-1 font-light">{slide.quote}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setEditingBanner(slide);
                          setIsEditingSlide(true);
                        }}
                        className="p-2 text-mid-gray hover:text-brass transition-colors"
                        title="Edit Slide"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => slide.id && handleDeleteHeroBanner(slide.id)}
                        className="p-2 text-mid-gray hover:text-error transition-colors"
                        title="Delete Slide"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TICKER & BRAND QUOTES */}
          {activeTab === 'TICKER' && (
            <form onSubmit={handleSaveSiteSettings} className="bg-warm-white border border-warm-gray/50 rounded-2xl p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-warm-gray/40 pb-4">
                <Type className="w-5 h-5 text-brass" />
                <h3 className="text-base font-bold text-charcoal">Announcement Ticker &amp; Studio Quote</h3>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="input-label">Top Announcement Ticker Banner Text *</label>
                  <textarea
                    rows={2}
                    value={siteSettings.ticker_text}
                    onChange={(e) => setSiteSettings({ ...siteSettings, ticker_text: e.target.value })}
                    className="input-field"
                    required
                  />
                  <span className="text-[10px] text-mid-gray mt-1 block">Displayed on the top header ticker bar across the customer storefront.</span>
                </div>

                <div>
                  <label className="input-label">Homepage Brand Quote *</label>
                  <textarea
                    rows={2}
                    value={siteSettings.brand_quote}
                    onChange={(e) => setSiteSettings({ ...siteSettings, brand_quote: e.target.value })}
                    className="input-field font-brand text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Support Email</label>
                    <input
                      type="email"
                      value={siteSettings.contact_email}
                      onChange={(e) => setSiteSettings({ ...siteSettings, contact_email: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="input-label">Support Phone</label>
                    <input
                      type="text"
                      value={siteSettings.contact_phone}
                      onChange={(e) => setSiteSettings({ ...siteSettings, contact_phone: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={saving} className="btn-soft flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving…' : 'Save Ticker &amp; Quote Settings'}</span>
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
};
export default AdminSettings;
