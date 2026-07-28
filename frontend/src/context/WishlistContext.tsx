import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistService, type WishlistItemData } from '../services/wishlistService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface WishlistContextType {
  wishlistItems: WishlistItemData[];
  wishlistCount: number;
  loading: boolean;
  isInWishlist: (productId: number) => boolean;
  toggleWishlist: (productId: number) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItemData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistItems([]);
      return;
    }
    try {
      setLoading(true);
      const items = await wishlistService.getWishlist();
      setWishlistItems(items);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = (productId: number) => {
    return wishlistItems.some((item) => item.product === productId);
  };

  const toggleWishlist = async (productId: number) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to save items to your wishlist');
      return;
    }

    const existing = wishlistItems.find((item) => item.product === productId);
    try {
      if (existing) {
        await wishlistService.removeFromWishlist(existing.id);
        toast.success('Removed from wishlist');
      } else {
        await wishlistService.addToWishlist(productId);
        toast.success('Saved to wishlist');
      }
      fetchWishlist();
    } catch {
      toast.error('Wishlist update failed');
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistItems.length,
        loading,
        isInWishlist,
        toggleWishlist,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
