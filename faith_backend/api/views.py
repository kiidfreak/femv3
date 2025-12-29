from rest_framework import viewsets, permissions, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError as DRFValidationError
from django_filters.rest_framework import DjangoFilterBackend
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Count, Avg, Case, When, Value, IntegerField
from django.utils import timezone
from datetime import timedelta
from .models import User, Business, Category, Service, Product, Review, Favorite
from .serializers import (
    UserSerializer, BusinessSerializer, BusinessListSerializer, CategorySerializer,
    ServiceSerializer, ProductSerializer, ReviewSerializer, FavoriteSerializer
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

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def recent_members(self, request):
        """Get recent members with profile pictures for homepage display"""
        users = User.objects.filter(
            profile_image__isnull=False
        ).exclude(profile_image='').order_by('-created_at')[:20]
        
        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data)

class BusinessViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        queryset = Business.objects.select_related('user', 'category').annotate(
            products_count_annotated=Count('products', distinct=True),
            services_count_annotated=Count('services', distinct=True),
            has_identity=Case(
                When(business_logo__isnull=False, then=Value(1)),
                When(business_image__isnull=False, then=Value(1)),
                default=Value(0),
                output_field=IntegerField(),
            )
        ).prefetch_related('services', 'products', 'reviews__user', 'images')

        # Location-based filtering (Radius search approximation)
        lat = self.request.query_params.get('lat')
        lng = self.request.query_params.get('lng')
        radius = self.request.query_params.get('radius', 50) # default 50km

        if lat and lng:
            try:
                lat, lng, radius = float(lat), float(lng), float(radius)
                # Degrees to km approx: 1 deg = 111km
                lat_deg = radius / 111.0
                lng_deg = radius / (111.0 * abs(float(lat) / 90.0 + 0.1)) # Rough approx
                
                queryset = queryset.filter(
                    latitude__range=(lat - lat_deg, lat + lat_deg),
                    longitude__range=(lng - lng_deg, lng + lng_deg)
                )
            except ValueError:
                pass

        return queryset.order_by('-is_verified', '-has_identity', '-rating', '-created_at')

    serializer_class = BusinessListSerializer
    
    def get_serializer_class(self):
        if self.action == 'list':
            return BusinessListSerializer
        if self.action == 'suggestions':
            return BusinessListSerializer
        return BusinessSerializer
        
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'is_verified', 'business_type']
    search_fields = ['business_name', 'description']

    @action(detail=False, methods=['get'])
    def suggestions(self, request):
        """Quick search suggestions for Hero search box"""
        query = request.query_params.get('q', '')
        if not query:
            return Response([])
        
        businesses = self.get_queryset().filter(business_name__icontains=query)[:5]
        serializer = BusinessListSerializer(businesses, many=True, context={'request': request})
        
        # Also suggest categories
        categories = Category.objects.filter(name__icontains=query)[:3]
        cat_serializer = CategorySerializer(categories, many=True)
        
        return Response({
            'businesses': serializer.data,
            'categories': cat_serializer.data
        })

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def download_report(self, request):
        """Download business performance report as CSV"""
        import csv
        from django.http import HttpResponse
        
        business = Business.objects.filter(user=request.user).first()
        if not business:
            return Response({'error': 'No business profile found'}, status=404)
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{business.business_name}_report.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Date', 'Metric', 'Value', 'Details'])
        
        # Add basic stats
        writer.writerow([timezone.now().date(), 'Total Views', business.view_count, 'Lifetime views'])
        writer.writerow([timezone.now().date(), 'Current Rating', business.rating, f'From {business.review_count} reviews'])
        
        # Add page views summary (Last 30 days)
        from api.analytics_models import PageView
        thirty_days_ago = timezone.now() - timedelta(days=30)
        views_by_source = business.page_views.filter(viewed_at__gte=thirty_days_ago).values('referrer_source').annotate(count=Count('id'))
        
        writer.writerow([])
        writer.writerow(['30-Day Traffic Sources'])
        for item in views_by_source:
            writer.writerow(['', item['referrer_source'] or 'Direct', item['count'], ''])
            
        return response
    
    def perform_create(self, serializer):
        """Validate business limit before creation"""
        if not self.request.user.is_authenticated:
            raise DRFValidationError({'error': 'Authentication required to create a business'})

        try:
            validate_one_business_per_user(self.request.user)
            serializer.save(user=self.request.user)
        except (DjangoValidationError, DRFValidationError) as e:
            raise DRFValidationError({'error': str(e)})
    
    @action(detail=False, methods=['get'])
    def my_business(self, request):
        """Get the current user's business with all related data"""
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Use the base queryset which already has annotations and prefetches
        business = self.get_queryset().filter(user=request.user).first()
        if business:
            serializer = BusinessSerializer(business)
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

    @action(detail=True, methods=['post'])
    def upload_image(self, request, pk=None):
        business = self.get_object()
        if business.user != request.user:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
            
        image_file = request.FILES.get('image')
        if not image_file:
            return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Limit to 10 images
        if business.images.count() >= 10:
            return Response({'error': 'Maximum 10 images allowed in gallery'}, status=status.HTTP_400_BAD_REQUEST)
            
        business_image = BusinessImage.objects.create(
            business=business,
            image=image_file,
            caption=request.data.get('caption', '')
        )
        
        return Response(BusinessImageSerializer(business_image).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path='delete_image/(?P<image_id>[^/.]+)')
    def delete_image(self, request, pk=None, image_id=None):
        business = self.get_object()
        if business.user != request.user:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            img = business.images.get(id=image_id)
            img.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except BusinessImage.DoesNotExist:
            return Response({'error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get analytics for the current user's business"""
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        business = Business.objects.filter(user=request.user).annotate(
            prod_count=Count('products', distinct=True),
            serv_count=Count('services', distinct=True)
        ).first()

        if not business:
            return Response({'error': 'No business profile found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Calculate Trust Score (Using model property)
        trust_score = business.trust_score
        
        # Breakdown for frontend (matching model property logic)
        church_verification = 40 if business.is_verified else 0
        
        # Profile calculation (same logic as property)
        profile_pts = 0
        if business.description: profile_pts += 1
        if business.phone: profile_pts += 1
        if business.email: profile_pts += 1
        if business.website: profile_pts += 1
        if business.business_logo: profile_pts += 1
        if business.business_image: profile_pts += 1
        if business.address: profile_pts += 1
        if business.prod_count > 0 or business.serv_count > 0: profile_pts += 1
        if business.user.profile_image: profile_pts += 1
        
        profile_score = (profile_pts / 9) * 20
        
        review_vol_factor = min(business.review_count, 10) / 10
        reviews_score = float(business.rating) * review_vol_factor * 5
        
        age_score = 0
        if business.created_at:
            days = (timezone.now() - business.created_at).days
            age_score = min(15, (days / 365) * 15)
            
        trust_breakdown = [
            {'label': 'Church Verification', 'score': church_verification, 'max': 40, 'status': 'Verified' if business.is_verified else 'Pending', 'color': 'bg-green-500' if business.is_verified else 'bg-gray-300'},
            {'label': 'Profile Completeness', 'score': round(profile_score), 'max': 20, 'status': 'Good' if profile_pts >= 6 else 'Partial', 'color': 'bg-blue-500' if profile_pts >= 6 else 'bg-blue-300'},
            {'label': 'Community Reviews', 'score': round(reviews_score), 'max': 25, 'status': 'Active' if business.review_count > 0 else 'None', 'color': 'bg-yellow-500' if business.review_count > 0 else 'bg-yellow-300'},
            {'label': 'Account Age', 'score': round(age_score), 'max': 15, 'status': 'Established' if age_score > 10 else 'New', 'color': 'bg-purple-500' if age_score > 10 else 'bg-purple-300'},
        ]
        
        # Real Analytics from PageView model
        from api.analytics_models import PageView
        
        # Total views from PageView table
        total_views = business.page_views.count()
        
        # Likes = Favorites count
        likes_count = business.favorited_by.count()
        
        # Daily views for last 7 days
        seven_days_ago = timezone.now() -timedelta(days=7)
        daily_views = []
        for i in range(7):
            day_start = seven_days_ago + timedelta(days=i)
            day_end = day_start + timedelta(days=1)
            views_count = business.page_views.filter(
                viewed_at__gte=day_start,
                viewed_at__lt=day_end
            ).count()
            daily_views.append(views_count)
        
        # Referral sources aggregation
        referral_data = business.page_views.values('referrer_source').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Calculate percentages
        total_refs = sum(item['count'] for item in referral_data) or 1
        referral_sources = []
        colors = {
            'Direct': '#F58220',
            'Google': '#EA4335',
            'Facebook': '#1877F2',
            'Internal': '#3B82F6',
            'WhatsApp': '#25D366',
            'Other': '#8B5CF6'
        }
        
        for item in referral_data[:5]:  # Top 5 sources
            source = item['referrer_source'] or 'Unknown'
            percentage = round((item['count'] / total_refs) * 100)
            referral_sources.append({
                'source': source,
                'percentage': percentage,
                'color': colors.get(source, '#6B7280')
            })
        
        return Response({
            'total_views': total_views,
            'likes': likes_count,
            'trust_score': round(trust_score),
            'products_count': getattr(business, 'prod_count', 0),
            'services_count': getattr(business, 'serv_count', 0),
            'trust_breakdown': [
                {'label': 'Church Verification', 'score': round(church_verification), 'max': 40, 'status': 'Verified' if business.is_verified else 'Pending', 'color': 'bg-green-500' if business.is_verified else 'bg-gray-300'},
                {'label': 'Profile Completeness', 'score': round(profile_score), 'max': 20, 'status': 'Good' if profile_pts >= 6 else 'Partial', 'color': 'bg-blue-500' if profile_pts >= 6 else 'bg-blue-300'},
                {'label': 'Community Reviews', 'score': round(reviews_score), 'max': 25, 'status': 'Active' if business.review_count > 0 else 'None', 'color': 'bg-yellow-500' if business.review_count > 0 else 'bg-yellow-300'},
                {'label': 'Account Age', 'score': round(age_score), 'max': 15, 'status': 'Established' if age_score > 10 else 'New', 'color': 'bg-purple-500' if age_score > 10 else 'bg-purple-300'},
            ],
            'daily_views': daily_views,
            'referral_sources': referral_sources if referral_sources else [{'source': 'Direct', 'percentage': 100, 'color': '#F58220'}]
        })

    @action(detail=True, methods=['post'])
    def increment_view(self, request, pk=None):
        """Log detailed page view for analytics"""
        from api.analytics_models import PageView
        
        business = self.get_object()
        
        # Get referrer and categorize
        referrer = request.META.get('HTTP_REFERER', '')
        referrer_source = PageView.categorize_referrer(referrer)
        
        # Get session/user info
        user = request.user if request.user.is_authenticated else None
        session_id = request.session.session_key if hasattr(request, 'session') else None
        
        # Log the page view
        PageView.objects.create(
            business=business,
            user=user,
            session_id=session_id,
            referrer=referrer[:500] if referrer else None,
            referrer_source=referrer_source,
            user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        # Also increment simple counter if exists
        if hasattr(business, 'view_count'):
            business.view_count = (business.view_count or 0) + 1
            business.save(update_fields=['view_count'])
        
        total_views = business.page_views.count()
        return Response({'status': 'view logged', 'total_views': total_views})

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def public_stats(self, request):
        """Get public platform statistics for homepage"""
        total_businesses = Business.objects.count()
        total_members = User.objects.count()
        verified_count = Business.objects.filter(is_verified=True).count()
        verified_percentage = round((verified_count / total_businesses * 100)) if total_businesses > 0 else 0
        avg_rating = Business.objects.aggregate(Avg('rating'))['rating__avg'] or 0
        
        return Response({
            'total_businesses': total_businesses,
            'total_members': total_members,
            'verified_percentage': verified_percentage,
            'avg_rating': round(avg_rating, 1)
        })


class CategoryViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        return Category.objects.annotate(
            business_count=Count('businesses', distinct=True),
            offering_count=Count('businesses__products', distinct=True) + Count('businesses__services', distinct=True)
        ).order_by('-business_count')
    
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

class ServiceViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        # Prioritize services from verified businesses with visual identity
        return Service.objects.select_related('business').annotate(
            biz_has_identity=Case(
                When(business__business_logo__isnull=False, then=Value(1)),
                When(business__business_image__isnull=False, then=Value(1)),
                default=Value(0),
                output_field=IntegerField(),
            )
        ).order_by('-business__is_verified', '-biz_has_identity', '-business__rating', '-created_at')
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['business_id', 'business__category']
    search_fields = ['name', 'description', 'business__business_name']
    
    def perform_create(self, serializer):
        """Automatically assign the user's business and validate limit"""
        user = self.request.user
        
        try:
            business = user.businesses.first()
            if not business:
                raise DRFValidationError({'error': 'You must create a business profile before adding services.'})
                
            validate_service_limit(business)
            serializer.save(business=business)
        except (DjangoValidationError, DRFValidationError) as e:
            raise DRFValidationError({'error': str(e)})
        except Exception as e:
            raise DRFValidationError({'error': f'Database error: {str(e)}'})

class ProductViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        # Prioritize products from verified businesses with visual identity
        return Product.objects.select_related('business').annotate(
            biz_has_identity=Case(
                When(business__business_logo__isnull=False, then=Value(1)),
                When(business__business_image__isnull=False, then=Value(1)),
                default=Value(0),
                output_field=IntegerField(),
            )
        ).order_by('-business__is_verified', '-biz_has_identity', '-business__rating', '-created_at')
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['business_id', 'business__category']
    search_fields = ['name', 'description', 'business__business_name']
    
    def perform_create(self, serializer):
        """Automatically assign the user's business and validate limit"""
        user = self.request.user
        
        try:
            business = user.businesses.first()
            if not business:
                raise DRFValidationError({'error': 'You must create a business profile before adding products.'})
                
            validate_product_limit(business)
            serializer.save(business=business)
        except (DjangoValidationError, DRFValidationError) as e:
            raise DRFValidationError({'error': str(e)})
        except Exception as e:
            raise DRFValidationError({'error': f'Database error: {str(e)}'})

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.select_related('user', 'business', 'business__category').all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['business_id', 'user_id']

    def perform_create(self, serializer):
        user = self.request.user
        if not user.is_authenticated:
             raise DRFValidationError({'error': 'Authentication required to review'})
        
        business = serializer.validated_data.get('business')
        if business and business.user == user:
             raise DRFValidationError({'error': 'You cannot review your own business'})
            
        serializer.save(user=user)


class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        business = serializer.validated_data.get('business')
        product = serializer.validated_data.get('product')
        service = serializer.validated_data.get('service')

        if not any([business, product, service]):
            raise DRFValidationError({'error': 'You must specify either a business, product, or service.'})

        existing = Favorite.objects.filter(
            user=self.request.user,
            business=business,
            product=product,
            service=service
        ).exists()

        if existing:
            raise DRFValidationError({'error': 'Already in favorites'})

        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def toggle(self, request):
        business_id = request.data.get('business')
        product_id = request.data.get('product')
        service_id = request.data.get('service')

        if not any([business_id, product_id, service_id]):
            return Response({'error': 'Missing identifier'}, status=400)

        # Build exact filter to avoid deleting "all business favorites" when toggling a product
        filter_params = {'user': request.user}
        if business_id: 
            filter_params['business_id'] = business_id
            filter_params['product_id'] = None
            filter_params['service_id'] = None
        elif product_id:
            filter_params['product_id'] = product_id
            filter_params['business_id'] = None
            filter_params['service_id'] = None
        elif service_id:
            filter_params['service_id'] = service_id
            filter_params['business_id'] = None
            filter_params['product_id'] = None

        fav = Favorite.objects.filter(**filter_params).first()
        if fav:
            fav.delete()
            return Response({'status': 'removed', 'is_favorite': False})
        else:
            # Clear other fields for this specific favorite type
            Favorite.objects.create(**filter_params)
            return Response({'status': 'added', 'is_favorite': True})
