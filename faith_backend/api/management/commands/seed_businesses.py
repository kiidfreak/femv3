from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import Business, Category, Product, Service
from decimal import Decimal
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed database with sample businesses, products, and services'

    def handle(self, *args, **kwargs):
        self.stdout.write('Starting database seeding...')

        # Sample business data with owners
        businesses_data = [
            {
                'owner': {'first_name': 'James Kiti', 'phone': '+254712345001', 'email': 'james@kitisons.co.ke'},
                'business': {
                    'business_name': 'Kitisons Auto Spares',
                    'description': 'Quality auto parts and accessories for all vehicle types. Trusted by mechanics and car owners across Nairobi.',
                    'address': 'Wangige, Nairobi',
                    'category_slug': 'auto-transport',
                    'is_verified': True,
                    'rating': Decimal('4.8'),
                    'review_count': 124
                },
                'products': [
                    {'name': 'Brake Pads Set', 'description': 'High-quality brake pads for sedan cars', 'price': Decimal('3500'), 'in_stock': True},
                    {'name': 'Engine Oil 5W-30', 'description': 'Premium synthetic engine oil 4L', 'price': Decimal('2800'), 'in_stock': True},
                    {'name': 'Car Battery 12V', 'description': 'Maintenance-free car battery 70Ah', 'price': Decimal('8500'), 'in_stock': True},
                ],
                'services': [
                    {'name': 'Oil Change Service', 'description': 'Complete oil change with filter replacement', 'price_range': 'KES 1,500 - 3,000', 'duration': '30 minutes'},
                    {'name': 'Brake System Check', 'description': 'Comprehensive brake inspection and repair', 'price_range': 'KES 2,000 - 5,000', 'duration': '1 hour'},
                ]
            },
            {
                'owner': {'first_name': 'Neema Wanjiru', 'phone': '+254712345002', 'email': 'neema@catering.co.ke'},
                'business': {
                    'business_name': 'Neema Catering Services',
                    'description': 'Professional catering for weddings, corporate events, and church functions. Delicious food, impeccable service.',
                    'address': 'Kileleshwa, Nairobi',
                    'category_slug': 'food-hospitality',
                    'is_verified': True,
                    'rating': Decimal('4.5'),
                    'review_count': 56
                },
                'products': [
                    {'name': 'Wedding Cake (3-Tier)', 'description': 'Elegant 3-tier wedding cake, serves 100 people', 'price': Decimal('15000'), 'in_stock': True},
                    {'name': 'Pastry Assortment Box', 'description': 'Mixed pastries for events (30 pieces)', 'price': Decimal('2500'), 'in_stock': True},
                ],
                'services': [
                    {'name': 'Wedding Catering Package', 'description': 'Full catering for 200+ guests', 'price_range': 'KES 150,000 - 300,000', 'duration': '1 day'},
                    {'name': 'Corporate Event Catering', 'description': 'Breakfast, lunch, or dinner for corporate events', 'price_range': 'KES 1,000 per person', 'duration': 'Variable'},
                    {'name': 'Church Function Catering', 'description': 'Affordable catering for church events', 'price_range': 'KES 500 per person', 'duration': 'Variable'},
                ]
            },
            {
                'owner': {'first_name': 'David Omondi', 'phone': '+254712345003', 'email': 'david@faithfulgraphics.co.ke'},
                'business': {
                    'business_name': 'Faithful Graphics',
                    'description': 'Creative graphic design, branding, and printing services. Bringing your vision to life with faith and excellence.',
                    'address': 'Thika',
                    'category_slug': 'professional-services',
                    'is_verified': False,
                    'rating': Decimal('4.2'),
                    'review_count': 32
                },
                'products': [
                    {'name': 'Business Card Printing (500pcs)', 'description': 'Premium business cards with UV finish', 'price': Decimal('3000'), 'in_stock': True},
                    {'name': 'Church Banner Design', 'description': 'Custom church event banner design and printing', 'price': Decimal('5000'), 'in_stock': True},
                ],
                'services': [
                    {'name': 'Logo Design', 'description': 'Professional logo design with 3 revisions', 'price_range': 'KES 10,000 - 25,000', 'duration': '3-5 days'},
                    {'name': 'Social Media Graphics', 'description': 'Monthly social media content design', 'price_range': 'KES 15,000 per month', 'duration': 'Ongoing'},
                ]
            },
            {
                'owner': {'first_name': 'Grace Mwangi', 'phone': '+254712345004', 'email': 'grace@gracebakery.co.ke'},
                'business': {
                    'business_name': 'Grace Bakery',
                    'description': 'Fresh bread, cakes, and pastries baked daily with love. Serving the community since 2015.',
                    'address': 'Ngong Road, Nairobi',
                    'category_slug': 'food-hospitality',
                    'is_verified': True,
                    'rating': Decimal('4.7'),
                    'review_count': 89
                },
                'products': [
                    {'name': 'Fresh White Bread', 'description': 'Freshly baked white bread daily', 'price': Decimal('60'), 'in_stock': True},
                    {'name': 'Chocolate Cake', 'description': 'Rich chocolate cake (1kg)', 'price': Decimal('1200'), 'in_stock': True},
                    {'name': 'Mandazi (6pcs)', 'description': 'Traditional Kenyan mandazi', 'price': Decimal('50'), 'in_stock': True},
                ],
                'services': [
                    {'name': 'Custom Birthday Cakes', 'description': 'Personalized birthday cakes for all ages', 'price_range': 'KES 1,500 - 5,000', 'duration': '2-3 days notice'},
                ]
            },
            {
                'owner': {'first_name': 'Peter Kamau', 'phone': '+254712345005', 'email': 'peter@hopeconstruction.co.ke'},
                'business': {
                    'business_name': 'Hope Construction',
                    'description': 'Reliable construction and renovation services. Building homes and dreams with integrity.',
                    'address': 'Ruiru, Nairobi',
                    'category_slug': 'construction-hardware',
                    'is_verified': True,
                    'rating': Decimal('4.6'),
                    'review_count': 45
                },
                'products': [
                    {'name': 'Cement (50kg bag)', 'description': 'High-grade cement for construction', 'price': Decimal('700'), 'in_stock': True},
                ],
                'services': [
                    {'name': 'House Construction', 'description': 'Complete house construction services', 'price_range': 'KES 30,000 per sqm', 'duration': '3-6 months'},
                    {'name': 'Renovation Services', 'description': 'Home and office renovation', 'price_range': 'Quotation based', 'duration': 'Variable'},
                ]
            },
        ]

        # Create categories if they don't exist (these should already exist from seed_categories)
        categories_map = {}
        category_data = [
            ('auto-transport', 'Auto & Transport'),
            ('food-hospitality', 'Food & Hospitality'),
            ('professional-services', 'Professional Services'),
            ('retail-shopping', 'Retail & Shopping'),
            ('construction-hardware', 'Construction & Hardware'),
        ]

        for slug, name in category_data:
            category, created = Category.objects.get_or_create(
                slug=slug,
                defaults={'name': name}
            )
            categories_map[slug] = category
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created category: {name}'))

        # Seed businesses with owners
        for data in businesses_data:
            # Create or get user (owner)
            owner_data = data['owner']
            user, user_created = User.objects.get_or_create(
                phone=owner_data['phone'],
                defaults={
                    'first_name': owner_data['first_name'],
                    'email': owner_data['email'],
                    'user_type': 'business_owner',
                    'phone_verified': True,
                    'is_active': True
                }
            )
            if user_created:
                self.stdout.write(self.style.SUCCESS(f'Created user: {owner_data["first_name"]}'))

            # Create business
            business_data = data['business']
            category = categories_map[business_data['category_slug']]
            
            business, biz_created = Business.objects.get_or_create(
                business_name=business_data['business_name'],
                user=user,
                defaults={
                    'description': business_data['description'],
                    'address': business_data['address'],
                    'category': category,
                    'is_verified': business_data['is_verified'],
                    'rating': business_data['rating'],
                    'review_count': business_data['review_count']
                }
            )
            
            if biz_created:
                self.stdout.write(self.style.SUCCESS(f'Created business: {business.business_name}'))

                # Create products
                for product_data in data['products']:
                    Product.objects.create(
                        business=business,
                        name=product_data['name'],
                        description=product_data['description'],
                        price=product_data['price'],
                        in_stock=product_data['in_stock'],
                        is_active=True
                    )
                self.stdout.write(f'  Added {len(data["products"])} products')

                # Create services
                for service_data in data['services']:
                    Service.objects.create(
                        business=business,
                        name=service_data['name'],
                        description=service_data['description'],
                        price_range=service_data['price_range'],
                        duration=service_data.get('duration', ''),
                        is_active=True
                    )
                self.stdout.write(f'  Added {len(data["services"])} services')

        self.stdout.write(self.style.SUCCESS('\n✅ Database seeding completed successfully!'))
        self.stdout.write(f'Total businesses: {Business.objects.count()}')
        self.stdout.write(f'Total products: {Product.objects.count()}')
        self.stdout.write(f'Total services: {Service.objects.count()}')
