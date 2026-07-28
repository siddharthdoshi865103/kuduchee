"""URL routing for the api app."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    RegisterView,
    AdminSendOTPView,
    AdminVerifyOTPView,
    ProfileView,
    AddressViewSet,
    CategoryViewSet,
    ProductViewSet,
    ProductVariantViewSet,
    ProductImageViewSet,
    WishlistItemViewSet,
    CartItemViewSet,
    PaymentSettingsView,
    OrderViewSet,
    ReviewViewSet,
    AnalyticsDashboardView,
    RazorpayPaymentView,
    HeroBannerViewSet,
    SiteSettingsView,
    AdminUserInfoView,
)

router = DefaultRouter()
router.register(r'auth/addresses', AddressViewSet, basename='address')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'variants', ProductVariantViewSet, basename='variant')
router.register(r'images', ProductImageViewSet, basename='image')
router.register(r'hero-banners', HeroBannerViewSet, basename='herobanner')
router.register(r'wishlist', WishlistItemViewSet, basename='wishlist')
router.register(r'cart', CartItemViewSet, basename='cart')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'reviews', ReviewViewSet, basename='review')

urlpatterns = [
    # JWT auth
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Admin OTP Auth
    path('auth/admin-send-otp/', AdminSendOTPView.as_view(), name='admin_send_otp'),
    path('auth/admin-verify-otp/', AdminVerifyOTPView.as_view(), name='admin_verify_otp'),

    # Registration & profile
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/profile/', ProfileView.as_view(), name='profile'),

    # Dynamic Site Content & Settings
    path('site-settings/', SiteSettingsView.as_view(), name='site_settings'),
    path('payments/settings/', PaymentSettingsView.as_view(), name='payment_settings'),
    path('payments/razorpay/', RazorpayPaymentView.as_view(), name='razorpay_payment'),

    # Analytics
    path('analytics/dashboard/', AnalyticsDashboardView.as_view(), name='analytics_dashboard'),
    path('analytics/users/', AdminUserInfoView.as_view(), name='admin_users'),

    # Router-based endpoints
    path('', include(router.urls)),
]
