import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, LogIn, UserPlus } from 'lucide-react';

interface AuthRedirectModalProps {
  onClose: () => void;
}

export const AuthRedirectModal: React.FC<AuthRedirectModalProps> = ({ onClose }) => {
  const navigate = useNavigate();

  const handleAction = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-charcoal/50 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md bg-warm-white rounded-3xl border border-warm-gray/70 shadow-[0_25px_60px_-15px_rgba(27,24,20,0.25)] overflow-hidden animate-fadeIn z-10 font-sans">
        
        {/* Top Decorative Banner */}
        <div className="relative h-32 bg-[#1C1A17] flex flex-col justify-end p-6 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80" 
            alt="Stoneware studio" 
            className="absolute inset-0 w-full h-full object-cover filter brightness-[0.45] contrast-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1A17] via-[#1C1A17]/40 to-transparent" />
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/25 text-white/80 hover:text-white transition-all z-20"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-brass/25 border border-brass/35 text-[#F5D9A8] text-[9px] font-bold uppercase tracking-widest self-start mb-2">
            <Sparkles className="w-3 h-3 text-brass" />
            <span>Studio Membership Perks</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="font-brand text-2xl md:text-3xl text-charcoal tracking-tight font-normal leading-tight">
              Curate Your Collection
            </h2>
            <p className="text-xs text-mid-gray leading-relaxed font-light">
              To start adding these handcrafted stoneware vessels to your cart, please sign in. Membership offers pre-access to limited run batches, saved addresses, and insured studio tracking.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            {/* Primary Action: Sign In */}
            <button
              onClick={() => handleAction('/login')}
              className="w-full bg-charcoal text-warm-white hover:bg-brass hover:text-charcoal transition-all py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Profile</span>
            </button>

            {/* Secondary Action: Register */}
            <button
              onClick={() => handleAction('/register')}
              className="w-full bg-[#FAF8F5] text-charcoal border border-warm-gray/80 hover:bg-charcoal/5 transition-all py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <UserPlus className="w-4 h-4 text-charcoal/60" />
              <span>Create New Account</span>
            </button>
          </div>

          <div className="text-center pt-2">
            <button 
              onClick={onClose}
              className="text-[11px] text-mid-gray/80 hover:text-charcoal hover:underline uppercase tracking-widest font-semibold transition-colors"
            >
              Continue Browsing
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
