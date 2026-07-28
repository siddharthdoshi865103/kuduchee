"""Serializers for auth, profile, address, catalog, e-commerce, and dynamic site content."""
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Profile,
    Address,
    Category,
    Product,
    ProductVariant,
    ProductImage,
    WishlistItem,
    CartItem,
    PaymentSettings,
    Order,
    OrderItem,
    Review,
    HeroBanner,
    SiteSettings,
)


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['phone_number']


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'profile']
        read_only_fields = ['id', 'username', 'is_staff']


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    phone_number = serializers.CharField(max_length=15, required=False, allow_blank=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        phone_number = validated_data.pop('phone_number', '')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            is_staff=False,
        )
        if phone_number:
            user.profile.phone_number = phone_number
            user.profile.save()
        return user


class ProfileUpdateSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    email = serializers.EmailField(required=False)
    phone_number = serializers.CharField(max_length=15, required=False, allow_blank=True)

    def validate_email(self, value):
        user = self.context.get('request').user
        if User.objects.filter(email=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("This email is already taken by another user.")
        return value

    def update(self, instance, validated_data):
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)
        instance.save()

        phone_number = validated_data.get('phone_number')
        if phone_number is not None:
            instance.profile.phone_number = phone_number
            instance.profile.save()

        return instance


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            'id', 'full_name', 'phone', 'street_address', 'apartment',
            'city', 'state', 'postal_code', 'is_default',
        ]
        read_only_fields = ['id']


# ─── Catalog Serializers ──────────────────────────────────────────────────────

class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image_url', 'is_featured', 'product_count', 'created_at']
        read_only_fields = ['id', 'slug', 'product_count', 'created_at']

    def get_product_count(self, obj):
        return obj.products.count()


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ['id', 'product', 'name', 'sku', 'mrp', 'offer_price', 'stock_quantity']
        read_only_fields = ['id']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'product', 'image_url', 'alt_text', 'is_primary']
        read_only_fields = ['id']


class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    user_first_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'product', 'user', 'username', 'user_first_name', 'rating', 'comment', 'is_verified_buyer', 'is_approved', 'created_at']
        read_only_fields = ['id', 'user', 'username', 'user_first_name', 'is_verified_buyer', 'is_approved', 'created_at']

    def get_username(self, obj):
        return obj.user.username if obj.user else 'Verified Buyer'

    def get_user_first_name(self, obj):
        return obj.user.first_name if obj.user else 'Verified'


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    category_slug = serializers.ReadOnlyField(source='category.slug')
    variants = ProductVariantSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    reviews_count = serializers.SerializerMethodField()
    avg_rating = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'category', 'category_name', 'category_slug', 'name', 'slug',
            'description', 'mrp', 'offer_price', 'stock_quantity', 'is_active',
            'is_featured', 'badge', 'primary_image_url', 'is_in_stock',
            'is_low_stock', 'variants', 'images', 'reviews_count', 'avg_rating',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'is_in_stock', 'is_low_stock', 'reviews_count', 'avg_rating', 'created_at', 'updated_at']

    def get_reviews_count(self, obj):
        return obj.reviews.count()

    def get_avg_rating(self, obj):
        reviews = obj.reviews.all()
        if not reviews:
            return 5.0
        return round(sum(r.rating for r in reviews) / len(reviews), 1)


# ─── E-Commerce Serializers ────────────────────────────────────────────────────

class WishlistItemSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)

    class Meta:
        model = WishlistItem
        fields = ['id', 'product', 'product_details', 'created_at']
        read_only_fields = ['id', 'created_at']


class CartItemSerializer(serializers.ModelSerializer):
    variant = serializers.PrimaryKeyRelatedField(
        queryset=ProductVariant.objects.all(),
        required=False,
        allow_null=True
    )
    product_details = ProductSerializer(source='product', read_only=True)
    variant_details = ProductVariantSerializer(source='variant', read_only=True)
    unit_price = serializers.ReadOnlyField()
    total_price = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_details', 'variant', 'variant_details', 'quantity', 'unit_price', 'total_price', 'created_at']
        read_only_fields = ['id', 'unit_price', 'total_price', 'created_at']


class PaymentSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentSettings
        fields = [
            'id', 'upi_id', 'payee_name', 'qr_code_url',
            'is_qr_enabled', 'is_razorpay_enabled',
            'razorpay_key_id', 'razorpay_key_secret', 'updated_at'
        ]
        read_only_fields = ['id', 'updated_at']
        extra_kwargs = {
            'razorpay_key_secret': {'write_only': True}
        }


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'variant_name', 'unit_price', 'quantity', 'total_price']
        read_only_fields = ['id']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_username = serializers.ReadOnlyField(source='user.username')
    customer_email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer_username', 'customer_email',
            'status', 'total_amount', 'shipping_address_snapshot',
            'payment_method', 'utr_number', 'payment_proof_url',
            'rejection_reason', 'cancellation_reason', 'refund_bank_details',
            'refund_transaction_ref', 'refund_notes',
            'tracking_notes', 'tracking_number', 'courier_partner',
            'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'order_number', 'customer_username', 'customer_email', 'created_at', 'updated_at']


# ─── Dynamic Site Content Serializers ─────────────────────────────────────────

class HeroBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroBanner
        fields = [
            'id', 'tagline', 'title', 'quote', 'cta_text', 'cta_link',
            'image_url', 'accent_badge', 'order', 'is_active'
        ]


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = [
            'id', 'ticker_text', 'brand_quote', 'brand_author',
            'contact_email', 'contact_phone', 'company_legal_name',
            'company_location', 'updated_at'
        ]
        read_only_fields = ['id', 'updated_at']
