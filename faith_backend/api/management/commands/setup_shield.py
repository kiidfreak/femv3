from django.core.management.base import BaseCommand
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from api.roles import Role, create_default_roles, CUSTOM_PERMISSIONS
from api.models import User, Business, Service, Product, Review, Category


class Command(BaseCommand):
    help = 'Setup Shield-like role-based access control'

    def add_arguments(self, parser):
        parser.add_argument(
            '--create-super-admin',
            action='store_true',
            help='Create a super admin user',
        )
        parser.add_argument(
            '--email',
            type=str,
            help='Email for super admin',
        )
        parser.add_argument(
            '--phone',
            type=str,
            help='Phone for super admin',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🛡️  Setting up Shield-like RBAC System...'))
        
        # Step 1: Create custom permissions
        self.stdout.write('\n📝 Creating custom permissions...')
        self.create_custom_permissions()
        
        # Step 2: Create default roles
        self.stdout.write('\n👑 Creating default roles...')
        roles = create_default_roles()
        
        for role_name, role in roles.items():
            perm_count = role.permissions.count()
            self.stdout.write(
                f'  ✓ {role.display_name} ({perm_count} permissions)'
            )
        
        # Step 3: Create super admin user if requested
        if options['create_super_admin']:
            self.stdout.write('\n👤 Creating super admin user...')
            self.create_super_admin(
                email=options.get('email'),
                phone=options.get('phone'),
                roles=roles
            )
        
        self.stdout.write(self.style.SUCCESS('\n✅ Setup complete!'))
        self.stdout.write('\nNext steps:')
        self.stdout.write('  1. Run migrations: python manage.py migrate')
        self.stdout.write('  2. Assign roles to users via API or admin panel')
        self.stdout.write('  3. Use HasRolePermission in your views for authorization')

    def create_custom_permissions(self):
        """Create custom permissions that don't fit standard CRUD"""
        content_type = ContentType.objects.get_for_model(User)
        
        for codename, name in CUSTOM_PERMISSIONS:
            permission, created = Permission.objects.get_or_create(
                codename=codename,
                content_type=content_type,
                defaults={'name': name}
            )
            if created:
                self.stdout.write(f'  ✓ Created: {name}')

    def create_super_admin(self, email, phone, roles):
        """Create a super admin user with all permissions"""
        if not phone:
            phone = input('Enter phone number for super admin: ')
        if not email:
            email = input('Enter email for super admin: ')
        
        first_name = input('Enter first name (default: Super): ') or 'Super'
        last_name = input('Enter last name (default: Admin): ') or 'Admin'
        
        try:
            user = User.objects.create(
                phone=phone,
                email=email,
                first_name=first_name,
                last_name=last_name,
                user_type='admin',
                is_verified=True,
                is_active=True
            )
            
            # Assign super admin role
            from api.roles import UserRole
            UserRole.objects.create(
                user=user,
                role=roles['super_admin']
            )
            
            self.stdout.write(
                self.style.SUCCESS(f'  ✓ Super admin created: {first_name} {last_name} ({phone})')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'  ✗ Error creating super admin: {str(e)}')
            )
