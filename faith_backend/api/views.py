from rest_framework import viewsets, permissions, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.core.exceptions import ValidationError
from .models import User, Business, Category, Service, Product, Review
from .serializers import (
    UserSerializer, BusinessSerializer, BusinessListSerializer, CategorySerializer,
    ServiceSerializer, ProductSerializer, ReviewSerializer
)
from .validators import (
    validate_one_business_per_user,
    validate_product_limit,
    validate_service_limit,
    get_remaining_slots
)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny] # Refine in production

class BusinessViewSet(viewsets.ModelViewSet):
    queryset = Business.objects.select_related('user', 'category').order_by('-created_at')
    serializer_class = BusinessListSerializer
    
    def get_serializer_class(self):
        if self.action == 'list':
            return BusinessListSerializer
        return BusinessSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'is_verified']
    search_fields = ['business_name', 'description']
    
    def perform_create(self, serializer):
        """Validate business limit before creation"""
        if not self.request.user.is_authenticated:
            raise ValidationError({'error': 'Authentication required to create a business'})

        try:
            validate_one_business_per_user(self.request.user)
            serializer.save(user=self.request.user)
        except ValidationError as e:
            raise ValidationError({'error': str(e)})
    
    @action(detail=False, methods=['get'])
    def my_business(self, request):
        """Get the current user's business"""
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        business = Business.objects.filter(user=request.user).first()
        if business:
            serializer = self.get_serializer(business)
            return Response(serializer.data)
        return Response({'error': 'No business found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'])
    def limits(self, request):
        """Get business limits and remaining slots"""
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        business = Business.objects.filter(user=request.user).first()
        limits = get_remaining_slots(request.user, business)
        return Response(limits)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get analytics for the current user's business"""
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        business = Business.objects.filter(user=request.user).first()
        if not business:
            return Response({'error': 'No business profile found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Calculate Trust Score (max 100)
        church_verification = 40 if business.is_verified else 0
        
        # Profile completion estimate
        profile_score = 20
        if business.description: profile_score += 5
        if business.phone: profile_score += 5
        if business.email: profile_score += 5
        if business.website: profile_score += 5
        # Normalize to 20
        profile_score = min(20, (profile_score / 40) * 20)
        
        # Reviews score (max 25)
        reviews_score = min(25, (business.rating * (min(business.review_count, 10) / 10) / 5) * 25)
        
        # Account age (placeholder 15)
        age_score = 15
        
        trust_score = church_verification + profile_score + reviews_score + age_score
        
        return Response({
            'total_views': getattr(business, 'view_count', 0),
            'likes': int(getattr(business, 'view_count', 0) * 0.05), # Estimated likes (5% of views)
            'church_groups': 12, # Placeholder for now
            'trust_score': round(trust_score),
            'trust_breakdown': [
                {'label': 'Church Verification', 'score': church_verification, 'max': 40, 'status': 'Verified' if business.is_verified else 'Pending', 'color': 'bg-green-500'},
                {'label': 'Profile Completeness', 'score': round(profile_score), 'max': 20, 'status': 'High' if profile_score > 15 else 'Medium', 'color': 'bg-blue-500'},
                {'label': 'Community Reviews', 'score': round(reviews_score), 'max': 25, 'status': 'Good' if reviews_score > 15 else 'Developing', 'color': 'bg-yellow-500'},
                {'label': 'Account Age', 'score': age_score, 'max': 15, 'status': 'Stable Member', 'color': 'bg-purple-500'},
            ],
            'daily_views': [max(0, int(getattr(business, 'view_count', 0) / 7) + i * 10) for i in range(7)], # Distributed views
            'referral_sources': [
                {'source': 'Direct Search', 'percentage': 45, 'color': '#F58220'},
                {'source': 'Church Network', 'percentage': 35, 'color': '#3B82F6'},
                {'source': 'Social Media', 'percentage': 15, 'color': '#10B981'},
                {'source': 'Word of Mouth', 'percentage': 5, 'color': '#8B5CF6'},
            ]
        })

    @action(detail=True, methods=['post'])
    def increment_view(self, request, pk=None):
        """Increment the view count for a business"""
        business = self.get_object()
        if hasattr(business, 'view_count'):
            business.view_count += 1
            business.save(update_fields=['view_count'])
            return Response({'status': 'view incremented', 'new_count': business.view_count})
        return Response({'status': 'view count not supported', 'new_count': 0})

from django.db.models import Count

class CategoryViewSet(viewsets.ModelViewSet):
    # Order by number of businesses (popularity) descending
    queryset = Category.objects.annotate(business_count=Count('businesses')).order_by('-business_count')
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['business_id']
    
    def perform_create(self, serializer):
        """Validate service limit before creation"""
        try:
            business = serializer.validated_data.get('business')
            validate_service_limit(business)
            serializer.save()
        except ValidationError as e:
            raise ValidationError({'error': str(e)})

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['business_id']
    
    def perform_create(self, serializer):
        """Validate product limit before creation"""
        try:
            business = serializer.validated_data.get('business')
            validate_product_limit(business)
            serializer.save()
        except ValidationError as e:
            raise ValidationError({'error': str(e)})

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['business_id']

    def perform_create(self, serializer):
        user = self.request.user
        if not user.is_authenticated:
             raise ValidationError({'error': 'Authentication required to review'})
        
        business = serializer.validated_data.get('business')
        if business and business.user == user:
             raise ValidationError({'error': 'You cannot review your own business'})
            
        serializer.save(user=user)
