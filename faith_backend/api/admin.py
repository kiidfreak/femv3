from django.contrib import admin
from .models import User, Business, Category, Product, Service, Review, Favorite

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('phone', 'email', 'first_name', 'last_name', 'user_type', 'is_verified', 'created_at')
    search_fields = ('phone', 'email', 'first_name', 'last_name', 'partnership_number')
    list_filter = ('user_type', 'is_verified', 'is_staff')

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
