from rest_framework import serializers
from api.campaign_models import (
    Campaign, CampaignAction, BusinessCampaignProgress,
    CompletedAction, Reward, AwardedReward, FeaturedBusiness
)
from api.serializers import BusinessSerializer

class CampaignActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignAction
        fields = ['id', 'action_type', 'action_name', 'description', 'points', 'order']

class RewardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reward
        fields = ['id', 'reward_type', 'name', 'description', 'required_points', 'icon_url', 'duration_days']

class CampaignSerializer(serializers.ModelSerializer):
    actions = CampaignActionSerializer(many=True, read_only=True)
    rewards = RewardSerializer(many=True, read_only=True)
    
    class Meta:
        model = Campaign
        fields = ['id', 'name', 'description', 'start_date', 'end_date', 'status', 
                  'total_points_available', 'participants_count', 'actions', 'rewards']

class CompletedActionSerializer(serializers.ModelSerializer):
    action = CampaignActionSerializer(read_only=True)
    
    class Meta:
        model = CompletedAction
        fields = ['id', 'action', 'completed_at', 'points_earned']

class BusinessCampaignProgressSerializer(serializers.ModelSerializer):
    campaign = CampaignSerializer(read_only=True)
    completed_actions_list = CompletedActionSerializer(many=True, read_only=True, source='completed_actions')
    progress_percentage = serializers.SerializerMethodField()
    next_actions = serializers.SerializerMethodField()
    
    class Meta:
        model = BusinessCampaignProgress
        fields = ['id', 'campaign', 'total_points_earned', 'is_completed', 
                  'completed_at', 'progress_percentage', 'completed_actions_list', 'next_actions']
    
    def get_progress_percentage(self, obj):
        return obj.calculate_progress_percentage()
    
    def get_next_actions(self, obj):
        """Get next 3 uncompleted actions"""
        completed_ids = obj.actions_completed.values_list('id', flat=True)
        next_actions = obj.campaign.actions.exclude(id__in=completed_ids).order_by('order')[:3]
        return CampaignActionSerializer(next_actions, many=True).data

class AwardedRewardSerializer(serializers.ModelSerializer):
    reward = RewardSerializer(read_only=True)
    
    class Meta:
        model = AwardedReward
        fields = ['id', 'reward', 'awarded_at', 'expires_at', 'is_active']

class FeaturedBusinessSerializer(serializers.ModelSerializer):
    business = BusinessSerializer(read_only=True)
    
    class Meta:
        model = FeaturedBusiness
        fields = ['id', 'business', 'priority', 'start_date', 'end_date']
