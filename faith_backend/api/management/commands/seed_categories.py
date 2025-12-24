from django.core.management.base import BaseCommand
from django.utils.text import slugify
from api.models import Category

CATEGORIES = [
    {
        'name': 'Food & Hospitality',
        'description': 'Restaurants, catering, cafes, and event hosting services.',
        'icon': 'Utensils'
    },
    {
        'name': 'Construction & Hardware',
        'description': 'Contractors, building materials, hardware stores, and architects.',
        'icon': 'Hammer'
    },
    {
        'name': 'Education',
        'description': 'Schools, tutoring services, music lessons, and vocational training.',
        'icon': 'GraduationCap'
    },
    {
        'name': 'Health & Wellness',
        'description': 'Medical clinics, pharmacies, counseling, and fitness centers.',
        'icon': 'HeartPulse'
    },
    {
        'name': 'Professional Services',
        'description': 'Legal advice, accounting, consulting, and marketing services.',
        'icon': 'Briefcase'
    },
    {
        'name': 'Retail & Shopping',
        'description': 'Clothing stores, bookshops, gift shops, and general merchandise.',
        'icon': 'ShoppingBag'
    },
    {
        'name': 'Auto & Transport',
        'description': 'Mechanics, taxi services, car hire, and logistics.',
        'icon': 'Car'
    },
    {
        'name': 'Home Services',
        'description': 'Cleaning, plumbing, electrical repairs, and gardening.',
        'icon': 'Home'
    }
]

class Command(BaseCommand):
    help = 'Seed initial business categories'

    def handle(self, *args, **options):
        self.stdout.write('🌱 Seeding business categories...')
        
        created_count = 0
        existing_count = 0
        
        for cat_data in CATEGORIES:
            slug = slugify(cat_data['name'])
            category, created = Category.objects.get_or_create(
                slug=slug,
                defaults={
                    'name': cat_data['name'],
                    'description': cat_data['description']
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'  ✓ Created: {cat_data["name"]}'))
            else:
                existing_count += 1
                self.stdout.write(f'  - Skipped: {cat_data["name"]} (already exists)')
                
        self.stdout.write(
            self.style.SUCCESS(
                f'\n✅ Seeding complete! Created {created_count}, Skipped {existing_count}'
            )
        )
