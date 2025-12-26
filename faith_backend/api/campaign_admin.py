from django.contrib import admin
from api.campaign_models import (
    Campaign, CampaignAction, BusinessCampaignProgress, 
    CompletedAction, Reward, AwardedReward, FeaturedBusiness
)

class CampaignActionInline(admin.TabularInline):
    model = CampaignAction
    extra = 1
    fields = ['action_type', 'action_name', 'points', 'order']

class RewardInline(admin.TabularInline):
    model = Reward
    extra = 1
    fields = ['reward_type', 'name', 'required_points', 'duration_days']

@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ['name', 'status', 'start_date', 'end_date', 'participants_count', 'total_points_available', 'created_by']
    list_filter = ['status', 'start_date', 'created_by']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at', 'total_points_available', 'participants_count']
    
    fieldsets = (
        ('Campaign Info', {
            'fields': ('name', 'description', 'status')
        }),
        ('Schedule', {
            'fields': ('start_date', 'end_date')
        }),
        ('Stats', {
            'fields': ('total_points_available', 'participants_count', 'created_by'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [CampaignActionInline, RewardInline]
    
    def save_model(self, request, obj, form, change):
        if not change:  # New campaign
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
    
    def save_formset(self, request, form, formset, change):
        """After saving actions, update total points"""
        super().save_formset(request, form, formset, change)
        if isinstance(formset.model, CampaignAction):
            form.instance.update_total_points()


@admin.register(CampaignAction)
class CampaignActionAdmin(admin.ModelAdmin):
    list_display = ['action_name', 'campaign', 'action_type', 'points', 'order']
    list_filter = ['campaign', 'action_type']
    search_fields = ['action_name', 'campaign__name']
    ordering = ['campaign', 'order']


@admin.register(BusinessCampaignProgress)
class BusinessCampaignProgressAdmin(admin.ModelAdmin):
    list_display = ['business', 'campaign', 'total_points_earned', 'is_completed', 'enrolled_at']
    list_filter = ['campaign', 'is_completed', 'enrolled_at']
    search_fields = ['business__business_name', 'campaign__name']
    readonly_fields = ['enrolled_at', 'last_activity', 'completed_at']
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('business', 'campaign')


@admin.register(CompletedAction)
class CompletedActionAdmin(admin.ModelAdmin):
    list_display = ['progress', 'action', 'points_earned', 'completed_at', 'verified_by']
    list_filter = ['completed_at', 'verified_by']
    search_fields = ['progress__business__business_name', 'action__action_name']
    readonly_fields = ['completed_at']
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('progress__business', 'action', 'verified_by')


@admin.register(Reward)
class RewardAdmin(admin.ModelAdmin):
    list_display = ['name', 'campaign', 'reward_type', 'required_points', 'duration_days']
    list_filter = ['reward_type', 'campaign']
    search_fields = ['name', 'description']


@admin.register(AwardedReward)
class AwardedRewardAdmin(admin.ModelAdmin):
    list_display = ['business', 'reward', 'awarded_at', 'expires_at', 'is_active']
    list_filter = ['is_active', 'awarded_at', 'reward__reward_type']
    search_fields = ['business__business_name', 'reward__name']
    readonly_fields = ['awarded_at']
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('business', 'reward', 'campaign_progress')


@admin.register(FeaturedBusiness)
class FeaturedBusinessAdmin(admin.ModelAdmin):
    list_display = ['business', 'start_date', 'end_date', 'priority', 'is_active_display', 'featured_on_homepage', 'featured_in_directory', 'selected_by']
    list_filter = ['featured_on_homepage', 'featured_in_directory', 'featured_in_category', 'is_paid_feature', 'start_date']
    search_fields = ['business__business_name', 'reason']
    readonly_fields = ['created_at', 'updated_at', 'selected_by']
    
    fieldsets = (
        ('Business Selection', {
            'fields': ('business', 'campaign', 'is_paid_feature')
        }),
        ('Schedule & Priority', {
            'fields': ('start_date', 'end_date', 'priority')
        }),
        ('Display Settings', {
            'fields': ('featured_on_homepage', 'featured_in_directory', 'featured_in_category')
        }),
        ('Admin Notes', {
            'fields': ('reason', 'selected_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not change:  # New featured business
            obj.selected_by = request.user
        super().save_model(request, obj, form, change)
    
    def is_active_display(self, obj):
        """Show if currently active"""
        return obj.is_active()
    is_active_display.boolean = True
    is_active_display.short_description = 'Active Now'
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('business', 'campaign', 'selected_by')
