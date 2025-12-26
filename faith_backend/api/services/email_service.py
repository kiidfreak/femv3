"""
Brevo Email Service
Sends email notifications to users via Brevo (formerly Sendinblue) API
"""
import requests
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class BrevoEmailService:
    """Handle email sending via Brevo"""
    
    def __init__(self):
        self.api_key = getattr(settings, 'BREVO_API_KEY', None)
        self.sender_email = getattr(settings, 'BREVO_SENDER_EMAIL', 'noreply@faithconnect.co.ke')
        self.sender_name = getattr(settings, 'BREVO_SENDER_NAME', 'Faith Connect')
        self.base_url = 'https://api.brevo.com/v3/smtp/email'
        
    def send_email(self, to_email: str, to_name: str, subject: str, html_content: str) -> bool:
        """
        Send email via Brevo
        Args:
            to_email: Recipient email address
            to_name: Recipient name
            subject: Email subject
            html_content: HTML email body
        Returns:
            bool: True if sent successfully, False otherwise
        """
        if not self.api_key:
            logger.warning("Brevo API key not configured")
            return False
            
        try:
            headers = {
                'api-key': self.api_key,
                'Content-Type': 'application/json'
            }
            
            payload = {
                'sender': {
                    'email': self.sender_email,
                    'name': self.sender_name
                },
                'to': [{
                    'email': to_email,
                    'name': to_name
                }],
                'subject': subject,
                'htmlContent': html_content
            }
            
            response = requests.post(self.base_url, json=payload, headers=headers, timeout=10)
            
            if response.status_code in [200, 201]:
                logger.info(f"Email sent successfully to {to_email}")
                return True
            else:
                logger.error(f"Failed to send email to {to_email}: {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending email via Brevo: {str(e)}")
            return False
    
    def send_new_review_email(self, to_email: str, to_name: str, business_name: str, rating: int, review_text: str):
        """Send email when business receives a new review"""
        subject = f"New {rating}⭐ Review on {business_name}"
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>New Review Received!</h2>
            <p>Hello {to_name},</p>
            <p>Your business <strong>{business_name}</strong> just received a new {rating}-star review:</p>
            <blockquote style="border-left: 4px solid #F58220; padding-left: 16px; margin: 20px 0;">
                "{review_text}"
            </blockquote>
            <p>Keep up the excellent service!</p>
            <a href="https://faithconnect.co.ke/dashboard" style="background-color: #F58220; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">View Dashboard</a>
        </body>
        </html>
        """
        return self.send_email(to_email, to_name, subject, html_content)
    
    def send_verification_email(self, to_email: str, to_name: str, business_name: str):
        """Send email when business gets verified"""
        subject = f"🎉 {business_name} is Now Verified!"
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>Congratulations!</h2>
            <p>Hello {to_name},</p>
            <p>We're excited to inform you that <strong>{business_name}</strong> has been verified by our church community!</p>
            <p>This verification badge will help build trust with potential customers and increase your visibility on Faith Connect.</p>
            <p><strong>Benefits of Verification:</strong></p>
            <ul>
                <li>Higher trust score</li>
                <li>Priority placement in search results</li>
                <li>Verified badge on your profile</li>
            </ul>
            <a href="https://faithconnect.co.ke/dashboard" style="background-color: #F58220; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">View Your Profile</a>
        </body>
        </html>
        """
        return self.send_email(to_email, to_name, subject, html_content)
    
    def send_weekly_performance_email(self, to_email: str, to_name: str, business_name: str, stats: dict):
        """Send weekly performance digest"""
        subject = f"📊 {business_name} - Weekly Performance Report"
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>Your Weekly Performance Report</h2>
            <p>Hello {to_name},</p>
            <p>Here's how <strong>{business_name}</strong> performed this week:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background-color: #f5f5f5;">
                    <td style="padding: 12px; border: 1px solid #ddd;"><strong>Metric</strong></td>
                    <td style="padding: 12px; border: 1px solid #ddd;"><strong>This Week</strong></td>
                </tr>
                <tr>
                    <td style="padding: 12px; border: 1px solid #ddd;">Profile Views</td>
                    <td style="padding: 12px; border: 1px solid #ddd;">{stats.get('views', 0)}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; border: 1px solid #ddd;">New Favorites</td>
                    <td style="padding: 12px; border: 1px solid #ddd;">{stats.get('favorites', 0)}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; border: 1px solid #ddd;">Trust Score</td>
                    <td style="padding: 12px; border: 1px solid #ddd;">{stats.get('trust_score', 0)}/100</td>
                </tr>
            </table>
            <a href="https://faithconnect.co.ke/dashboard" style="background-color: #F58220; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">View Full Analytics</a>
        </body>
        </html>
        """
        return self.send_email(to_email, to_name, subject, html_content)
    
    def send_featured_business_email(self, to_email: str, to_name: str, business_name: str, category: str):
        """Send featured business of the week to community members"""
        subject = f"⭐ Featured Business: {business_name}"
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>Featured Business of the Week</h2>
            <p>Hello {to_name},</p>
            <p>This week's featured business in the <strong>{category}</strong> category is:</p>
            <div style="background-color: #FFF5ED; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #F58220; margin-top: 0;">{business_name}</h3>
                <p>Highly trusted and verified by our church community!</p>
            </div>
            <a href="https://faithconnect.co.ke/directory" style="background-color: #F58220; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">Explore Business</a>
        </body>
        </html>
        """
        return self.send_email(to_email, to_name, subject, html_content)

# Singleton instance
brevo_service = BrevoEmailService()
