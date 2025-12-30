from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Business, Category, Product, Service, Review, Favorite

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('phone', 'email', 'first_name', 'last_name', 'user_type', 'is_verified', 'is_staff')
    list_filter = ('user_type', 'is_verified', 'is_staff', 'is_superuser')
    search_fields = ('phone', 'email', 'first_name', 'last_name', 'partnership_number')
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {'fields': ('phone', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'email', 'partnership_number', 'profile_image')}),
        ('Permissions', {'fields': ('user_type', 'is_verified', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    readonly_fields = ('created_at', 'updated_at')
    
    # Required for custom User models with phone as USERNAME_FIELD
    add_fieldsets = (
        (None, {
            'classes': ('extrapretty',),
            'fields': ('phone', 'partnership_number', 'user_type', 'password'),
        }),
    )

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Business)
class BusinessAdmin(admin.ModelAdmin):
    list_display = ('business_name', 'user', 'category', 'is_verified', 'rating', 'view_count')
    search_fields = ('business_name', 'user__phone', 'user__email')
    list_filter = ('is_verified', 'category', 'is_featured')
    readonly_fields = ('rating', 'review_count', 'view_count')

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'business', 'price', 'is_active', 'in_stock')
    search_fields = ('name', 'business__business_name')
    list_filter = ('is_active', 'in_stock')

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'business', 'price', 'is_active')
    search_fields = ('name', 'business__business_name')
    list_filter = ('is_active',)

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('business', 'user', 'rating', 'is_verified', 'created_at')
    list_filter = ('rating', 'is_verified')

@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'business', 'product', 'service', 'created_at')

# Import campaign admin to register all campaign models
from . import campaign_admin
