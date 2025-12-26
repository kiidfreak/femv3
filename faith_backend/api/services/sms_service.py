"""
Ndovubase SMS Service
Sends SMS notifications to users via Ndovubase API
"""
import requests
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class NdovubaseSMSService:
    """Handle SMS sending via Ndovubase"""
    
    def __init__(self):
        self.api_key = getattr(settings, 'NDOVUBASE_API_KEY', None)
        self.sender_id = getattr(settings, 'NDOVUBASE_SENDER_ID', 'FaithConnect')
        self.base_url = 'https://api.ndovubase.com/v1/sms/send'
        
    def send_sms(self, phone: str, message: str) -> bool:
        """
        Send SMS via Ndovubase
        Args:
            phone: Phone number in format +254XXXXXXXXX
            message: SMS message content
        Returns:
            bool: True if sent successfully, False otherwise
        """
        if not self.api_key:
            logger.warning("Ndovubase API key not configured")
            return False
            
        try:
            payload = {
                'api_key': self.api_key,
                'sender_id': self.sender_id,
                'phone': phone,
                'message': message
            }
            
            response = requests.post(self.base_url, json=payload, timeout=10)
            
            if response.status_code == 200:
                logger.info(f"SMS sent successfully to {phone}")
                return True
            else:
                logger.error(f"Failed to send SMS to {phone}: {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending SMS via Ndovubase: {str(e)}")
            return False
    
    def send_new_review_alert(self, business_owner_phone: str, business_name: str, rating: int):
        """Send SMS when business receives a new review"""
        message = f"New {rating}⭐ review on {business_name}! Check your dashboard: faithconnect.co.ke/dashboard"
        return self.send_sms(business_owner_phone, message)
    
    def send_verification_alert(self, business_owner_phone: str, business_name: str):
        """Send SMS when business gets verified"""
        message = f"🎉 Congratulations! {business_name} is now VERIFIED by our church community. Your trust score has increased!"
        return self.send_sms(business_owner_phone, message)
    
    def send_featured_alert(self, business_owner_phone: str, business_name: str):
        """Send SMS when business is featured"""
        message = f"✨ Great news! {business_name} is now FEATURED on Faith Connect. Expect more visibility!"
        return self.send_sms(business_owner_phone, message)
    
    def send_low_trust_score_alert(self, business_owner_phone: str, business_name: str, score: int):
        """Send SMS when trust score drops"""
        message = f"⚠️ {business_name} trust score dropped to {score}. Review your profile and respond to customer feedback."
        return self.send_sms(business_owner_phone, message)
    
    def send_weekly_performance(self, business_owner_phone: str, business_name: str, views: int, favorites: int):
        """Send weekly performance SMS"""
        message = f"📊 {business_name} Weekly Report: {views} views, {favorites} new favorites. Keep up the good work!"
        return self.send_sms(business_owner_phone, message)
    
    def send_new_business_alert(self, member_phone: str, category: str, business_name: str):
        """Notify member about new business in favorite category"""
        message = f"🆕 New {category} business: {business_name} just joined Faith Connect. Check it out!"
        return self.send_sms(member_phone, message)
    
    def send_featured_business_weekly(self, member_phone: str, business_name: str, category: str):
        """Send featured business of the week"""
        message = f"⭐ Featured Business: {business_name} ({category}) - Highly trusted by our community!"
        return self.send_sms(member_phone, message)
    
    def send_special_offer(self, member_phone: str, business_name: str, offer: str):
        """Send special offer SMS"""
        message = f"🎁 Special Offer from {business_name}: {offer}. Visit faithconnect.co.ke"
        return self.send_sms(member_phone, message)
    
    def send_church_announcement(self, member_phone: str, announcement: str):
        """Send church/community announcement"""
        message = f"📢 Faith Connect: {announcement}"
        return self.send_sms(member_phone, message)

# Singleton instance
ndovubase_service = NdovubaseSMSService()
