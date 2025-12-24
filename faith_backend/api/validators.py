from django.core.exceptions import ValidationError
from django.db.models import Count

# Business Limits
MAX_BUSINESSES_PER_USER = 1
MAX_PRODUCTS_PER_BUSINESS = 5
MAX_SERVICES_PER_BUSINESS = 5


def validate_one_business_per_user(user):
    """
    Validate that a user can only create one business.
    Raises ValidationError if user already has a business.
    """
    from api.models import Business
    
    existing_count = Business.objects.filter(user=user).count()
    if existing_count >= MAX_BUSINESSES_PER_USER:
        raise ValidationError(
            f'You can only create {MAX_BUSINESSES_PER_USER} business per account. '
            'Please manage your existing business instead.'
        )
    return True


def validate_product_limit(business):
    """
    Validate that a business hasn't reached the product limit.
    Raises ValidationError if limit is reached.
    """
    from api.models import Product
    
    existing_count = Product.objects.filter(business=business).count()
    if existing_count >= MAX_PRODUCTS_PER_BUSINESS:
        raise ValidationError(
            f'Maximum product limit reached. You can have up to '
            f'{MAX_PRODUCTS_PER_BUSINESS} products per business. '
            'Please delete an existing product to add a new one.'
        )
    return True


def validate_service_limit(business):
    """
    Validate that a business hasn't reached the service limit.
    Raises ValidationError if limit is reached.
    """
    from api.models import Service
    
    existing_count = Service.objects.filter(business=business).count()
    if existing_count >= MAX_SERVICES_PER_BUSINESS:
        raise ValidationError(
            f'Maximum service limit reached. You can have up to '
            f'{MAX_SERVICES_PER_BUSINESS} services per business. '
            'Please delete an existing service to add a new one.'
        )
    return True


def get_remaining_slots(user, business=None):
    """
    Get remaining slots for businesses, products, and services.
    Returns a dictionary with remaining counts.
    """
    from api.models import Business, Product, Service
    
    # Business slots
    business_count = Business.objects.filter(user=user).count()
    remaining_businesses = MAX_BUSINESSES_PER_USER - business_count
    
    result = {
        'businesses': {
            'total': MAX_BUSINESSES_PER_USER,
            'used': business_count,
            'remaining': remaining_businesses,
            'can_add': remaining_businesses > 0
        }
    }
    
    # If business is provided, calculate product/service slots
    if business:
        product_count = Product.objects.filter(business=business).count()
        service_count = Service.objects.filter(business=business).count()
        
        result['products'] = {
            'total': MAX_PRODUCTS_PER_BUSINESS,
            'used': product_count,
            'remaining': MAX_PRODUCTS_PER_BUSINESS - product_count,
            'can_add': product_count < MAX_PRODUCTS_PER_BUSINESS
        }
        
        result['services'] = {
            'total': MAX_SERVICES_PER_BUSINESS,
            'used': service_count,
            'remaining': MAX_SERVICES_PER_BUSINESS - service_count,
            'can_add': service_count < MAX_SERVICES_PER_BUSINESS
        }
    
    return result
