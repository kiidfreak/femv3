from rest_framework import serializers
from .models import User, Business, Category, Service, Product, Review
from django.contrib.auth.models import Permission
from .roles import Role, UserRole

class UserSerializer(serializers.ModelSerializer):
    has_business_profile = serializers.SerializerMethodField()

    def get_has_business_profile(self, obj):
        return obj.businesses.exists()

    class Meta:
        model = User
        fields = ['id', 'phone', 'first_name', 'last_name', 'partnership_number', 'user_type', 'is_verified', 'has_business_profile']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['id', 'name', 'description', 'price_range', 'duration', 'service_image', 'is_active']

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'price_currency', 'product_image', 'is_active', 'in_stock']

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.first_name', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'business', 'user_name', 'rating', 'review_text', 'is_verified', 'created_at']

class BusinessListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    owner_name = serializers.CharField(source='user.first_name', read_only=True)
    product_count = serializers.IntegerField(source='products.count', read_only=True)
    service_count = serializers.IntegerField(source='services.count', read_only=True)
    
    class Meta:
        model = Business
        fields = [
            'id', 'business_name', 'description', 'address', 
            'category', 'category_name', 'owner_name', 'rating', 'review_count',
            'is_verified', 'product_count', 'service_count'
        ]

class BusinessSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    owner_name = serializers.CharField(source='user.first_name', read_only=True)
    services = ServiceSerializer(many=True, read_only=True)
    products = ProductSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    view_count = serializers.SerializerMethodField()

    def get_view_count(self, obj):
        return getattr(obj, 'view_count', 0)

    class Meta:
        model = Business
        fields = [
            'id', 'business_name', 'description', 'address', 
            'phone', 'email', 'website',
            'category', 'category_name', 'owner_name', 'rating', 'review_count', 'view_count',
            'is_verified', 'services', 'products', 'reviews'
        ]


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
