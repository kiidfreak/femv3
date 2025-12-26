from django.db import models
from django.utils import timezone
from api.models import Business, User

class Campaign(models.Model):
    """Marketing campaigns created by marketers to engage businesses"""
    
    CAMPAIGN_STATUS = (
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
    )
    
    name = models.CharField(max_length=255, help_text="Campaign name (e.g., 'Profile Completion Challenge')")
    description = models.TextField(help_text="What is this campaign about?")
    
    # Campaign dates
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=CAMPAIGN_STATUS, default='draft')
    
    # Created by marketer
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='campaigns_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Campaign settings
    total_points_available = models.IntegerField(default=0, help_text="Sum of all action points")
    participants_count = models.IntegerField(default=0, help_text="Number of businesses participating")
    
    class Meta:
        db_table = 'campaign'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.status})"
    
    def is_active(self):
        """Check if campaign is currently active"""
        now = timezone.now()
        return (
            self.status == 'active' and
            self.start_date <= now <= self.end_date
        )
    
    def update_total_points(self):
        """Recalculate total available points from all actions"""
        self.total_points_available = self.actions.aggregate(
            total=models.Sum('points')
        )['total'] or 0
        self.save(update_fields=['total_points_available'])


class CampaignAction(models.Model):
    """Specific actions that businesses can complete to earn points"""
    
    ACTION_TYPES = (
        ('add_logo', 'Add Business Logo'),
        ('add_banner', 'Add Business Banner Image'),
        ('add_description', 'Add Business Description'),
        ('add_product', 'Add First Product'),
        ('add_service', 'Add First Service'),
        ('add_5_products', 'Add 5 Products'),
        ('add_5_services', 'Add 5 Services'),
        ('get_verified', 'Get Church Verified'),
        ('get_first_review', 'Receive First Review'),
        ('get_5_reviews', 'Receive 5 Reviews'),
        ('add_social_links', 'Add Social Media Links'),
        ('complete_profile', 'Complete 100% of Profile'),
    )
    
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='actions')
    action_type = models.CharField(max_length=50, choices=ACTION_TYPES)
    action_name = models.CharField(max_length=255, help_text="Custom name for this action")
    description = models.TextField(blank=True, null=True)
    
    points = models.IntegerField(default=10, help_text="Points earned for completing this action")
    
    # Action order/display
    order = models.IntegerField(default=0, help_text="Display order in campaign")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'campaign_action'
        ordering = ['campaign', 'order']
        unique_together = ['campaign', 'action_type']
    
    def __str__(self):
        return f"{self.action_name} ({self.points} pts)"


class BusinessCampaignProgress(models.Model):
    """Track individual business progress in campaigns"""
    
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='campaign_progress')
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='business_progress')
    
    # Progress tracking
    total_points_earned = models.IntegerField(default=0)
    actions_completed = models.ManyToManyField(CampaignAction, through='CompletedAction', related_name='completed_by')
    
    # Dates
    enrolled_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    
    # Completion
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'business_campaign_progress'
        unique_together = ['business', 'campaign']
        ordering = ['-enrolled_at']
    
    def __str__(self):
        return f"{self.business.business_name} - {self.campaign.name} ({self.total_points_earned} pts)"
    
    def calculate_progress_percentage(self):
        """Calculate completion percentage"""
        if self.campaign.total_points_available == 0:
            return 0
        return round((self.total_points_earned / self.campaign.total_points_available) * 100)


class CompletedAction(models.Model):
    """Track when a business completes a specific campaign action"""
    
    progress = models.ForeignKey(BusinessCampaignProgress, on_delete=models.CASCADE, related_name='completed_actions')
    action = models.ForeignKey(CampaignAction, on_delete=models.CASCADE)
    
    completed_at = models.DateTimeField(auto_now_add=True)
    points_earned = models.IntegerField(help_text="Points earned at time of completion")
    
    # Verification (for manual actions)
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        db_table = 'completed_action'
        unique_together = ['progress', 'action']
        ordering = ['-completed_at']
    
    def __str__(self):
        return f"{self.progress.business.business_name} completed {self.action.action_name}"


class Reward(models.Model):
    """Rewards that businesses can earn from campaigns"""
    
    REWARD_TYPES = (
        ('badge', 'Badge'),
        ('featured', 'Featured Listing'),
        ('discount', 'Platform Discount'),
        ('boost', 'Profile Boost'),
        ('priority', 'Priority Support'),
    )
    
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='rewards')
    
    reward_type = models.CharField(max_length=50, choices=REWARD_TYPES)
    name = models.CharField(max_length=255)
    description = models.TextField()
    
    # Requirements
    required_points = models.IntegerField(help_text="Points needed to unlock this reward")
    
    # Reward details
    icon_url = models.CharField(max_length=500, blank=True, null=True)
    duration_days = models.IntegerField(null=True, blank=True, help_text="How long reward lasts (for time-limited rewards)")
    
    awarded_to = models.ManyToManyField(Business, through='AwardedReward', related_name='rewards_earned')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'reward'
        ordering = ['required_points']
    
    def __str__(self):
        return f"{self.name} ({self.required_points} pts)"


class AwardedReward(models.Model):
    """Track when rewards are given to businesses"""
    
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='awarded_rewards')
    reward = models.ForeignKey(Reward, on_delete=models.CASCADE)
    campaign_progress = models.ForeignKey(BusinessCampaignProgress, on_delete=models.CASCADE)
    
    awarded_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'awarded_reward'
        unique_together = ['business', 'reward']
        ordering = ['-awarded_at']
    
    def __str__(self):
        return f"{self.business.business_name} earned {self.reward.name}"


class FeaturedBusiness(models.Model):
    """Admin-selected featured businesses shown on homepage and directory"""
    
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='featured_listings')
    
    # Scheduling
    start_date = models.DateTimeField(help_text="When to start featuring this business")
    end_date = models.DateTimeField(help_text="When to stop featuring this business")
    
    # Display settings
    priority = models.IntegerField(default=0, help_text="Higher number = shown first")
    featured_on_homepage = models.BooleanField(default=True, help_text="Show on homepage featured section")
    featured_in_directory = models.BooleanField(default=True, help_text="Show at top of directory")
    featured_in_category = models.BooleanField(default=False, help_text="Show at top of its category")
    
    # Admin tracking
    selected_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='businesses_featured')
    reason = models.TextField(blank=True, null=True, help_text="Why is this business featured? (internal note)")
    
    # Payment/Campaign link (optional)
    campaign = models.ForeignKey(Campaign, on_delete=models.SET_NULL, null=True, blank=True, help_text="Link to campaign if featured as reward")
    is_paid_feature = models.BooleanField(default=False, help_text="Is this a paid featured listing?")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'featured_business'
        ordering = ['-priority', '-start_date']
        indexes = [
            models.Index(fields=['start_date', 'end_date']),
            models.Index(fields=['-priority']),
        ]
    
    def __str__(self):
        return f"{self.business.business_name} (Featured {self.start_date.date()} - {self.end_date.date()})"
    
    def is_active(self):
        """Check if currently featured"""
        now = timezone.now()
        return self.start_date <= now <= self.end_date
    
    @classmethod
    def get_active_featured(cls, location='homepage'):
        """Get currently active featured businesses"""
        now = timezone.now()
        queryset = cls.objects.filter(
            start_date__lte=now,
            end_date__gte=now
        ).select_related('business')
        
        if location == 'homepage':
            queryset = queryset.filter(featured_on_homepage=True)
        elif location == 'directory':
            queryset = queryset.filter(featured_in_directory=True)
        elif location == 'category':
            queryset = queryset.filter(featured_in_category=True)
        
        return queryset.order_by('-priority', '-start_date')
