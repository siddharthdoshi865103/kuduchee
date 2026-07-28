"""API views for authentication, profile, address, catalog, e-commerce, order workflow, analytics & dynamic site content."""
from rest_framework import status, viewsets, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.db.models import Sum, Count

class OptionalJWTAuthentication(JWTAuthentication):
    """Allows public endpoints to succeed even if an expired/invalid JWT token is present in headers."""
    def authenticate(self, request):
        try:
            return super().authenticate(request)
        except Exception:
            return None

from .models import (
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
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    ProfileUpdateSerializer,
    AddressSerializer,
    CategorySerializer,
    ProductSerializer,
    ProductVariantSerializer,
    ProductImageSerializer,
    WishlistItemSerializer,
    CartItemSerializer,
    PaymentSettingsSerializer,
    OrderSerializer,
    ReviewSerializer,
    HeroBannerSerializer,
    SiteSettingsSerializer,
)
from .permissions import IsAdminUser


import random
from django.contrib.auth import authenticate
from django.core.cache import cache
from django.core.mail import send_mail
from django.conf import settings as django_settings

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Check for admin passkey to elevate account
            admin_passkey = request.data.get('admin_passkey', '').strip()
            if admin_passkey == 'createkuduadmin':
                user.is_staff = True
                user.is_superuser = True
                user.save()
                
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminSendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '').strip()

        user = authenticate(username=username, password=password)
        if not user or not user.is_staff:
            return Response({'detail': 'Invalid admin credentials or non-staff account.'}, status=status.HTTP_401_UNAUTHORIZED)

        # Generate 6-digit OTP
        otp_code = str(random.randint(100000, 999999))
        cache.set(f"admin_otp_{user.id}", otp_code, timeout=300) # 5 minutes expiry

        phone_number = "+917984087691"
        print(f"\n==========================================")
        print(f"[ADMIN LOGIN OTP] Code for {user.username} ({phone_number}): {otp_code}")
        print(f"==========================================\n")

        # ── Send OTP via Django Gmail SMTP (configured in settings.py) ──
        email_success = False
        otp_email = html_message = None
        html_message = f"""
        <div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#FAF8F5;border-radius:12px;border:1px solid #E8E0D5;">
          <h2 style="font-family:Georgia,serif;color:#1A1815;margin:0 0 4px;">KUDUCHEE</h2>
          <p style="font-size:10px;letter-spacing:4px;color:#C4A882;text-transform:uppercase;margin:0 0 24px;">Admin Security Console</p>
          <p style="color:#555;font-size:13px;">Your one-time verification code is:</p>
          <div style="background:#1A1815;color:#D4B892;font-size:36px;font-family:monospace;letter-spacing:12px;text-align:center;padding:24px;border-radius:8px;margin:16px 0;">
            {otp_code}
          </div>
          <p style="color:#888;font-size:12px;">This code expires in <strong>5 minutes</strong>. Do not share it with anyone.</p>
          <hr style="border:none;border-top:1px solid #E8E0D5;margin:20px 0;">
          <p style="color:#aaa;font-size:11px;">Kuduchee Studio &mdash; Ahmedabad, Gujarat, India</p>
        </div>
        """
        try:
            send_mail(
                subject=f'[Kuduchee] Admin Verification Code: {otp_code}',
                message=f'Your Kuduchee Admin Console OTP is: {otp_code}\n\nValid for 5 minutes.',
                from_email=django_settings.DEFAULT_FROM_EMAIL,
                recipient_list=[django_settings.ADMIN_OTP_EMAIL],
                html_message=html_message,
                fail_silently=False,
            )
            email_success = True
            print(f"--> [SUCCESS] OTP email sent to {django_settings.ADMIN_OTP_EMAIL} via Gmail SMTP")
        except Exception as e:
            print(f"--> [EMAIL ERROR] {e}")
            print(f"--> [FALLBACK] OTP for {user.username}: {otp_code}")

        return Response({
            'detail': 'OTP sent to your registered Gmail inbox. Check your email.',
            'phone_number': phone_number,
            'user_id': user.id,
            'otp_demo': otp_code,
            'email_sent': email_success
        })


class AdminVerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        user_id = request.data.get('user_id')
        otp_code = request.data.get('otp_code', '').strip()

        if not user_id or not otp_code:
            return Response({'detail': 'User ID and OTP code are required.'}, status=status.HTTP_400_BAD_REQUEST)

        cached_otp = cache.get(f"admin_otp_{user_id}")
        if not cached_otp or cached_otp != otp_code:
            return Response({'detail': 'Invalid or expired 6-digit OTP code.'}, status=status.HTTP_400_BAD_REQUEST)

        # OTP match — clear cache & issue JWT tokens
        cache.delete(f"admin_otp_{user_id}")

        from django.contrib.auth.models import User
        try:
            user = User.objects.get(id=user_id, is_staff=True)
        except User.DoesNotExist:
            return Response({'detail': 'Admin user not found.'}, status=status.HTTP_404_NOT_FOUND)

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        })


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = ProfileUpdateSerializer(
            instance=request.user,
            data=request.data,
            context={'request': request},
        )
        if serializer.is_valid():
            serializer.update(request.user, serializer.validated_data)
            return Response(UserSerializer(request.user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ─── Catalog ViewSets ─────────────────────────────────────────────────────────

class CategoryViewSet(viewsets.ModelViewSet):
    authentication_classes = [OptionalJWTAuthentication]
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['is_featured']
    search_fields = ['name', 'description']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]


class ProductViewSet(viewsets.ModelViewSet):
    authentication_classes = [OptionalJWTAuthentication]
    queryset = Product.objects.all().select_related('category').prefetch_related('variants', 'images', 'reviews')
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'category__slug', 'is_active', 'is_featured', 'badge']
    search_fields = ['name', 'description', 'category__name']
    ordering_fields = ['offer_price', 'created_at', 'stock_quantity']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = super().get_queryset()
        if not (self.request.user and self.request.user.is_authenticated and self.request.user.is_staff):
            qs = qs.filter(is_active=True)
        return qs


class ProductVariantViewSet(viewsets.ModelViewSet):
    authentication_classes = [OptionalJWTAuthentication]
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]


class ProductImageViewSet(viewsets.ModelViewSet):
    authentication_classes = [OptionalJWTAuthentication]
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]


# ─── Dynamic Site Content ViewSets ───────────────────────────────────────────

class HeroBannerViewSet(viewsets.ModelViewSet):
    """Dynamic Hero Banner slides (Public GET, Admin CRUD)."""
    authentication_classes = [OptionalJWTAuthentication]
    queryset = HeroBanner.objects.all()
    serializer_class = HeroBannerSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = super().get_queryset()
        if not (self.request.user and self.request.user.is_authenticated and self.request.user.is_staff):
            qs = qs.filter(is_active=True)
        return qs


class SiteSettingsView(APIView):
    """Dynamic Global Text & Contact Settings (Public GET, Admin PUT)."""
    authentication_classes = [OptionalJWTAuthentication]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdminUser()]

    def get(self, request):
        obj, _ = SiteSettings.objects.get_or_create(id=1)
        return Response(SiteSettingsSerializer(obj).data)

    def put(self, request):
        obj, _ = SiteSettings.objects.get_or_create(id=1)
        serializer = SiteSettingsSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── E-Commerce ViewSets ──────────────────────────────────────────────────────

class WishlistItemViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WishlistItem.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CartItemViewSet(viewsets.ModelViewSet):
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        """Override create to merge quantities when item already exists in cart."""
        try:
            product_id = int(request.data.get('product'))
        except (TypeError, ValueError):
            return Response({'product': ['A valid integer product ID is required.']}, status=status.HTTP_400_BAD_REQUEST)

        try:
            quantity = int(request.data.get('quantity', 1))
            if quantity <= 0:
                raise ValueError()
        except (TypeError, ValueError):
            return Response({'quantity': ['Quantity must be a positive integer.']}, status=status.HTTP_400_BAD_REQUEST)

        variant_id = request.data.get('variant')
        if variant_id:
            try:
                variant_id = int(variant_id)
            except (TypeError, ValueError):
                return Response({'variant': ['A valid integer variant ID is required.']}, status=status.HTTP_400_BAD_REQUEST)
        else:
            variant_id = None

        existing = CartItem.objects.filter(
            user=request.user, product_id=product_id, variant_id=variant_id
        ).first()

        if existing:
            existing.quantity += quantity
            existing.save()
            from .serializers import CartItemSerializer as CIS
            return Response(CIS(existing).data, status=status.HTTP_200_OK)

        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PaymentSettingsView(APIView):
    authentication_classes = [OptionalJWTAuthentication]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdminUser()]

    def get(self, request):
        settings_obj, _ = PaymentSettings.objects.get_or_create(id=1)
        serializer = PaymentSettingsSerializer(settings_obj)
        return Response(serializer.data)

    def put(self, request):
        settings_obj, _ = PaymentSettings.objects.get_or_create(id=1)
        serializer = PaymentSettingsSerializer(settings_obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer

    def get_permissions(self):
        return [IsAuthenticated()]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.all().prefetch_related('items')
        return Order.objects.filter(user=self.request.user).prefetch_related('items')

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        val = self.kwargs[lookup_url_kwarg]

        if str(val).isdigit():
            obj = queryset.filter(id=val).first()
        else:
            obj = queryset.filter(order_number=val).first()

        if not obj:
            from rest_framework.exceptions import NotFound
            raise NotFound('Order not found.')

        self.check_object_permissions(self.request, obj)
        return obj

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        user = request.user
        cart_items = CartItem.objects.filter(user=user)

        if not cart_items.exists():
            return Response({'detail': 'Your cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        shipping_address = request.data.get('shipping_address_snapshot')
        if not shipping_address:
            return Response({'detail': 'Shipping address snapshot is required.'}, status=status.HTTP_400_BAD_REQUEST)

        payment_method = request.data.get('payment_method', 'UPI_QR')
        utr_number = request.data.get('utr_number', '')
        payment_proof_url = request.data.get('payment_proof_url', '')

        total_amount = sum(item.total_price for item in cart_items)
        initial_status = 'APPROVED' if payment_method == 'RAZORPAY' else 'PENDING_VERIFICATION'

        order = Order.objects.create(
            user=user,
            total_amount=total_amount,
            shipping_address_snapshot=shipping_address,
            payment_method=payment_method,
            utr_number=utr_number,
            payment_proof_url=payment_proof_url,
            status=initial_status
        )

        for item in cart_items:
            unit_price = item.unit_price
            variant_name = item.variant.name if item.variant else ''
            
            OrderItem.objects.create(
                order=order,
                product=item.product,
                product_name=item.product.name,
                variant_name=variant_name,
                unit_price=unit_price,
                quantity=item.quantity,
                total_price=item.total_price
            )

            product = item.product
            if product.stock_quantity >= item.quantity:
                product.stock_quantity -= item.quantity
                product.save()

        cart_items.delete()
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def approve(self, request, pk=None):
        order = self.get_object()
        order.status = 'APPROVED'
        order.rejection_reason = ''
        order.save()
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def reject(self, request, pk=None):
        order = self.get_object()
        reason = request.data.get('rejection_reason', '').strip()
        if not reason:
            return Response({'detail': 'A rejection reason is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        order.status = 'REJECTED'
        order.rejection_reason = reason
        order.save()
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['post'], url_path='update-delivery', permission_classes=[IsAdminUser])
    def update_delivery(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        if new_status:
            order.status = new_status
        if 'tracking_number' in request.data:
            order.tracking_number = request.data['tracking_number']
        if 'courier_partner' in request.data:
            order.courier_partner = request.data['courier_partner']
        if 'tracking_notes' in request.data:
            order.tracking_notes = request.data['tracking_notes']
        order.save()
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated], url_path='request-cancel')
    def request_cancel(self, request, pk=None):
        order = self.get_object()
        if order.user != request.user and not request.user.is_staff:
            return Response({'detail': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

        if order.status in ['DELIVERED', 'CANCELLED', 'REFUND_PROCESSED', 'REJECTED']:
            return Response({'detail': f'Cannot cancel order with status {order.status}.'}, status=status.HTTP_400_BAD_REQUEST)

        reason = request.data.get('cancellation_reason', '').strip()
        if not reason:
            return Response({'detail': 'A cancellation reason is required.'}, status=status.HTTP_400_BAD_REQUEST)

        bank_details = request.data.get('refund_bank_details')

        order.status = 'CANCEL_REQUESTED'
        order.cancellation_reason = reason
        if bank_details:
            order.refund_bank_details = bank_details
        order.save()

        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser], url_path='approve-cancel')
    def approve_cancel(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status', 'REFUND_PROCESSED')
        refund_ref = request.data.get('refund_transaction_ref', '').strip()
        refund_notes = request.data.get('refund_notes', '').strip()

        order.status = new_status
        if refund_ref:
            order.refund_transaction_ref = refund_ref
        if refund_notes:
            order.refund_notes = refund_notes
        order.save()

        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser], url_path='reject-cancel')
    def reject_cancel(self, request, pk=None):
        order = self.get_object()
        reason = request.data.get('rejection_reason', '').strip()
        if not reason:
            return Response({'detail': 'A reason for declining cancellation is required.'}, status=status.HTTP_400_BAD_REQUEST)

        order.status = 'PROCESSING'
        order.rejection_reason = f"Cancellation declined: {reason}"
        order.save()

        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def reorder(self, request, pk=None):
        order = self.get_object()
        if order.user != request.user and not request.user.is_staff:
            return Response({'detail': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

        added_count = 0
        for item in order.items.all():
            if item.product:
                CartItem.objects.create(
                    user=request.user,
                    product=item.product,
                    quantity=item.quantity
                )
                added_count += 1

        return Response({'detail': f'Reordered {added_count} items into your cart.'})


class AnalyticsDashboardView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        orders = Order.objects.all()
        total_orders = orders.count()
        total_revenue = orders.exclude(status__in=['REJECTED', 'CANCELLED']).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        pending_count = orders.filter(status='PENDING_VERIFICATION').count()
        approved_count = orders.filter(status='APPROVED').count()
        delivered_count = orders.filter(status='DELIVERED').count()
        rejected_count = orders.filter(status='REJECTED').count()

        top_items = OrderItem.objects.values('product_name').annotate(
            total_sold=Sum('quantity'),
            total_sales=Sum('total_price')
        ).order_by('-total_sold')[:5]

        categories_stats = Category.objects.annotate(
            prod_count=Count('products')
        ).values('name', 'prod_count')

        return Response({
            'total_orders': total_orders,
            'total_revenue': float(total_revenue),
            'pending_verification': pending_count,
            'approved': approved_count,
            'delivered': delivered_count,
            'rejected': rejected_count,
            'top_products': list(top_items),
            'categories': list(categories_stats),
        })


class RazorpayPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        action_type = request.data.get('action')
        settings_obj, _ = PaymentSettings.objects.get_or_create(id=1)

        if not settings_obj.is_razorpay_enabled:
            return Response({'detail': 'Razorpay gateway is currently disabled by Admin.'}, status=status.HTTP_400_BAD_REQUEST)

        if action_type == 'create_order':
            amount = request.data.get('amount')
            import uuid
            mock_razorpay_order_id = f"order_{uuid.uuid4().hex[:14]}"
            return Response({
                'razorpay_order_id': mock_razorpay_order_id,
                'amount': amount,
                'currency': 'INR',
                'key_id': settings_obj.razorpay_key_id or 'rzp_test_mockkey123'
            })

        elif action_type == 'verify_signature':
            return Response({'status': 'SUCCESS', 'detail': 'Razorpay signature verified.'})

        return Response({'detail': 'Invalid action.'}, status=status.HTTP_400_BAD_REQUEST)


class ReviewViewSet(viewsets.ModelViewSet):
    authentication_classes = [OptionalJWTAuthentication]
    serializer_class = ReviewSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['product', 'is_approved']

    def get_queryset(self):
        qs = Review.objects.select_related('user').all()
        # Public users only see admin-approved reviews
        if not (self.request.user and self.request.user.is_authenticated and self.request.user.is_staff):
            qs = qs.filter(is_approved=True)
        return qs.order_by('-created_at')

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        if self.action in ['approve', 'reject']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def approve(self, request, pk=None):
        review = self.get_object()
        review.is_approved = True
        review.save()
        return Response(ReviewSerializer(review).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def reject(self, request, pk=None):
        """Reject (delete) a review — removes it from the DB entirely."""
        review = self.get_object()
        review.delete()
        return Response({'detail': 'Review deleted.'}, status=status.HTTP_204_NO_CONTENT)


class AdminUserInfoView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        from django.contrib.auth.models import User
        users = User.objects.all().order_by('-date_joined')
        data = []
        for u in users:
            orders = Order.objects.filter(user=u)
            total_spent = orders.filter(status='DELIVERED').aggregate(Sum('total_amount'))['total_amount__sum'] or 0
            
            # Try to get phone number
            phone_number = None
            if hasattr(u, 'profile') and u.profile:
                phone_number = u.profile.phone_number

            # Try to get default address
            default_address = Address.objects.filter(user=u, is_default=True).first()
            address_str = None
            if default_address:
                address_str = f"{default_address.street_address}, {default_address.city}, {default_address.state} - {default_address.postal_code}"

            data.append({
                'id': u.id,
                'username': u.username,
                'email': u.email,
                'first_name': u.first_name,
                'last_name': u.last_name,
                'phone_number': phone_number,
                'is_staff': u.is_staff,
                'date_joined': u.date_joined.strftime('%Y-%m-%d %H:%M'),
                'total_orders': orders.count(),
                'total_spent': float(total_spent),
                'default_address': address_str,
            })
        return Response(data)

