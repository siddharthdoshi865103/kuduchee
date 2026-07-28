import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../../context/AuthContext';
import { loginSchema, type LoginFormData } from '../../../utils/schemas';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, ArrowRight, ShieldCheck, FlameKindling } from 'lucide-react';

const BG_IMAGE = 'https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?w=1600&q=85&auto=format';

export const AdminLogin: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<LoginFormData>({ resolver: zodResolver(loginSchema), defaultValues: { username: '', password: '' } });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const user = await login(data.username, data.password);
      if (!user.is_staff) {
        toast.error('Access denied. This account does not have admin privileges.');
        return;
      }
      toast.success('Access granted. Welcome, Admin.');
      navigate('/admin/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Invalid admin credentials.');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-[#0A0907] font-sans">
      
      {/* ── BACKGROUND IMAGE & WARM KILN OVERLAYS ── */}
      <div className="absolute inset-0 z-0">
        <img
          src={BG_IMAGE}
          alt="Kuduchee Kiln Studio"
          className="w-full h-full object-cover filter brightness-[0.3] contrast-[1.1]"
        />
        {/* Obsidian dark overlay with warm amber accent */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(10,8,6,0.96) 0%, rgba(45,30,15,0.7) 50%, rgba(10,8,6,0.96) 100%)',
          }}
        />
        {/* Soft radial vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_5%,#0A0907_90%)]" />
      </div>

      {/* ── AMBIENT FIRE GLOWS (Behind Card) ── */}
      <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-[#D4B892]/5 blur-[90px] pointer-events-none animate-float" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-[#B91C1C]/10 blur-[110px] pointer-events-none animate-float" style={{ animationDelay: '-3s' }} />

      {/* ── MAIN CONTENT CONTAINER (Z-10) ── */}
      <div className="relative z-10 w-full max-w-[450px] animate-fadeIn">
        
        {/* Obsidian Admin Card */}
        <div className="bg-[#0E0D0B]/80 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 md:p-10 shadow-[0_30px_80px_rgba(0,0,0,0.85)] space-y-7 relative overflow-hidden">
          
          {/* Subtle Gold/Amber Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4B892]/45 to-transparent" />

          {/* Logo & Subtitle */}
          <div className="text-center space-y-3">
            <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
              <img src="/kuduchee-logo-transparent.png" alt="Kuduchee Admin" className="h-11 w-auto object-contain mx-auto" />
            </Link>
            <span className="block text-[8px] uppercase tracking-[0.45em] text-[#D4B892]/70 font-semibold">
              Admin Control Console
            </span>
          </div>

          {/* Form Header */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4B892]/10 border border-[#D4B892]/25 text-[#D4B892] text-[9px] font-bold uppercase tracking-widest">
              <Lock className="w-3 h-3" />
              <span>Staff Access Control</span>
            </div>
            <h1 className="font-brand text-2xl md:text-3xl text-warm-white tracking-tight font-normal pt-1">
              Admin Sign In
            </h1>
            <p className="text-[11px] text-warm-white/40 leading-relaxed font-light max-w-xs mx-auto">
              Please enter your administrator credentials to access the studio control panel.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1" noValidate>
            {/* Username Input */}
            <div className="space-y-1.5">
              <label htmlFor="admin-username" className="block text-[9px] font-bold uppercase tracking-widest text-[#D4B892]/80">
                Admin Username
              </label>
              <input
                {...register('username')}
                id="admin-username"
                name="username"
                type="text"
                placeholder="Enter admin username"
                className={`w-full rounded-xl px-4 py-3.5 text-xs bg-white/5 border text-warm-white placeholder-white/10 focus:outline-none focus:border-[#D4B892] focus:bg-white/10 transition-all font-light ${
                  errors.username ? 'border-error/60' : 'border-white/5'
                }`}
              />
              {errors.username && <p className="text-[10px] text-[#F87171] font-medium">{errors.username.message}</p>}
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label htmlFor="admin-password" className="block text-[9px] font-bold uppercase tracking-widest text-[#D4B892]/80">
                Admin Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full rounded-xl px-4 py-3.5 text-xs bg-white/5 border text-warm-white placeholder-white/10 focus:outline-none focus:border-[#D4B892] focus:bg-white/10 transition-all pr-11 font-light ${
                    errors.password ? 'border-error/60' : 'border-white/5'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-white/20 hover:text-white/50 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] text-[#F87171] font-medium">{errors.password.message}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#D4B892] text-charcoal hover:bg-[#C2B267] hover:shadow-brass-glow transition-all py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] shadow-md mt-6 font-semibold"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin" />
                  Verifying…
                </span>
              ) : (
                <>
                  <span>Sign In to Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Form Footer */}
          <div className="pt-4 flex items-center justify-between text-xs border-t border-white/5">
            <Link
              to="/"
              className="text-warm-white/40 hover:text-warm-white transition-colors"
            >
              ← Storefront
            </Link>
            <Link
              to="/admin/register"
              className="text-[#D4B892] hover:text-[#C2B267] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors hover:underline"
            >
              <span>Register Staff</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

        {/* Security & System Info Footer */}
        <div className="mt-8 flex justify-center gap-6 text-[10px] text-warm-white/30 font-light max-w-xs mx-auto">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4B892]/50 shrink-0" />
            <span>Staff Access Protocol</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FlameKindling className="w-3.5 h-3.5 text-[#D4B892]/50 shrink-0" />
            <span>Ahmedabad Kiln Studio</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
