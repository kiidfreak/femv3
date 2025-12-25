from django.core.management.base import BaseCommand
from api.models import Business, Category, User, Product, Service

class Command(BaseCommand):
    help = 'Copy data from Railway (remote) database to local'

    def handle(self, *args, **kwargs):
        self.stdout.write('Connecting to remote database...')
        
        try:
            remote_count = Business.objects.using('remote').count()
            self.stdout.write(f'Found {remote_count} businesses in remote database.')
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Failed to connect to remote DB: {str(e)}'))
            return

        # 1. Sync Categories
        self.stdout.write('Syncing Categories...')
        for remote_cat in Category.objects.using('remote').all():
            Category.objects.get_or_create(
                slug=remote_cat.slug,
                defaults={
                    'name': remote_cat.name,
                    'description': remote_cat.description
                }
            )

        # 2. Sync Businesses
        self.stdout.write('Syncing Businesses...')
        for remote_biz in Business.objects.using('remote').all():
            # Get or create owner
            try:
                remote_user = remote_biz.user
                local_user, created = User.objects.get_or_create(
                    email=remote_user.email,
                    defaults={
                        'phone': remote_user.phone,
                        'first_name': remote_user.first_name,
                        'last_name': remote_user.last_name,
                        'user_type': remote_user.user_type,
                        'is_active': True # Ensure active
                    }
                )
                if created:
                    local_user.set_password('password123') # Default password for migrated users
                    local_user.save()
            except User.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'Skipping business {remote_biz.business_name}: Owner not found'))
                continue

            # Get local category
            try:
                local_category = Category.objects.get(slug=remote_biz.category.slug)
            except Category.DoesNotExist:
                 self.stdout.write(self.style.WARNING(f'Skipping business {remote_biz.business_name}: Category {remote_biz.category.slug} not found'))
                 continue

            # Create/Update Business
            local_biz, created = Business.objects.update_or_create(
                business_name=remote_biz.business_name,
                user=local_user,
                defaults={
                    'description': remote_biz.description,
                    'category': local_category,
                    'address': remote_biz.address,
                    'city': remote_biz.city,
                    'county': remote_biz.county,
                    'phone': remote_biz.phone,
                    'email': remote_biz.email,
                    'website': remote_biz.website,
                    'is_verified': remote_biz.is_verified,
                    'rating': remote_biz.rating,
                    'review_count': remote_biz.review_count,
                    'view_count': remote_biz.view_count,
                    # Handle other fields if necessary
                }
            )
            
            verb = "Created" if created else "Updated"
            self.stdout.write(f'{verb} business: {local_biz.business_name}')

            # 3. Sync Products
            for remote_prod in Product.objects.using('remote').filter(business=remote_biz):
                Product.objects.update_or_create(
                    business=local_biz,
                    name=remote_prod.name,
                    defaults={
                        'description': remote_prod.description,
                        'price': remote_prod.price,
                        'image': remote_prod.image,
                        'in_stock': remote_prod.in_stock,
                        'is_active': remote_prod.is_active
                    }
                )

            # 4. Sync Services
            for remote_svc in Service.objects.using('remote').filter(business=remote_biz):
                Service.objects.update_or_create(
                    business=local_biz,
                    name=remote_svc.name,
                    defaults={
                        'description': remote_svc.description,
                        'price_range': remote_svc.price_range,
                        'duration': remote_svc.duration,
                        'is_active': remote_svc.is_active
                    }
                )

        self.stdout.write(self.style.SUCCESS('Data sync completed!'))
