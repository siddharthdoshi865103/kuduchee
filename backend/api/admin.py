from django.contrib import admin
from .models import Profile, Address, Category, Product, ProductVariant, ProductImage


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone_number', 'created_at')
    search_fields = ('user__username', 'user__email', 'phone_number')


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ('user', 'full_name', 'street_address', 'city', 'state', 'postal_code', 'is_default')
    list_filter = ('is_default', 'state', 'city')
    search_fields = ('user__username', 'full_name', 'street_address', 'city', 'postal_code')


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_featured', 'created_at')
    list_filter = ('is_featured',)
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'mrp', 'offer_price', 'stock_quantity', 'is_active', 'is_featured', 'badge')
    list_filter = ('category', 'is_active', 'is_featured', 'badge')
    search_fields = ('name', 'description', 'category__name')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductVariantInline, ProductImageInline]
