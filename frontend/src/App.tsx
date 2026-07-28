import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ProtectedRoute } from './components/guards/ProtectedRoute';

// Layout Wrappers
import { StorefrontLayout } from './components/layouts/StorefrontLayout';
import { AdminLayout } from './components/layouts/AdminLayout';

// Customer Pages
import Home from './features/customer/pages/Home';
import Shop from './features/customer/pages/Shop';
import ProductDetail from './features/customer/pages/ProductDetail';
import Wishlist from './features/customer/pages/Wishlist';
import Cart from './features/customer/pages/Cart';
import Checkout from './features/customer/pages/Checkout';
import OrderSuccess from './features/customer/pages/OrderSuccess';
import OrderHistory from './features/customer/pages/OrderHistory';
import Profile from './features/customer/pages/Profile';
import CustomerLogin from './features/customer/pages/CustomerLogin';
import CustomerRegister from './features/customer/pages/CustomerRegister';
import AboutUs from './features/customer/pages/AboutUs';
import ContactUs from './features/customer/pages/ContactUs';

// Admin Pages
import AdminLogin from './features/admin/pages/AdminLogin';
import AdminRegister from './features/admin/pages/AdminRegister';
import AdminDashboard from './features/admin/pages/AdminDashboard';
import AdminProducts from './features/admin/pages/AdminProducts';
import AdminCategories from './features/admin/pages/AdminCategories';
import AdminOrders from './features/admin/pages/AdminOrders';
import AdminCancellations from './features/admin/pages/AdminCancellations';
import AdminSettings from './features/admin/pages/AdminSettings';
import AdminUsers from './features/admin/pages/AdminUsers';

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <BrowserRouter>
            <Routes>
              {/* Customer Storefront Routes */}
              <Route path="/" element={<StorefrontLayout />}>
                <Route index element={<Home />} />
                <Route path="shop" element={<Shop />} />
                <Route path="about" element={<AboutUs />} />
                <Route path="contact" element={<ContactUs />} />
                <Route path="product/:slug" element={<ProductDetail />} />
                <Route path="login" element={<CustomerLogin />} />
                <Route path="register" element={<CustomerRegister />} />

                {/* Customer routes */}
                <Route path="cart" element={<Cart />} />
                <Route path="wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="order-success/:order_id" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
                <Route path="orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
                <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              </Route>

              {/* Admin Login & Register */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/register" element={<AdminRegister />} />

              {/* Protected Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="cancellations" element={<AdminCancellations />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#292521',
                color: '#FFFDF9',
                border: 'none',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
                borderRadius: '12px',
                padding: '12px 16px',
              },
              success: {
                iconTheme: { primary: '#C2B267', secondary: '#FAF8F5' },
              },
              error: {
                iconTheme: { primary: '#C1534E', secondary: '#FFFDF9' },
              },
            }}
          />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
