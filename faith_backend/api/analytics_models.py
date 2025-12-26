from django.db import models
from api.models import Business, User
from django.utils import timezone

class PageView(models.Model):
    """Track individual page views for analytics"""
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='page_views')
    viewed_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    # User tracking (optional - for logged-in users)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Session tracking (for anonymous users)
    session_id = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    
    # Referral tracking
    referrer = models.CharField(max_length=500, blank=True, null=True, help_text="HTTP Referer header")
    referrer_source = models.CharField(max_length=100, blank=True, null=True, db_index=True, help_text="Categorized source: Direct, Google, Facebook, etc.")
    
    # Technical details
    user_agent = models.CharField(max_length=500, blank=True, null=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        db_table = 'business_page_view'
        ordering = ['-viewed_at']
        indexes = [
            models.Index(fields=['business', '-viewed_at']),
            models.Index(fields=['business', 'referrer_source']),
        ]
    
    def __str__(self):
        return f"View of {self.business.business_name} at {self.viewed_at}"
    
    @staticmethod
    def categorize_referrer(referrer):
        """Categorize referrer URL into source name"""
        if not referrer:
            return 'Direct'
        
        referrer = referrer.lower()
        
        # Social media
        if 'facebook.com' in referrer or 'fb.com' in referrer:
            return 'Facebook'
        if 'twitter.com' in referrer or 't.co' in referrer:
            return 'Twitter'
        if 'instagram.com' in referrer:
            return 'Instagram'
        if 'linkedin.com' in referrer:
            return 'LinkedIn'
        if 'whatsapp.com' in referrer or 'wa.me' in referrer:
            return 'WhatsApp'
        
        # Search engines
        if 'google.com' in referrer or 'google.' in referrer:
            return 'Google'
        if 'bing.com' in referrer:
            return 'Bing'
        if 'yahoo.com' in referrer:
            return 'Yahoo'
        
        # Internal
        if 'faithconnect' in referrer or 'localhost' in referrer:
            return 'Internal'
        
        # Other
        return 'Other'
