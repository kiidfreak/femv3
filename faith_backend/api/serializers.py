from rest_framework import serializers
from .models import User, Business, Category, Service, Product, Review, Favorite
from django.contrib.auth.models import Permission
from .roles import Role, UserRole

class UserSerializer(serializers.ModelSerializer):
    has_business_profile = serializers.SerializerMethodField()
    profile_image = serializers.ImageField(required=False)
    profile_image_url = serializers.ImageField(source='profile_image', read_only=True)

    def get_has_business_profile(self, obj):
        return obj.businesses.exists()

    class Meta:
        model = User
        fields = ['id', 'phone', 'first_name', 'last_name', 'partnership_number', 'user_type', 'is_verified', 'has_business_profile', 'profile_image', 'profile_image_url']

class CategorySerializer(serializers.ModelSerializer):
    business_count = serializers.IntegerField(read_only=True)
    offering_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'business_count', 'offering_count']

class ServiceSerializer(serializers.ModelSerializer):
    business_name = serializers.CharField(source='business.business_name', read_only=True)
    
    service_image = serializers.ImageField(required=False)
    service_image_url = serializers.ImageField(source='service_image', read_only=True)

    class Meta:
        model = Service
        fields = ['id', 'business', 'business_name', 'name', 'description', 'price_range', 'duration', 'service_image', 'service_image_url', 'is_active', 'is_favorite']
        read_only_fields = ['business']

    is_favorite = serializers.SerializerMethodField()
    def get_is_favorite(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorited_by.filter(user=request.user).exists()
        return False

class ProductSerializer(serializers.ModelSerializer):
    business_name = serializers.CharField(source='business.business_name', read_only=True)
    
    product_image = serializers.ImageField(required=False)
    product_image_url = serializers.ImageField(source='product_image', read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'business', 'business_name', 'name', 'description', 'price', 'price_currency', 'product_image', 'product_image_url', 'is_active', 'in_stock', 'is_favorite']
        read_only_fields = ['business']

    is_favorite = serializers.SerializerMethodField()
    def get_is_favorite(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorited_by.filter(user=request.user).exists()
        return False

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.first_name', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'business', 'user_name', 'rating', 'review_text', 'is_verified', 'created_at']

class BusinessListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    owner_name = serializers.CharField(source='user.first_name', read_only=True)
    product_count = serializers.IntegerField(source='products_count_annotated', read_only=True)
    service_count = serializers.IntegerField(source='services_count_annotated', read_only=True)
    
    # Map model ImageFields to legacy URL fields
    business_image_url = serializers.ImageField(source='business_image', read_only=True)
    business_logo_url = serializers.ImageField(source='business_logo', read_only=True)
    
    class Meta:
        model = Business
        fields = [
            'id', 'business_name', 'description', 'address', 
            'category', 'category_name', 'owner_name', 'rating', 'review_count',
            'is_verified', 'product_count', 'service_count', 'business_image_url', 'business_logo_url',
            'is_favorite'
        ]

    is_favorite = serializers.SerializerMethodField()
    def get_is_favorite(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorited_by.filter(user=request.user).exists()
        return False

class BusinessSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    owner_name = serializers.CharField(source='user.first_name', read_only=True)
    services = ServiceSerializer(many=True, read_only=True)
    products = ProductSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    view_count = serializers.SerializerMethodField()

    def get_view_count(self, obj):
        return getattr(obj, 'view_count', 0)

    # Writable fields for file uploads
    business_image = serializers.ImageField(required=False)
    business_logo = serializers.ImageField(required=False)
    
    # Read-only compatibility fields
    business_image_url = serializers.ImageField(source='business_image', read_only=True)
    business_logo_url = serializers.ImageField(source='business_logo', read_only=True)

    class Meta:
        model = Business
        fields = [
            'id', 'business_name', 'description', 'address', 
            'phone', 'email', 'website',
            'category', 'category_name', 'owner_name', 'rating', 'review_count', 'view_count',
            'is_verified', 'is_featured', 'services', 'products', 'reviews', 
            'business_image', 'business_logo', 'business_image_url', 'business_logo_url',
            'is_favorite'
        ]

    is_favorite = serializers.SerializerMethodField()
    def get_is_favorite(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorited_by.filter(user=request.user).exists()
        return False


# Role & Permission Serializers
class PermissionSerializer(serializers.ModelSerializer):
    app_label = serializers.CharField(source='content_type.app_label', read_only=True)
    model = serializers.CharField(source='content_type.model', read_only=True)
    
    class Meta:
        model = Permission
        fields = ['id', 'name', 'codename', 'app_label', 'model']


class RoleSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True)
    permission_count = serializers.IntegerField(source='permissions.count', read_only=True)
    user_count = serializers.IntegerField(source='user_roles.count', read_only=True)
    
    class Meta:
        model = Role
        fields = [
            'id', 'name', 'display_name', 'description', 'is_super_admin',
            'permissions', 'permission_count', 'user_count',
            'created_at', 'updated_at'
        ]


class UserRoleSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.display_name', read_only=True)
    user_name = serializers.CharField(source='user.first_name', read_only=True)
    assigned_by_name = serializers.CharField(source='assigned_by.first_name', read_only=True, allow_null=True)
    
    class Meta:
        model = UserRole
        fields = ['id', 'user', 'role', 'role_name', 'user_name', 'assigned_by_name', 'assigned_at']


class FavoriteSerializer(serializers.ModelSerializer):
    business_name = serializers.CharField(source='business.business_name', read_only=True)
    category_name = serializers.CharField(source='business.category.name', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    service_name = serializers.CharField(source='service.name', read_only=True)
    
    # Business Details for Card - Update to use ImageField source
    business_image = serializers.ImageField(source='business.business_image', read_only=True)
    business_logo = serializers.ImageField(source='business.business_logo', read_only=True)
    rating = serializers.DecimalField(source='business.rating', max_digits=3, decimal_places=2, read_only=True)
    review_count = serializers.IntegerField(source='business.review_count', read_only=True)
    location = serializers.CharField(source='business.address', read_only=True)
    verified = serializers.BooleanField(source='business.is_verified', read_only=True)

    # Offering Details
    product_image = serializers.URLField(source='product.product_image_url', read_only=True)
    service_image = serializers.URLField(source='service.service_image_url', read_only=True)
    product_description = serializers.CharField(source='product.description', read_only=True)
    service_description = serializers.CharField(source='service.description', read_only=True)
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    product_currency = serializers.CharField(source='product.price_currency', read_only=True)
    service_price_range = serializers.CharField(source='service.price_range', read_only=True)
    service_duration = serializers.CharField(source='service.duration', read_only=True)

    class Meta:
        model = Favorite
        fields = [
            'id', 'user', 'business', 'product', 'service', 
            'business_name', 'category_name', 'product_name', 'service_name',
            'business_image', 'business_logo', 'rating', 'review_count', 'location', 'verified',
            'product_image', 'service_image', 'product_description', 'service_description',
            'product_price', 'product_currency', 'service_price_range', 'service_duration',
            'created_at'
        ]
        read_only_fields = ['user']
