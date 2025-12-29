from django.urls import path, include
# Trigger reload again
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, BusinessViewSet, CategoryViewSet,
    ServiceViewSet, ProductViewSet, ReviewViewSet, FavoriteViewSet
)
from .auth_views import PhoneLoginView, SignupView, VerifyOTPView, UpdateProfileView, ResendOTPView
from .role_views import RoleViewSet, UserRoleViewSet, PermissionViewSet
from .notification_views import NotificationViewSet, NotificationPreferenceViewSet
from .campaign_views import CampaignViewSet, MyRewardsViewSet, FeaturedBusinessViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'businesses', BusinessViewSet, basename='business')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'reviews', ReviewViewSet)
router.register(r'favorites', FavoriteViewSet, basename='favorite')

# Role & Permission Management
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'user-roles', UserRoleViewSet, basename='user-role')
router.register(r'permissions', PermissionViewSet, basename='permission')

# Notifications
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'notification-preferences', NotificationPreferenceViewSet, basename='notification-preference')

# Campaigns & Rewards
router.register(r'campaigns', CampaignViewSet, basename='campaign')
router.register(r'my-rewards', MyRewardsViewSet, basename='my-rewards')
router.register(r'featured-businesses', FeaturedBusinessViewSet, basename='featured-businesses')

urlpatterns = [
    # Auth endpoints
    path('auth/login/', PhoneLoginView.as_view(), name='phone_login'),
    path('auth/signup/', SignupView.as_view(), name='signup'),
    path('auth/verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('auth/resend-otp/', ResendOTPView.as_view(), name='resend_otp'),
    path('auth/profile/', UpdateProfileView.as_view(), name='update_profile'),
    path('', include(router.urls)),
]
