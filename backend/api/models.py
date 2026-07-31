"""
Kuduchee 2.0 — Data Models
Includes Auth (Profile, Address), Catalog (Category, Product, ProductVariant, ProductImage),
E-Commerce (Wishlist, Cart, PaymentSettings, Order, OrderItem, Review),
and Dynamic Site Content (HeroBanner, SiteSettings)
"""
from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.db.models.signals import post_save
from django.dispatch import receiver


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"


class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    full_name = models.CharField(max_length=255, blank=True, default='')
    phone = models.CharField(max_length=15, blank=True, default='')
    street_address = models.CharField(max_length=255)
    apartment = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=10)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Addresses'
        ordering = ['-is_default', '-id']

    def __str__(self):
        return f"{self.street_address}, {self.city} ({self.user.username})"

    def save(self, *args, **kwargs):
        if self.is_default:
            Address.objects.filter(
                user=self.user, is_default=True
            ).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)


# ─── Catalog Models ───────────────────────────────────────────────────────────

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True, default='')
    image_url = models.URLField(max_length=500, blank=True, default='')
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True, blank=True)
    description = models.TextField(blank=True, default='')
    mrp = models.DecimalField(max_digits=10, decimal_places=2)
    offer_price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    badge = models.CharField(max_length=50, blank=True, null=True)
    primary_image_url = models.URLField(max_length=500, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def is_in_stock(self):
        return self.stock_quantity > 0

    @property
    def is_low_stock(self):
        return 0 < self.stock_quantity <= 5

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)


class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    name = models.CharField(max_length=100)
    sku = models.CharField(max_length=50, blank=True, null=True, unique=True)
    mrp = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    offer_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stock_quantity = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.product.name} - {self.name}"


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image_url = models.URLField(max_length=500)
    alt_text = models.CharField(max_length=255, blank=True, default='')
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.product.name}"


# ─── E-Commerce Models ────────────────────────────────────────────────────────

class WishlistItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist_items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='in_wishlists')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} -> {self.product.name}"


class CartItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cart_items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product', 'variant')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} Cart: {self.product.name} ({self.quantity})"

    @property
    def unit_price(self):
        if self.variant and self.variant.offer_price:
            return self.variant.offer_price
        return self.product.offer_price

    @property
    def total_price(self):
        return self.unit_price * self.quantity


class PaymentSettings(models.Model):
    upi_id = models.CharField(max_length=100, default='kuduchee@upi')
    payee_name = models.CharField(max_length=150, default='Kaviz Creations Pvt Ltd')
    qr_code_url = models.URLField(max_length=500, blank=True, default='')
    is_qr_enabled = models.BooleanField(default=True)
    is_razorpay_enabled = models.BooleanField(default=False)
    razorpay_key_id = models.CharField(max_length=100, blank=True, default='')
    razorpay_key_secret = models.CharField(max_length=100, blank=True, default='')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Payment Settings'

    def __str__(self):
        return f"Payment Settings (QR: {self.is_qr_enabled}, Razorpay: {self.is_razorpay_enabled})"


class Order(models.Model):
    STATUS_CHOICES = [
        ('PENDING_VERIFICATION', 'Pending Verification'),
        ('APPROVED', 'Approved'),
        ('PROCESSING', 'Processing'),
        ('SHIPPED', 'Shipped'),
        ('OUT_FOR_DELIVERY', 'Out for Delivery'),
        ('DELIVERED', 'Delivered'),
        ('CANCEL_REQUESTED', 'Cancel Requested'),
        ('CANCELLED', 'Cancelled'),
        ('REFUND_PROCESSED', 'Refund Processed'),
        ('REJECTED', 'Rejected'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    order_number = models.CharField(max_length=50, unique=True, editable=False)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='PENDING_VERIFICATION')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_address_snapshot = models.JSONField(help_text="Snapshot of full delivery address")
    payment_method = models.CharField(max_length=50, default='UPI_QR')
    utr_number = models.CharField(max_length=100, blank=True, default='')
    payment_proof_url = models.URLField(max_length=500, blank=True, default='')
    rejection_reason = models.TextField(blank=True, default='')
    cancellation_reason = models.TextField(blank=True, default='')
    refund_bank_details = models.JSONField(blank=True, null=True, help_text="Bank details for refund")
    refund_transaction_ref = models.CharField(max_length=100, blank=True, default='')
    refund_notes = models.TextField(blank=True, default='')
    tracking_notes = models.TextField(blank=True, default='')
    tracking_number = models.CharField(max_length=100, blank=True, default='')
    courier_partner = models.CharField(max_length=100, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.order_number} ({self.status})"

    def save(self, *args, **kwargs):
        if not self.order_number:
            import uuid
            self.order_number = f"KDC-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=255)
    variant_name = models.CharField(max_length=100, blank=True, default='')
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.product_name} x {self.quantity} (Order #{self.order.order_number})"


class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.PositiveIntegerField(default=5)
    comment = models.TextField()
    is_verified_buyer = models.BooleanField(default=True)
    is_approved = models.BooleanField(default=False, help_text="Only approved reviews are shown publicly on the product page.")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Review ({self.rating}★) by {self.user.username} for {self.product.name}"


# ─── Dynamic Site Content Models (Home & Hero Page Manager) ───────────────────

class HeroBanner(models.Model):
    """Dynamic hero carousel slide managed by Admin."""
    tagline = models.CharField(max_length=255, default='AUTUMN / WINTER STUDIO COLLECTION')
    title = models.CharField(max_length=255, default='Opulence Fired in Stoneware.')
    quote = models.TextField(default='Elegance is when the inside is as beautiful as the outside.')
    cta_text = models.CharField(max_length=100, default='Discover Collection')
    cta_link = models.CharField(max_length=255, default='/shop')
    image_url = models.URLField(max_length=500, default='https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1600&q=85')
    accent_badge = models.CharField(max_length=100, default='Handcrafted Batch 06 · Limited Run')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"Hero Slide: {self.title}"


class SiteSettings(models.Model):
    """Global storefront text & contact info managed by Admin."""
    ticker_text = models.TextField(default="100% Damage Replacement Guarantee · Handcrafted in Small Batches · 1280°C High-Fired Stoneware · Lead-Free & Food Safe")
    brand_quote = models.TextField(default="Serve What You Deserve.")
    brand_author = models.CharField(max_length=100, default="Kuduchee")
    contact_email = models.CharField(max_length=100, default="anil.panda@kuduchee.com")
    contact_phone = models.CharField(max_length=50, default="9971118219")
    company_legal_name = models.CharField(max_length=150, default="Kaviz Creations Private Limited")
    company_location = models.CharField(max_length=255, default="510 A, Sun West Bank, Ashram Road, Ahmedabad, Gujarat 380009")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Site Settings'

    def __str__(self):
        return "Global Site Settings"


# ─── Signals ──────────────────────────────────────────────────────────────────

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()
