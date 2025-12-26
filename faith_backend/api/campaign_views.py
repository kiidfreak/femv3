from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta

from api.campaign_models import (
    Campaign, CampaignAction, BusinessCampaignProgress,
    CompletedAction, Reward, AwardedReward, FeaturedBusiness
)
from api.campaign_serializers import (
    CampaignSerializer, BusinessCampaignProgressSerializer,
    AwardedRewardSerializer, FeaturedBusinessSerializer
)
from api.models import Business
from api.services.notification_service import notification_service

class CampaignViewSet(viewsets.ReadOnlyModelViewSet):
    """View campaigns (read-only for businesses)"""
    serializer_class = CampaignSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        # Only show active campaigns
        now = timezone.now()
        return Campaign.objects.filter(
            status='active',
            start_date__lte=now,
            end_date__gte=now
        ).prefetch_related('actions', 'rewards')
    
    @action(detail=True, methods=['get'])
    def my_progress(self, request, pk=None):
        """Get my progress in this campaign"""
        campaign = self.get_object()
        business = Business.objects.filter(user=request.user).first()
        
        if not business:
            return Response({'error': 'No business profile'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get or create progress
        progress, created = BusinessCampaignProgress.objects.get_or_create(
            business=business,
            campaign=campaign
        )
        
        if created:
            # Update participant count
            campaign.participants_count += 1
            campaign.save(update_fields=['participants_count'])
        
        serializer = BusinessCampaignProgressSerializer(progress)
        return Response(serializer.data)


class MyRewardsViewSet(viewsets.ReadOnlyModelViewSet):
    """View my earned rewards"""
    serializer_class = AwardedRewardSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        business = Business.objects.filter(user=self.request.user).first()
        if not business:
            return AwardedReward.objects.none()
        return AwardedReward.objects.filter(
            business=business,
            is_active=True
        ).select_related('reward', 'campaign_progress')


class FeaturedBusinessViewSet(viewsets.ReadOnlyModelViewSet):
    """Public featured businesses"""
    serializer_class = FeaturedBusinessSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        return FeaturedBusiness.get_active_featured()
    
    @action(detail=False, methods=['get'])
    def homepage(self, request):
        """Get featured businesses for homepage"""
        featured = FeaturedBusiness.get_active_featured('homepage')[:6]
        serializer = self.get_serializer(featured, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def directory(self, request):
        """Get featured businesses for directory"""
        featured = FeaturedBusiness.get_active_featured('directory')[:3]
        serializer = self.get_serializer(featured, many=True)
        return Response(serializer.data)


# Auto-completion logic
def check_and_award_campaign_actions(business):
    """Check and auto-award campaign actions when business updates"""
    from api.services.sms_service import ndovubase_service
    from api.services.email_service import brevo_service
    
    # Get active campaigns
    now = timezone.now()
    active_campaigns = Campaign.objects.filter(
        status='active',
        start_date__lte=now,
        end_date__gte=now
    )
    
    for campaign in active_campaigns:
        # Get or create progress
        progress, _ = BusinessCampaignProgress.objects.get_or_create(
            business=business,
            campaign=campaign
        )
        
        # Check each action
        for action in campaign.actions.all():
            # Skip if already completed
            if progress.actions_completed.filter(id=action.id).exists():
                continue
            
            # Check completion conditions
            if should_award_action(business, action):
                award_action(business, progress, action)

def should_award_action(business, action):
    """Check if business meets criteria for action"""
    action_type = action.action_type
    
    if action_type == 'add_logo':
        return bool(business.business_logo)
    elif action_type == 'add_banner':
        return bool(business.business_image)
    elif action_type == 'add_description':
        return bool(business.description and len(business.description) > 50)
    elif action_type == 'add_product':
        return business.products.filter(is_active=True).count() >= 1
    elif action_type == 'add_service':
        return business.services.filter(is_active=True).count() >= 1
    elif action_type == 'add_5_products':
        return business.products.filter(is_active=True).count() >= 5
    elif action_type == 'add_5_services':
        return business.services.filter(is_active=True).count() >= 5
    elif action_type == 'get_verified':
        return business.is_verified
    elif action_type == 'get_first_review':
        return business.review_count >= 1
    elif action_type == 'get_5_reviews':
        return business.review_count >= 5
    elif action_type == 'add_social_links':
        return bool(business.facebook_url or business.instagram_url or business.twitter_url)
    elif action_type == 'complete_profile':
        return calculate_profile_completion(business) >= 100
    
    return False

def calculate_profile_completion(business):
    """Calculate profile completion percentage"""
    fields = ['business_logo', 'business_image', 'description', 'phone', 
              'email', 'address', 'website']
    completed = sum(1 for field in fields if getattr(business, field, None))
    has_offering = business.products.exists() or business.services.exists()
    has_socials = bool(business.facebook_url or business.instagram_url)
    
    return int(((completed + has_offering + has_socials) / 9) * 100)

def award_action(business, progress, action):
    """Award points and create notification"""
    # Create completed action
    CompletedAction.objects.create(
        progress=progress,
        action=action,
        points_earned=action.points
    )
    
    # Update progress
    progress.total_points_earned += action.points
    progress.save()
    
    # Send notifications
    send_action_completed_notification(business, action, progress)
    
    # Check for rewards
    check_and_award_rewards(business, progress)

def send_action_completed_notification(business, action, progress):
    """Send email/SMS when action completed"""
    user = business.user
    
    # In-app + optional SMS/Email
    notification_service.send_notification(
        user=user,
        notification_type='campaign',
        title=f"🎉 +{action.points} Points!",
        message=f"You completed: {action.action_name}",
        link=f"/dashboard",
        sms_enabled=True,
        email_enabled=True,
        sms_message=f"🎉 +{action.points} pts! You completed {action.action_name}. Total: {progress.total_points_earned} pts",
        email_data={
            'subject': f"🎉 You earned {action.points} points!",
            'html_content': f"""
            <h2>Congratulations!</h2>
            <p>You completed: <strong>{action.action_name}</strong></p>
            <p>Points earned: <strong>+{action.points}</strong></p>
            <p>Total points: <strong>{progress.total_points_earned}/{progress.campaign.total_points_available}</strong></p>
            <p>Progress: <strong>{progress.calculate_progress_percentage()}%</strong></p>
            <a href="https://faithconnect.co.ke/dashboard">View Dashboard</a>
            """
        }
    )

def check_and_award_rewards(business, progress):
    """Check if business unlocked any rewards"""
    for reward in progress.campaign.rewards.all():
        # Already awarded?
        if AwardedReward.objects.filter(business=business, reward=reward).exists():
            continue
        
        # Points sufficient?
        if progress.total_points_earned >= reward.required_points:
            # Award it!
            expires_at = None
            if reward.duration_days:
                expires_at = timezone.now() + timedelta(days=reward.duration_days)
            
            AwardedReward.objects.create(
                business=business,
                reward=reward,
                campaign_progress=progress,
                expires_at=expires_at
            )
            
            # Apply reward (e.g., feature business)
            if reward.reward_type == 'featured' and reward.duration_days:
                FeaturedBusiness.objects.create(
                    business=business,
                    start_date=timezone.now(),
                    end_date=timezone.now() + timedelta(days=reward.duration_days),
                    priority=5,
                    campaign=progress.campaign,
                    reason=f"Earned from campaign: {progress.campaign.name}"
                )
            
            # Notify
            send_reward_earned_notification(business, reward, progress)

def send_reward_earned_notification(business, reward, progress):
    """Send notification when reward earned"""
    user = business.user
    
    notification_service.send_notification(
        user=user,
        notification_type='campaign',
        title=f"🏆 Reward Unlocked!",
        message=f"You earned: {reward.name}",
        link=f"/dashboard",
        sms_enabled=True,
        email_enabled=True,
        sms_message=f"🏆 Reward Unlocked! {reward.name} - Check your dashboard",
        email_data={
            'subject': f"🏆 You unlocked: {reward.name}!",
            'html_content': f"""
            <h2>Reward Unlocked! 🏆</h2>
            <h3>{reward.name}</h3>
            <p>{reward.description}</p>
            <p>You earned this by reaching <strong>{reward.required_points} points</strong></p>
            <a href="https://faithconnect.co.ke/dashboard">View Your Rewards</a>
            """
        }
    )
