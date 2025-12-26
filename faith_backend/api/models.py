from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
import uuid

class CustomUserManager(BaseUserManager):
    def create_user(self, phone, password=None, **extra_fields):
        if not phone:
            raise ValueError('The Phone field must be set')
        user = self.model(phone=phone, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(phone, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    USER_TYPES = (
        ('member', 'Member'),
        ('business_owner', 'Business Owner'),
        ('church_admin', 'Church Admin'),
        ('system_admin', 'System Admin'),
    )

    phone = models.CharField(max_length=20, unique=True)
    email = models.EmailField(blank=True, null=True)
    first_name = models.CharField(max_length=150, blank=True, null=True)
    last_name = models.CharField(max_length=150, blank=True, null=True)
    partnership_number = models.CharField(max_length=50, blank=True, null=True)
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='member')
    otp = models.CharField(max_length=10, blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)  # Email verification status
    phone_verified = models.BooleanField(default=False)  # Phone verification status
    profile_image = models.ImageField(upload_to='profiles/', blank=True, null=True, db_column='profile_image_url')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = []

    @property
    def has_business_profile(self):
        return self.businesses.exists()

    class Meta:
        db_table = 'user_auth_user'

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'business_category'

class Business(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='businesses')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='businesses')
    business_name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    zip_code = models.CharField(max_length=20, blank=True, null=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, blank=True, null=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=8, blank=True, null=True)
    twitter_url = models.CharField(max_length=500, blank=True, null=True)
    linkedin_url = models.CharField(max_length=500, blank=True, null=True)
    youtube_url = models.CharField(max_length=500, blank=True, null=True)
    business_type = models.CharField(max_length=100, blank=True, null=True)
    subcategory = models.CharField(max_length=100, blank=True, null=True)
    
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    website = models.URLField(max_length=500, blank=True, null=True)
    address = models.TextField()
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    review_count = models.IntegerField(default=0)
    view_count = models.IntegerField(default=0)
    
    # Changed to ImageField to match Product/Service patterns and support multipart uploads
    business_image = models.ImageField(
        upload_to='businesses/', 
        blank=True, 
        null=True, 
        db_column='business_image_url'
    )
    business_logo = models.ImageField(
        upload_to='businesses/logos/', 
        blank=True, 
        null=True, 
        db_column='business_logo_url'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'business_business'

class Service(models.Model):
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='services')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    price_range = models.CharField(max_length=100, blank=True, null=True)
    duration = models.CharField(max_length=100, blank=True, null=True)
    service_image = models.ImageField(upload_to='services/', blank=True, null=True, db_column='service_image_url')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'business_service'

class Product(models.Model):
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    price_currency = models.CharField(max_length=10, default='KES')
    product_image = models.ImageField(upload_to='products/', blank=True, null=True, db_column='product_image_url')
    is_active = models.BooleanField(default=True)
    in_stock = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'business_product'

class Review(models.Model):
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    # product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews', blank=True, null=True)
    # service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='reviews', blank=True, null=True)
    rating = models.IntegerField()
    review_text = models.TextField(blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'business_review'


class PendingUser(models.Model):
    phone = models.CharField(max_length=20, unique=True)
    email = models.EmailField()
    first_name = models.CharField(max_length=150, blank=True, null=True)
    partnership_number = models.CharField(max_length=50, blank=True, null=True)
    otp = models.CharField(max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_pending_user'

class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='favorited_by', null=True, blank=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='favorited_by', null=True, blank=True)
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='favorited_by', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'business_favorite'

# Import Role and UserRole models for Django to discover them
from .roles import Role, UserRole
from .notification_models import Notification, NotificationPreference
from .analytics_models import PageView
