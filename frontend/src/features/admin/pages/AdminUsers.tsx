import React, { useEffect, useState } from 'react';
import { orderService } from '../../../services/orderService';
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  ShieldCheck,
  ClipboardList,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface UserInfoData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  is_staff: boolean;
  date_joined: string;
  total_orders: number;
  total_spent: number;
  default_address: string | null;
}

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserInfoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | 'STAFF' | 'CUSTOMER'>('ALL');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await orderService.getUsersInfo();
        setUsers(data);
      } catch {
        toast.error('Failed to load user information.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const fullName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
    const matchesSearch =
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fullName.includes(searchQuery.toLowerCase()) ||
      (u.phone_number && u.phone_number.includes(searchQuery));

    const matchesRole =
      filterRole === 'ALL' ||
      (filterRole === 'STAFF' && u.is_staff) ||
      (filterRole === 'CUSTOMER' && !u.is_staff);

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-gray/40 pb-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-brass block mb-1">
            Studio Intelligence Console
          </span>
          <h1 className="font-brand text-2xl md:text-3xl text-charcoal">Registered User Accounts</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-[#17150F] text-brass text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full border border-brass/20 flex items-center gap-1.5 shadow-sm">
            <Users className="w-3.5 h-3.5" />
            <span>Total Accounts: {users.length}</span>
          </div>
        </div>
      </div>

      {/* Toolbar Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-warm-white border border-warm-gray/50 rounded-2xl p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-mid-gray absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by username, email, full name, or phone number…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-porcelain/60 border border-warm-gray/40 rounded-xl pl-10 pr-4 py-2.5 text-xs text-charcoal focus:outline-none focus:border-brass"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-mid-gray">Role:</span>
            <select
              value={filterRole}
              onChange={(e: any) => setFilterRole(e.target.value)}
              className="bg-porcelain/60 border border-warm-gray/40 rounded-xl px-3 py-2 text-xs text-charcoal focus:outline-none focus:border-brass"
            >
              <option value="ALL">All Accounts</option>
              <option value="CUSTOMER">Customers Only</option>
              <option value="STAFF">Administrators Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List Grid / Table */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-3 border-brass border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-xs font-medium text-mid-gray uppercase tracking-widest">Retrieving User Data…</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-warm-white border border-dashed border-warm-gray rounded-2xl p-16 text-center shadow-sm">
          <Users className="w-12 h-12 text-mid-gray/30 mx-auto mb-4" />
          <h3 className="font-brand text-2xl text-charcoal mb-2">No Registered Users Found</h3>
          <p className="text-[13px] text-mid-gray font-light max-w-sm mx-auto">
            Try adjusting your search criteria or role filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              className={`bg-warm-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between ${
                u.is_staff ? 'border-brass/50 bg-gradient-to-br from-warm-white to-[#F9F6EE]' : 'border-warm-gray/50'
              }`}
            >
              <div className="space-y-4">
                {/* Username & Avatar Row */}
                <div className="flex items-center justify-between border-b border-warm-gray/30 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border shadow-inner ${
                      u.is_staff
                        ? 'bg-brass/25 border-brass/50 text-[#17150F]'
                        : 'bg-porcelain border-warm-gray/50 text-charcoal'
                    }`}>
                      {u.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-charcoal text-sm">{u.username}</span>
                        {u.is_staff ? (
                          <span className="inline-flex items-center gap-0.5 bg-brass/20 text-[#17150F] text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-brass/35">
                            <ShieldCheck className="w-2.5 h-2.5" /> Staff
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-indigo-200/50">
                            Customer
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-mid-gray/80 font-light block">
                        {u.first_name || u.last_name ? `${u.first_name} ${u.last_name}` : 'Name Not Set'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-mid-gray">ID: #{u.id}</span>
                </div>

                {/* Contact & Address Stats */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-charcoal">
                    <Mail className="w-3.5 h-3.5 text-brass" />
                    <span>{u.email}</span>
                  </div>
                  {u.phone_number && (
                    <div className="flex items-center gap-2 text-charcoal">
                      <Phone className="w-3.5 h-3.5 text-brass" />
                      <span>{u.phone_number}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2 text-charcoal">
                    <MapPin className="w-3.5 h-3.5 text-brass shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      {u.default_address || <span className="text-mid-gray/55 italic">No shipping address set yet</span>}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-mid-gray font-light">
                    <Calendar className="w-3.5 h-3.5 text-mid-gray/60" />
                    <span>Joined: {u.date_joined}</span>
                  </div>
                </div>
              </div>

              {/* Order Performance and Metrics */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-warm-gray/30 bg-[#FAF8F5]/60 -mx-6 -mb-6 p-6 rounded-b-2xl">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-mid-gray block">
                    Orders Placed
                  </span>
                  <div className="flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-brass" />
                    <span className="font-bold text-charcoal text-sm">{u.total_orders} order(s)</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-mid-gray block">
                    Total Spent
                  </span>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-charcoal text-sm">₹{u.total_spent.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default AdminUsers;
