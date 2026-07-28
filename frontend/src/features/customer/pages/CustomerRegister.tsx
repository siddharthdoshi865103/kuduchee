import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../../context/AuthContext';
import { registerSchema, type RegisterFormData } from '../../../utils/schemas';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Sparkles, ShieldCheck, ArrowRight, UserPlus } from 'lucide-react';

export const CustomerRegister: React.FC = () => {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await authRegister(data);
      toast.success('Account created! Welcome to Kuduchee.');
      navigate('/');
    } catch (err: any) {
      const errData = err.response?.data;
      if (errData) {
        const messages = Object.values(errData).flat().join(' ');
        toast.error(messages || 'Registration failed.');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 md:py-24 px-4 sm:px-6 md:px-8 bg-[#FAF8F5] relative overflow-hidden font-sans">
      
      {/* Editorial Luxury Ambient Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,_rgba(212,184,146,0.15)_0%,_transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,_rgba(196,168,130,0.12)_0%,_transparent_70%)] pointer-events-none" />

      {/* Grid Pattern overlay for texture */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.012)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(0,0,0,0.012)_1px,_transparent_1px)] bg-[size:32px_32px] opacity-100 pointer-events-none" />

      <div className="w-full max-w-4xl grid lg:grid-cols-12 gap-0 rounded-[32px] overflow-hidden border border-warm-gray/60 shadow-[0_30px_70px_-15px_rgba(27,24,20,0.15)] bg-warm-white relative z-10 animate-fadeIn">
        
        {/* Left Column: Stunning Editorial Stoneware Studio Banner */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-[#1C1A17] text-warm-white p-12 flex-col justify-between overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&q=80"
            alt="Kuduchee Stoneware Glazing"
            className="absolute inset-0 w-full h-full object-cover filter brightness-[0.4] contrast-[1.05] z-0 scale-102 transition-transform duration-[10000ms] hover:scale-108"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1A17] via-[#1C1A17]/35 to-transparent z-10" />

          {/* Top Branding Block */}
          <div className="relative z-20 space-y-2">
            <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
              <img src="/kuduchee-logo-transparent.png" alt="Kuduchee" className="h-11 w-auto object-contain" />
            </Link>
            <span className="text-[8px] uppercase tracking-[0.4em] text-brass/80 font-bold block leading-none">
              Studio &amp; Craft
            </span>
          </div>

          {/* Bottom Philosophy & Trust */}
          <div className="relative z-20 space-y-6">
            <div className="border-l-2 border-brass/50 pl-4 space-y-2">
              <p className="text-sm font-light italic font-brand text-warm-white/95 leading-relaxed">
                "Join our community of collectors and studio pottery enthusiasts."
              </p>
              <span className="text-[8px] uppercase tracking-[0.25em] text-brass font-bold block">
                — Ahmedabad Studio
              </span>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-white/10 text-[10px] text-warm-white/70">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-brass" />
                <span>Pre-Access to Limited Run Batches</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-brass" />
                <span>Fast 1-Click Order Tracking Queue</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Register Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-[#FCFAF7] relative">
          
          {/* Top gold accent line for registry column */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C2B267]/25 to-transparent lg:hidden" />

          <div className="space-y-6 max-w-md mx-auto w-full">
            
            {/* Header */}
            <div className="text-center lg:text-left space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brass/10 border border-brass/20 text-brass text-[9px] font-bold uppercase tracking-wider mb-1">
                <UserPlus className="w-3 h-3 text-brass" />
                <span>Customer Registry</span>
              </div>
              <h1 className="font-brand text-2xl md:text-3xl text-charcoal tracking-tight font-normal">Join Kuduchee</h1>
              <p className="text-xs text-mid-gray/80 font-light">
                Register below to create your customer profile and access the studio shop.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="reg-first-name" className="block text-[9px] font-bold uppercase tracking-widest text-[#9E7A4B]">First Name</label>
                  <input
                    {...register('first_name')}
                    id="reg-first-name"
                    name="first_name"
                    type="text"
                    placeholder="Enter first name"
                    className="w-full rounded-xl px-4 py-3 text-xs bg-warm-white/40 border border-warm-gray/60 focus:bg-white focus:outline-none focus:border-brass transition-all font-light text-charcoal"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="reg-last-name" className="block text-[9px] font-bold uppercase tracking-widest text-[#9E7A4B]">Last Name</label>
                  <input
                    {...register('last_name')}
                    id="reg-last-name"
                    name="last_name"
                    type="text"
                    placeholder="Enter last name"
                    className="w-full rounded-xl px-4 py-3 text-xs bg-warm-white/40 border border-warm-gray/60 focus:bg-white focus:outline-none focus:border-brass transition-all font-light text-charcoal"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="reg-username" className="block text-[9px] font-bold uppercase tracking-widest text-[#9E7A4B]">Username *</label>
                <input
                  {...register('username')}
                  id="reg-username"
                  name="username"
                  type="text"
                  placeholder="Choose unique username"
                  className={`w-full rounded-xl px-4 py-3 text-xs bg-warm-white/40 border focus:bg-white focus:outline-none focus:border-brass transition-all font-light text-charcoal ${
                    errors.username ? 'border-error/60' : 'border-warm-gray/60'
                  }`}
                />
                {errors.username && (
                  <p className="text-[10px] text-error font-medium">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="reg-email" className="block text-[9px] font-bold uppercase tracking-widest text-[#9E7A4B]">Email Address *</label>
                <input
                  {...register('email')}
                  id="reg-email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  className={`w-full rounded-xl px-4 py-3 text-xs bg-warm-white/40 border focus:bg-white focus:outline-none focus:border-brass transition-all font-light text-charcoal ${
                    errors.email ? 'border-error/60' : 'border-warm-gray/60'
                  }`}
                />
                {errors.email && (
                  <p className="text-[10px] text-error font-medium">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="reg-password" className="block text-[9px] font-bold uppercase tracking-widest text-[#9E7A4B]">Password *</label>
                <div className="relative">
                  <input
                    {...register('password')}
                    id="reg-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    className={`w-full rounded-xl px-4 py-3 text-xs bg-warm-white/40 border focus:bg-white focus:outline-none focus:border-brass transition-all pr-11 font-light text-charcoal ${
                      errors.password ? 'border-error/60' : 'border-warm-gray/60'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-mid-gray/70 hover:text-charcoal transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[10px] text-error font-medium">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-charcoal text-warm-white hover:bg-brass hover:text-charcoal hover:shadow-brass-glow transition-all py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] mt-4"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-warm-white/30 border-t-warm-white rounded-full animate-spin" />
                    Creating account…
                  </span>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Links */}
            <div className="pt-4 border-t border-warm-gray/40 flex items-center justify-between text-xs">
              <span className="text-mid-gray/80 font-light">Already have an account?</span>
              <Link
                to="/login"
                className="text-brass hover:text-brass-hover font-bold uppercase tracking-wider hover:underline flex items-center gap-1 transition-colors"
              >
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
export default CustomerRegister;
