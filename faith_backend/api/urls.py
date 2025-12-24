from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, BusinessViewSet, CategoryViewSet,
    ServiceViewSet, ProductViewSet, ReviewViewSet
)
from .auth_views import PhoneLoginView, SignupView, VerifyOTPView, UpdateProfileView
from .role_views import RoleViewSet, UserRoleViewSet, PermissionViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'businesses', BusinessViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'services', ServiceViewSet)
router.register(r'products', ProductViewSet)
router.register(r'reviews', ReviewViewSet)

# Role & Permission Management
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'user-roles', UserRoleViewSet, basename='user-role')
router.register(r'permissions', PermissionViewSet, basename='permission')

urlpatterns = [
    path('auth/login/', PhoneLoginView.as_view(), name='phone_login'),
    path('auth/signup/', SignupView.as_view(), name='signup'),
    path('auth/verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('auth/profile/', UpdateProfileView.as_view(), name='update_profile'),
    path('', include(router.urls)),
]
