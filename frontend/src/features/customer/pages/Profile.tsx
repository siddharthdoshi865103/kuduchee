import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../utils/api';
import { profileSchema, type ProfileFormData, addressSchema, type AddressFormData } from '../../../utils/schemas';
import toast from 'react-hot-toast';
import { MapPin, Plus, Trash2, Edit, X, Star, Phone } from 'lucide-react';

interface Address {
  id: number;
  full_name: string;
  phone: string;
  street_address: string;
  apartment: string | null;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
}

export const Profile: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [mobileTab, setMobileTab] = useState<'profile' | 'addresses'>('profile');

  const {
    register: regProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const {
    register: regAddress,
    handleSubmit: handleAddressSubmit,
    formState: { errors: addressErrors, isSubmitting: addressSubmitting },
    reset: resetAddress,
    setValue: setAddressValue,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: { is_default: false },
  });

  useEffect(() => {
    if (user) {
      resetProfile({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.profile?.phone_number || '',
      });
    }
  }, [user, resetProfile]);

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/auth/addresses/');
      const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setAddresses(list);
    } catch {
      setAddresses([]);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      await api.put('/auth/profile/', data);
      await refreshProfile();
      toast.success('Profile updated successfully');
    } catch (err: any) {
      const msg = err.response?.data;
      toast.error(msg ? Object.values(msg).flat().join(' ') : 'Update failed');
    }
  };

  const onAddressSubmit = async (data: AddressFormData) => {
    try {
      if (editingAddress) {
        await api.put(`/auth/addresses/${editingAddress.id}/`, data);
        toast.success('Address updated');
      } else {
        await api.post('/auth/addresses/', data);
        toast.success('Address added');
      }
      resetAddress({ full_name: '', phone: '', street_address: '', apartment: '', city: '', state: '', postal_code: '', is_default: false });
      setShowAddressForm(false);
      setEditingAddress(null);
      fetchAddresses();
    } catch {
      toast.error('Failed to save address');
    }
  };

  const deleteAddress = async (id: number) => {
    try {
      await api.delete(`/auth/addresses/${id}/`);
      toast.success('Address removed');
      fetchAddresses();
    } catch {
      toast.error('Failed to delete address');
    }
  };

  const startEdit = (addr: Address) => {
    setEditingAddress(addr);
    setShowAddressForm(true);
    setAddressValue('full_name', addr.full_name || '');
    setAddressValue('phone', addr.phone || '');
    setAddressValue('street_address', addr.street_address);
    setAddressValue('apartment', addr.apartment || '');
    setAddressValue('city', addr.city);
    setAddressValue('state', addr.state);
    setAddressValue('postal_code', addr.postal_code);
    setAddressValue('is_default', addr.is_default);
  };

  const cancelAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
    resetAddress({ full_name: '', phone: '', street_address: '', apartment: '', city: '', state: '', postal_code: '', is_default: false });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-12 space-y-5 md:space-y-8 text-left animate-fadeIn">
      {/* Page Header */}
      <div className="border-b border-warm-gray/40 pb-4 md:pb-6">
        <h1 className="text-2xl md:text-3xl font-brand font-normal text-charcoal mb-1">My Account</h1>
        <p className="text-[13px] text-mid-gray font-light">Manage your profile details and shipping addresses</p>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex items-center border border-warm-gray/40 rounded-xl overflow-hidden bg-porcelain/50">
        <button
          onClick={() => setMobileTab('profile')}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
            mobileTab === 'profile'
              ? 'bg-brass text-charcoal shadow-sm'
              : 'text-mid-gray hover:text-charcoal'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setMobileTab('addresses')}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
            mobileTab === 'addresses'
              ? 'bg-brass text-charcoal shadow-sm'
              : 'text-mid-gray hover:text-charcoal'
          }`}
        >
          Addresses {addresses.length > 0 && `(${addresses.length})`}
        </button>
      </div>

      <div className="grid md:grid-cols-5 gap-5 md:gap-8">
        {/* Left — Profile Card (show on desktop always, on mobile only when tab=profile) */}
        <div className={`md:col-span-2 ${mobileTab !== 'profile' ? 'hidden md:block' : ''}`}>
          <div className="bg-warm-white border border-warm-gray/50 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-warm-gray/30">
              <div className="w-10 h-10 rounded-full bg-brass text-charcoal flex items-center justify-center text-sm font-bold uppercase">
                {user?.first_name?.[0] || user?.username?.[0] || 'U'}
              </div>
              <div>
                <h3 className="text-sm font-bold text-charcoal">{user?.first_name} {user?.last_name}</h3>
                <p className="text-[11px] text-mid-gray">@{user?.username}</p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal/60 mb-1.5">First Name</label>
                  <input {...regProfile('first_name')} className="input-field" placeholder="First" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal/60 mb-1.5">Last Name</label>
                  <input {...regProfile('last_name')} className="input-field" placeholder="Last" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal/60 mb-1.5">Email</label>
                <input {...regProfile('email')} type="email" className={`input-field ${profileErrors.email ? 'input-field-error' : ''}`} />
                {profileErrors.email && <p className="text-[10px] text-error mt-1">{profileErrors.email.message}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal/60 mb-1.5">Phone</label>
                <input {...regProfile('phone_number')} type="tel" placeholder="10-digit number" className={`input-field ${profileErrors.phone_number ? 'input-field-error' : ''}`} />
                {profileErrors.phone_number && <p className="text-[10px] text-error mt-1">{profileErrors.phone_number.message}</p>}
              </div>

              <button
                type="submit"
                disabled={profileSubmitting}
                className="w-full bg-brass text-charcoal rounded-xl py-2.5 text-[13px] font-semibold hover:bg-brass-hover transition-all shadow-sm disabled:opacity-50 active:scale-[0.98]"
              >
                {profileSubmitting ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>

        {/* Right — Addresses (show on desktop always, on mobile only when tab=addresses) */}
        <div className={`md:col-span-3 space-y-5 ${mobileTab !== 'addresses' ? 'hidden md:block' : ''}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-charcoal flex items-center gap-2">
              <MapPin className="w-4.5 h-4.5 text-brass" />
              Shipping Addresses
            </h3>
            {!showAddressForm && (
              <button
                onClick={() => { setShowAddressForm(true); setEditingAddress(null); resetAddress(); }}
                className="flex items-center gap-1.5 bg-brass text-charcoal px-4 py-2 rounded-xl text-[12px] font-semibold hover:bg-brass-hover transition-all shadow-sm active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Address
              </button>
            )}
          </div>

          {/* Address Form */}
          {showAddressForm && (
            <div className="bg-warm-white border border-brass/20 rounded-2xl p-6 shadow-sm animate-fadeIn">
              <div className="flex justify-between items-center mb-5">
                <h4 className="text-sm font-bold text-charcoal">{editingAddress ? 'Edit Address' : 'New Address'}</h4>
                <button onClick={cancelAddressForm} className="text-mid-gray hover:text-charcoal transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleAddressSubmit(onAddressSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal/60 mb-1.5">Full Name</label>
                    <input {...regAddress('full_name')} placeholder="Recipient name" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal/60 mb-1.5">Phone</label>
                    <input {...regAddress('phone')} placeholder="Contact number" className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal/60 mb-1.5">Street Address *</label>
                  <input {...regAddress('street_address')} placeholder="e.g. 42, MG Road" className={`input-field ${addressErrors.street_address ? 'input-field-error' : ''}`} />
                  {addressErrors.street_address && <p className="text-[10px] text-error mt-1">{addressErrors.street_address.message}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal/60 mb-1.5">Apartment / Floor</label>
                  <input {...regAddress('apartment')} placeholder="Flat 4B, 2nd Floor" className="input-field" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal/60 mb-1.5">City *</label>
                    <input {...regAddress('city')} placeholder="City" className={`input-field ${addressErrors.city ? 'input-field-error' : ''}`} />
                    {addressErrors.city && <p className="text-[10px] text-error mt-1">{addressErrors.city.message}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal/60 mb-1.5">State *</label>
                    <input {...regAddress('state')} placeholder="State" className={`input-field ${addressErrors.state ? 'input-field-error' : ''}`} />
                    {addressErrors.state && <p className="text-[10px] text-error mt-1">{addressErrors.state.message}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal/60 mb-1.5">PIN *</label>
                    <input {...regAddress('postal_code')} placeholder="6 digits" className={`input-field ${addressErrors.postal_code ? 'input-field-error' : ''}`} />
                    {addressErrors.postal_code && <p className="text-[10px] text-error mt-1">{addressErrors.postal_code.message}</p>}
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input {...regAddress('is_default')} type="checkbox" className="accent-brass w-4 h-4 rounded" />
                  <span className="text-[12px] text-charcoal/70 font-medium">Set as default address</span>
                </label>
                <div className="flex gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={addressSubmitting}
                    className="flex-1 bg-brass text-charcoal rounded-xl py-2.5 text-[13px] font-semibold hover:bg-brass-hover transition-all shadow-sm disabled:opacity-50 active:scale-[0.98]"
                  >
                    {addressSubmitting ? 'Saving…' : editingAddress ? 'Update Address' : 'Save Address'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelAddressForm}
                    className="px-5 border border-warm-gray/50 rounded-xl text-[13px] font-medium text-charcoal/60 hover:border-charcoal/30 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Address List */}
          {(!Array.isArray(addresses) || addresses.length === 0) && !showAddressForm ? (
            <div className="bg-warm-white border border-dashed border-warm-gray rounded-2xl p-10 text-center">
              <MapPin className="w-10 h-10 text-mid-gray/30 mx-auto mb-3" />
              <p className="text-sm text-mid-gray font-medium">No shipping addresses yet</p>
              <p className="text-[12px] text-mid-gray/70 mt-1">Add your first address to make checkout faster</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(Array.isArray(addresses) ? addresses : []).map((addr) => (
                <div
                  key={addr.id}
                  className={`bg-warm-white border rounded-2xl p-5 flex justify-between items-start gap-4 transition-all hover:shadow-sm ${
                    addr.is_default ? 'border-brass/30 ring-1 ring-brass/10' : 'border-warm-gray/50'
                  }`}
                >
                  <div className="flex-grow min-w-0">
                    {addr.is_default && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brass uppercase tracking-wider mb-1.5">
                        <Star className="w-3 h-3 fill-brass" /> Default
                      </span>
                    )}
                    {addr.full_name && (
                      <p className="text-sm font-semibold text-charcoal">{addr.full_name}</p>
                    )}
                    <p className="text-sm font-medium text-charcoal leading-relaxed">
                      {addr.street_address}
                      {addr.apartment && `, ${addr.apartment}`}
                    </p>
                    <p className="text-[12px] text-mid-gray mt-0.5">
                      {addr.city}, {addr.state} — {addr.postal_code}
                    </p>
                    {addr.phone && (
                      <p className="text-[11px] text-mid-gray/70 mt-1 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-brass shrink-0" />
                        <span>{addr.phone}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => startEdit(addr)}
                      className="p-2 border border-warm-gray/40 rounded-lg text-mid-gray hover:text-brass hover:border-brass/30 transition-all"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteAddress(addr.id)}
                      className="p-2 border border-warm-gray/40 rounded-lg text-mid-gray hover:text-error hover:border-error/30 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Profile;
