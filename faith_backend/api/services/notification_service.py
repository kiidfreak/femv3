"""
Unified Notification Service
Sends notifications via multiple channels: In-app, SMS (Ndovubase), Email (Brevo)
"""
import logging
from api.notification_models import Notification, NotificationPreference
from api.services.sms_service import ndovubase_service
from api.services.email_service import brevo_service

logger = logging.getLogger(__name__)

class NotificationService:
    """Unified service to send notifications across all channels"""
    
    def send_notification(self, user, notification_type, title, message, link=None, business=None, review=None, 
                         sms_enabled=False, email_enabled=False, sms_message=None, email_data=None):
        """
        Send notification across all relevant channels
        Args:
            user: User object
            notification_type: Type of notification (matches Notification.NOTIFICATION_TYPES)
            title: Notification title
            message: Notification message
            link: Optional URL to navigate when clicked
            business: Optional related business
            review: Optional related review
            sms_enabled: Whether to send SMS (checks user preferences)
            email_enabled: Whether to send email (checks user preferences)
            sms_message: Custom SMS message (if different from notification message)
            email_data: Dict with email-specific data (subject, html_content)
        """
        # 1. Always create in-app notification for bell icon dropdown
        Notification.objects.create(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message,
            link=link,
            business=business,
            review=review
        )
        logger.info(f"Created in-app notification for {user.phone}: {title}")
        
        # 2. Get user preferences (create if doesn't exist)
        prefs, created = NotificationPreference.objects.get_or_create(user=user)
        
        # 3. Send SMS if enabled and user has opted in
        if sms_enabled and self._should_send_sms(prefs, notification_type):
            sms_text = sms_message or message
            ndovubase_service.send_sms(user.phone, sms_text)
            logger.info(f"SMS sent to {user.phone}")
        
        # 4. Send Email if enabled and user has opted in and has email
        if email_enabled and user.email and self._should_send_email(prefs, notification_type):
            if email_data:
                brevo_service.send_email(
                    to_email=user.email,
                    to_name=f"{user.first_name or ''} {user.last_name or ''}".strip() or user.phone,
                    subject=email_data.get('subject', title),
                    html_content=email_data.get('html_content', message)
                )
                logger.info(f"Email sent to {user.email}")
    
    def _should_send_sms(self, prefs, notification_type):
        """Check if SMS should be sent based on user preferences"""
        sms_field_map = {
            'new_review': 'sms_new_review',
            'business_verified': 'sms_business_verified',
            'business_featured': 'sms_business_featured',
            'low_trust_score': 'sms_low_trust_score',
            'weekly_performance': 'sms_weekly_performance',
            'new_business': 'sms_new_businesses',
            'featured_weekly': 'sms_featured_weekly',
            'special_offer': 'sms_special_offers',
            'church_announcement': 'sms_church_announcements',
        }
        field_name = sms_field_map.get(notification_type)
        return getattr(prefs, field_name, False) if field_name else False
    
    def _should_send_email(self, prefs, notification_type):
        """Check if email should be sent based on user preferences"""
        email_field_map = {
            'new_review': 'email_new_review',
            'business_verified': 'email_business_verified',
            'business_featured': 'email_business_featured',
            'low_trust_score': 'email_low_trust_score',
            'weekly_performance': 'email_weekly_performance',
            'new_business': 'email_new_businesses',
            'featured_weekly': 'email_featured_weekly',
            'special_offer': 'email_special_offers',
            'church_announcement': 'email_church_announcements',
        }
        field_name = email_field_map.get(notification_type)
        return getattr(prefs, field_name, False) if field_name else False
    
    # Convenience methods for specific notification types
    
    def notify_new_review(self, business_owner, business, review):
        """Notify business owner about new review"""
        self.send_notification(
            user=business_owner,
            notification_type='new_review',
            title=f"New {review.rating}⭐ Review",
            message=f"Your business '{business.business_name}' received a new review",
            link=f"/business/{business.id}",
            business=business,
            review=review,
            sms_enabled=True,
            email_enabled=True,
            sms_message=f"New {review.rating}⭐ review on {business.business_name}! Check dashboard: faithconnect.co.ke/dashboard",
            email_data={
                'subject': f"New {review.rating}⭐ Review on {business.business_name}",
                'html_content': self._get_review_email_html(business_owner, business, review)
            }
        )
    
    def notify_business_verified(self, business_owner, business):
        """Notify when business gets verified"""
        self.send_notification(
            user=business_owner,
            notification_type='business_verified',
            title="Business Verified!",
            message=f"{business.business_name} is now verified by our church community",
            link=f"/business/{business.id}",
            business=business,
            sms_enabled=True,
            email_enabled=True,
            sms_message=f"🎉 Congratulations! {business.business_name} is now VERIFIED!",
            email_data={
                'subject': f"🎉 {business.business_name} is Now Verified!",
                'html_content': self._get_verification_email_html(business_owner, business)
            }
        )
    
    def notify_business_featured(self, business_owner, business):
        """Notify when business is featured"""
        self.send_notification(
            user=business_owner,
            notification_type='business_featured',
            title="Business Featured!",
            message=f"{business.business_name} is now featured on Faith Connect",
            link=f"/business/{business.id}",
            business=business,
            sms_enabled=True,
            email_enabled=True,
            sms_message=f"✨ {business.business_name} is now FEATURED! Expect more visibility.",
            email_data={
                'subject': f"✨ {business.business_name} is Now Featured!",
                'html_content': f"<p>Your business is now featured and will get priority visibility!</p>"
            }
        )
    
    def notify_action_completed(self, business_owner, business, action, points_earned):
        """Notify business owner when a campaign action is completed"""
        self.send_notification(
            user=business_owner,
            notification_type='campaign_update',
            title="Action Completed! 🎉",
            message=f"You earned +{points_earned} points for: {action.action_name}",
            link="/dashboard",
            business=business,
            sms_enabled=True,
            email_enabled=True,
            sms_message=f"🎉 Nice! You earned {points_earned} points for '{action.action_name}' on Faith Connect!",
            email_data={
                'subject': f"🎉 You earned {points_earned} points!",
                'html_content': f"<h2>Congratulations!</h2><p>You completed: <strong>{action.action_name}</strong></p><p>Points earned: <strong>+{points_earned}</strong></p>"
            }
        )

    def notify_reward_earned(self, business_owner, business, reward):
        """Notify when a campaign reward is earned"""
        self.send_notification(
            user=business_owner,
            notification_type='campaign_update',
            title="New Reward Unlocked! 🏆",
            message=f"Congratulations! You've unlocked: {reward.reward_name}",
            link="/dashboard",
            business=business,
            sms_enabled=True,
            email_enabled=True,
            sms_message=f"🏆 Awesome! You unlocked a new reward: {reward.reward_name}! Check it out: faithconnect.co.ke/dashboard",
            email_data={
                'subject': f"🏆 Reward Unlocked: {reward.reward_name}",
                'html_content': f"<h2>Congratulations!</h2><p>You've unlocked: <strong>{reward.reward_name}</strong></p><p>{reward.description}</p>"
            }
        )

    def _get_review_email_html(self, user, business, review):
        """Generate HTML for review notification email"""
        return f"""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>New Review Received!</h2>
            <p>Hello {user.first_name or 'there'},</p>
            <p>Your business <strong>{business.business_name}</strong> just received a new {review.rating}-star review:</p>
            <blockquote style="border-left: 4px solid #F58220; padding-left: 16px; margin: 20px 0;">
                "{review.review_text}"
            </blockquote>
            <a href="https://faithconnect.biz/business/{business.id}" style="background-color: #F58220; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">View Business</a>
        </body>
        </html>
        """
    
    def _get_verification_email_html(self, user, business):
        """Generate HTML for verification email"""
        return f"""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>Congratulations!</h2>
            <p>Hello {user.first_name or 'there'},</p>
            <p><strong>{business.business_name}</strong> has been verified by our church community!</p>
            <ul>
                <li>Higher trust score</li>
                <li>Priority placement</li>
                <li>Verified badge</li>
            </ul>
            <a href="https://faithconnect.biz/business/{business.id}" style="background-color: #F58220; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">View Profile</a>
        </body>
        </html>
        """

# Singleton instance
notification_service = NotificationService()
