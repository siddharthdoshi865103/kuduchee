from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Profile, Address,
    Category, Product, ProductVariant, ProductImage,
    WishlistItem, CartItem,
    PaymentSettings, Order, OrderItem,
    Review, HeroBanner, SiteSettings,
)


# ─── Site Admin Customization ─────────────────────────────────────────────────

admin.site.site_header = "Kuduchee Admin"
admin.site.site_title  = "Kuduchee Studio"
admin.site.index_title = "Welcome to Kuduchee Admin Panel"


# ─── Auth & Profile ───────────────────────────────────────────────────────────

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display  = ('user', 'phone_number', 'created_at')
    search_fields = ('user__username', 'user__email', 'phone_number')
    readonly_fields = ('created_at',)


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display  = ('user', 'full_name', 'street_address', 'city', 'state', 'postal_code', 'is_default')
    list_filter   = ('is_default', 'state', 'city')
    search_fields = ('user__username', 'full_name', 'street_address', 'city', 'postal_code')


# ─── Catalog ──────────────────────────────────────────────────────────────────

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display        = ('name', 'slug', 'is_featured', 'created_at')
    list_filter         = ('is_featured',)
    search_fields       = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields     = ('created_at',)


class ProductVariantInline(admin.TabularInline):
    model  = ProductVariant
    extra  = 1
    fields = ('name', 'sku', 'mrp', 'offer_price', 'stock_quantity')


class ProductImageInline(admin.TabularInline):
    model  = ProductImage
    extra  = 1
    fields = ('image_url', 'alt_text', 'is_primary')


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display        = ('name', 'category', 'badge', 'mrp', 'offer_price',
                           'stock_quantity', 'is_active', 'is_featured', 'created_at')
    list_filter         = ('category', 'is_active', 'is_featured', 'badge')
    list_editable       = ('is_active', 'is_featured', 'badge')
    search_fields       = ('name', 'description', 'category__name')
    prepopulated_fields = {'slug': ('name',)}
    inlines             = [ProductVariantInline, ProductImageInline]
    readonly_fields     = ('created_at', 'updated_at')

    def thumbnail(self, obj):
        if obj.primary_image_url:
            return format_html('<img src="{}" style="height:50px;border-radius:4px;" />', obj.primary_image_url)
        return '—'
    thumbnail.short_description = 'Image'


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display  = ('product', 'name', 'sku', 'mrp', 'offer_price', 'stock_quantity')
    search_fields = ('product__name', 'name', 'sku')
    list_filter   = ('product__category',)


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display  = ('product', 'alt_text', 'is_primary', 'created_at')
    list_filter   = ('is_primary',)
    search_fields = ('product__name', 'alt_text')


# ─── E-Commerce ───────────────────────────────────────────────────────────────

@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display  = ('user', 'product', 'created_at')
    search_fields = ('user__username', 'product__name')
    list_filter   = ('product__category',)


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display  = ('user', 'product', 'variant', 'quantity', 'created_at')
    search_fields = ('user__username', 'product__name')
    list_filter   = ('product__category',)


@admin.register(PaymentSettings)
class PaymentSettingsAdmin(admin.ModelAdmin):
    list_display = ('upi_id', 'payee_name', 'is_qr_enabled', 'is_razorpay_enabled', 'updated_at')


# ─── Orders ───────────────────────────────────────────────────────────────────

class OrderItemInline(admin.TabularInline):
    model           = OrderItem
    extra           = 0
    readonly_fields = ('product', 'product_name', 'variant_name', 'unit_price', 'quantity', 'total_price')
    can_delete      = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display    = ('order_number', 'user', 'status', 'total_amount',
                       'payment_method', 'utr_number', 'created_at')
    list_filter     = ('status', 'payment_method', 'created_at')
    search_fields   = ('order_number', 'user__username', 'user__email', 'utr_number')
    readonly_fields = ('order_number', 'created_at', 'updated_at')
    inlines         = [OrderItemInline]
    list_editable   = ('status',)
    ordering        = ('-created_at',)

    fieldsets = (
        ('Order Info', {
            'fields': ('order_number', 'user', 'status', 'total_amount', 'created_at', 'updated_at')
        }),
        ('Payment', {
            'fields': ('payment_method', 'utr_number', 'payment_proof_url')
        }),
        ('Shipping & Tracking', {
            'fields': ('shipping_address_snapshot', 'tracking_number', 'courier_partner', 'tracking_notes')
        }),
        ('Cancellation / Rejection', {
            'fields': ('rejection_reason', 'cancellation_reason')
        }),
        ('Refund', {
            'fields': ('refund_bank_details', 'refund_transaction_ref', 'refund_notes'),
            'classes': ('collapse',)
        }),
    )

    actions = ['mark_approved', 'mark_processing', 'mark_shipped', 'mark_delivered', 'mark_cancelled']

    @admin.action(description='✅ Mark as Approved')
    def mark_approved(self, request, queryset):
        queryset.update(status='APPROVED')

    @admin.action(description='📦 Mark as Processing')
    def mark_processing(self, request, queryset):
        queryset.update(status='PROCESSING')

    @admin.action(description='🚚 Mark as Shipped')
    def mark_shipped(self, request, queryset):
        queryset.update(status='SHIPPED')

    @admin.action(description='✔️ Mark as Delivered')
    def mark_delivered(self, request, queryset):
        queryset.update(status='DELIVERED')

    @admin.action(description='❌ Mark as Cancelled')
    def mark_cancelled(self, request, queryset):
        queryset.update(status='CANCELLED')


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display  = ('order', 'product_name', 'variant_name', 'unit_price', 'quantity', 'total_price')
    search_fields = ('order__order_number', 'product_name')
    list_filter   = ('order__status',)


# ─── Reviews ──────────────────────────────────────────────────────────────────

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display    = ('product', 'user', 'rating', 'is_verified_buyer', 'is_approved', 'created_at')
    list_filter     = ('is_approved', 'is_verified_buyer', 'rating')
    search_fields   = ('product__name', 'user__username', 'comment')
    list_editable   = ('is_approved',)
    readonly_fields = ('created_at',)
    actions         = ['approve_reviews', 'reject_reviews']

    @admin.action(description='✅ Approve selected reviews')
    def approve_reviews(self, request, queryset):
        queryset.update(is_approved=True)

    @admin.action(description='❌ Reject selected reviews')
    def reject_reviews(self, request, queryset):
        queryset.update(is_approved=False)


# ─── Site Content ─────────────────────────────────────────────────────────────

@admin.register(HeroBanner)
class HeroBannerAdmin(admin.ModelAdmin):
    list_display  = ('title', 'tagline', 'accent_badge', 'order', 'is_active')
    list_editable = ('order', 'is_active')
    list_filter   = ('is_active',)
    search_fields = ('title', 'tagline')


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ('company_legal_name', 'contact_email', 'contact_phone', 'updated_at')
