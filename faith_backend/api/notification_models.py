from django.db import models
from api.models import User, Business, Review

class Notification(models.Model):
    """In-app notifications shown in bell icon dropdown"""
    
    NOTIFICATION_TYPES = (
        ('new_review', 'New Review'),
        ('business_verified', 'Business Verified'),
        ('business_featured', 'Business Featured'),
        ('low_trust_score', 'Low Trust Score'),
        ('weekly_performance', 'Weekly Performance'),
        ('new_business', 'New Business'),
        ('featured_weekly', 'Featured Business'),
        ('special_offer', 'Special Offer'),
        ('church_announcement', 'Church Announcement'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    link = models.CharField(max_length=500, blank=True, null=True, help_text="URL to navigate when clicked")
    
    # Related objects (optional)
    business = models.ForeignKey(Business, on_delete=models.CASCADE, null=True, blank=True)
    review = models.ForeignKey(Review, on_delete=models.CASCADE, null=True, blank=True)
    
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notification'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read', '-created_at']),
        ]
        
    def __str__(self):
        return f"{self.notification_type} for {self.user.phone} - {self.title}"


class NotificationPreference(models.Model):
    """Store user preferences for SMS (Ndovubase) and Email (Brevo) notifications"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preferences')
    
    # Business Owner Notifications
    sms_new_review = models.BooleanField(default=True, help_text="SMS when someone reviews your business")
    email_new_review = models.BooleanField(default=True, help_text="Email when someone reviews your business")
    
    sms_business_verified = models.BooleanField(default=True, help_text="SMS when business gets verified")
    email_business_verified = models.BooleanField(default=True, help_text="Email when business gets verified")
    
    sms_business_featured = models.BooleanField(default=True, help_text="SMS when business is featured")
    email_business_featured = models.BooleanField(default=True, help_text="Email when business is featured")
    
    sms_weekly_performance = models.BooleanField(default=False, help_text="SMS weekly performance digest")
    email_weekly_performance = models.BooleanField(default=True, help_text="Email weekly performance digest")
    
    sms_low_trust_score = models.BooleanField(default=True, help_text="SMS when trust score drops")
    email_low_trust_score = models.BooleanField(default=True, help_text="Email when trust score drops")
    
    # Community Member Notifications
    sms_new_businesses = models.BooleanField(default=False, help_text="SMS about new businesses in favorited categories")
    email_new_businesses = models.BooleanField(default=True, help_text="Email about new businesses")
    
    sms_featured_weekly = models.BooleanField(default=False, help_text="SMS featured business of the week")
    email_featured_weekly = models.BooleanField(default=True, help_text="Email featured business of the week")
    
    sms_special_offers = models.BooleanField(default=True, help_text="SMS special offers from favorited businesses")
    email_special_offers = models.BooleanField(default=True, help_text="Email special offers")
    
    sms_church_announcements = models.BooleanField(default=True, help_text="SMS church/community announcements")
    email_church_announcements = models.BooleanField(default=True, help_text="Email church announcements")
    
    sms_weekly_digest = models.BooleanField(default=False, help_text="SMS weekly community digest")
    email_weekly_digest = models.BooleanField(default=True, help_text="Email weekly community digest")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notification_preference'
        
    def __str__(self):
        return f"Notification Preferences for {self.user.phone}"
