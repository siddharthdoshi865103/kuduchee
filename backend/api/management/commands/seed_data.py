from django.core.management.base import BaseCommand
from api.models import Category, Product, SiteSettings, HeroBanner

class Command(BaseCommand):
    help = 'Seeds initial categories, products, and site settings for Kuduchee Studio.'

    def handle(self, *args, **options):
        self.stdout.write('Seeding Kuduchee Studio data...')

        # Categories
        cat_dinner, _ = Category.objects.get_or_create(
            name='Dinner Sets',
            defaults={
                'description': 'Handcrafted 1280°C High-Fired Stoneware Dinnerware',
                'is_featured': True
            }
        )
        cat_bowls, _ = Category.objects.get_or_create(
            name='Serveware & Bowls',
            defaults={
                'description': 'Elegant artisan serving bowls & platters',
                'is_featured': True
            }
        )
        cat_mugs, _ = Category.objects.get_or_create(
            name='Mugs & Drinkware',
            defaults={
                'description': 'Ergonomic matte & glazed stoneware mugs',
                'is_featured': True
            }
        )

        # Products
        products_data = [
            {
                'category': cat_dinner,
                'name': 'Artisan Earth Stoneware Dinner Set (16 Piece)',
                'description': 'Complete 16-piece high-fired stoneware dinnerware set featuring rustic reactive glazes, scratch-resistant surface, and food-safe finish.',
                'mrp': 8999.00,
                'offer_price': 6499.00,
                'stock_quantity': 25,
                'is_featured': True,
                'badge': 'Best Seller',
                'primary_image_url': 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop'
            },
            {
                'category': cat_dinner,
                'name': 'Nordic Matte Charcoal Quarter Plates (Set of 4)',
                'description': 'Minimalist quarter plates with tactile matte charcoal texture, high-fired at 1280°C for exceptional durability.',
                'mrp': 2499.00,
                'offer_price': 1899.00,
                'stock_quantity': 40,
                'is_featured': True,
                'badge': 'New Arrival',
                'primary_image_url': 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=800&auto=format&fit=crop'
            },
            {
                'category': cat_bowls,
                'name': 'Terracotta Speckled Serving Bowl',
                'description': 'Deep artisan serving bowl with subtle speckles and warm terracotta undertones. Microwave & dishwasher safe.',
                'mrp': 1999.00,
                'offer_price': 1399.00,
                'stock_quantity': 30,
                'is_featured': True,
                'badge': 'Exclusive',
                'primary_image_url': 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?q=80&w=800&auto=format&fit=crop'
            },
            {
                'category': cat_mugs,
                'name': 'Studio Brass Glaze Coffee Mugs (Set of 2)',
                'description': 'Handcrafted ceramic mugs featuring signature brass rim detail and comfort grip handles.',
                'mrp': 1499.00,
                'offer_price': 999.00,
                'stock_quantity': 50,
                'is_featured': True,
                'badge': 'Best Seller',
                'primary_image_url': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop'
            },
            # Exclusive Collection
            {
                'category': cat_dinner,
                'name': 'Midnight Gold Signature Dinner Set (12 Piece)',
                'description': 'Limited-edition 12-piece obsidian black dinner set with hand-painted 24K gold rim accents. Certificate of authenticity included. Collector\'s batch #06.',
                'mrp': 14999.00,
                'offer_price': 11999.00,
                'stock_quantity': 8,
                'is_featured': True,
                'badge': 'Exclusive',
                'primary_image_url': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=800&auto=format&fit=crop'
            },
            {
                'category': cat_bowls,
                'name': 'Wabi-Sabi Heritage Serving Platter',
                'description': 'One-of-a-kind irregular-edge stoneware platter with natural ash glaze from wood-fired kiln. Each piece is uniquely shaped by nature.',
                'mrp': 5999.00,
                'offer_price': 4499.00,
                'stock_quantity': 12,
                'is_featured': True,
                'badge': 'Exclusive',
                'primary_image_url': 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=800&auto=format&fit=crop'
            },
            {
                'category': cat_mugs,
                'name': 'Artisan Celadon Tea Cup & Saucer Set',
                'description': 'Studio-exclusive celadon jade green tea cups with matching saucers. Inspired by ancient Chinese Song dynasty pottery. Limited batch of 50.',
                'mrp': 3499.00,
                'offer_price': 2799.00,
                'stock_quantity': 15,
                'is_featured': True,
                'badge': 'Exclusive',
                'primary_image_url': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=800&auto=format&fit=crop'
            },
            # New Arrivals
            {
                'category': cat_bowls,
                'name': 'Sakura Petal Ramen Bowl Set (Set of 2)',
                'description': 'Deep-walled ramen bowls with delicate cherry blossom relief pattern. Perfect for noodles, pho, and udon. 1280°C fired stoneware.',
                'mrp': 2999.00,
                'offer_price': 2299.00,
                'stock_quantity': 35,
                'is_featured': True,
                'badge': 'New Arrival',
                'primary_image_url': 'https://images.unsplash.com/photo-1590794056226-79ef1f5044d6?q=80&w=800&auto=format&fit=crop'
            },
        ]

        for p_data in products_data:
            Product.objects.get_or_create(
                name=p_data['name'],
                defaults=p_data
            )

        # Site Settings
        SiteSettings.objects.get_or_create(
            id=1,
            defaults={
                'ticker_text': '100% Damage Replacement Guarantee · Handcrafted in Small Batches · 1280°C High-Fired Stoneware · Lead-Free & Food Safe',
                'support_phone': '+91 9971118219',
                'support_email': 'anil.panda@kuduchee.com'
            }
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded Kuduchee Studio database!'))
