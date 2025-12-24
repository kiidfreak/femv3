from django.db import models
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType


class Role(models.Model):
    """
    Role model for role-based access control
    Similar to Filament Shield's roles
    """
    name = models.CharField(max_length=100, unique=True)
    display_name = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    is_super_admin = models.BooleanField(default=False)
    permissions = models.ManyToManyField(
        Permission,
        related_name='roles',
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'roles'
        verbose_name = 'Role'
        verbose_name_plural = 'Roles'
        ordering = ['name']

    def __str__(self):
        return self.display_name or self.name

    def has_permission(self, permission_codename):
        """Check if role has a specific permission"""
        if self.is_super_admin:
            return True
        return self.permissions.filter(codename=permission_codename).exists()


class UserRole(models.Model):
    """
    Junction table for users and roles
    """
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='user_roles')
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='user_roles')
    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_roles')

    class Meta:
        db_table = 'user_roles'
        unique_together = ('user', 'role')
        verbose_name = 'User Role'
        verbose_name_plural = 'User Roles'

    def __str__(self):
        return f"{self.user} - {self.role}"


# Default permissions structure (similar to Filament Shield)
DEFAULT_PERMISSIONS = {
    'Business': ['view_any', 'view', 'create', 'update', 'delete', 'restore', 'force_delete'],
    'Service': ['view_any', 'view', 'create', 'update', 'delete'],
    'Product': ['view_any', 'view', 'create', 'update', 'delete'],
    'Review': ['view_any', 'view', 'create', 'update', 'delete', 'moderate'],
    'Category': ['view_any', 'view', 'create', 'update', 'delete'],
    'User': ['view_any', 'view', 'create', 'update', 'delete', 'manage_roles'],
}

# Custom permissions
CUSTOM_PERMISSIONS = [
    ('verify_business', 'Can verify businesses'),
    ('manage_verifications', 'Can manage verification requests'),
    ('view_analytics', 'Can view analytics dashboard'),
    ('export_data', 'Can export data'),
    ('impersonate_user', 'Can impersonate users'),
]


def create_default_roles():
    """
    Create default roles with permissions
    """
    from django.contrib.contenttypes.models import ContentType
    from django.contrib.auth.models import Permission
    
    # Super Admin - all permissions
    super_admin, _ = Role.objects.get_or_create(
        name='super_admin',
        defaults={
            'display_name': 'Super Administrator',
            'description': 'Full access to all features and settings',
            'is_super_admin': True
        }
    )
    
    # Business Owner - manage their own business
    business_owner, _ = Role.objects.get_or_create(
        name='business_owner',
        defaults={
            'display_name': 'Business Owner',
            'description': 'Can manage their own business, products, and services'
        }
    )
    business_perms = Permission.objects.filter(
        codename__in=['view_business', 'update_business', 'create_product', 
                     'update_product', 'delete_product', 'create_service',
                     'update_service', 'delete_service', 'view_review']
    )
    business_owner.permissions.set(business_perms)
    
    # Community Member - basic access
    member, _ = Role.objects.get_or_create(
        name='member',
        defaults={
            'display_name': 'Community Member',
            'description': 'Can browse and review businesses'
        }
    )
    member_perms = Permission.objects.filter(
        codename__in=['view_business', 'view_product', 'view_service', 
                     'create_review', 'update_review', 'delete_review']
    )
    member.permissions.set(member_perms)
    
    # Moderator - can verify and moderate
    moderator, _ = Role.objects.get_or_create(
        name='moderator',
        defaults={
            'display_name': 'Moderator',
            'description': 'Can verify businesses and moderate content'
        }
    )
    moderator_perms = Permission.objects.filter(
        codename__in=['view_business', 'update_business', 'verify_business',
                     'moderate_review', 'manage_verifications']
    )
    moderator.permissions.set(moderator_perms)
    
    print("✅ Default roles created successfully!")
    return {
        'super_admin': super_admin,
        'business_owner': business_owner,
        'member': member,
        'moderator': moderator,
    }
