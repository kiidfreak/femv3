from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from api.models import Business
from api.services.notification_service import notification_service
from django.db.models import Count

class Command(BaseCommand):
    help = 'Send weekly/monthly performance reports to business owners'

    def add_arguments(self, parser):
        parser.add_argument('--frequency', type=str, default='weekly', help='Report frequency (weekly/monthly)')

    def handle(self, *args, **options):
        frequency = options['frequency']
        days = 7 if frequency == 'weekly' else 30
        start_date = timezone.now() - timedelta(days=days)
        
        self.stdout.write(f"Generating {frequency} reports since {start_date}...")
        
        businesses = Business.objects.filter(user__isnull=False)
        count = 0
        
        for business in businesses:
            # Aggregate stats for the period
            views = business.page_views.filter(viewed_at__gte=start_date).count()
            favorites = business.favorited_by.filter(created_at__gte=start_date).count()
            
            # Skip if no activity and not forced? (Maybe always send if they have a profile)
            if views == 0 and favorites == 0:
                continue
                
            stats = {
                'views': views,
                'favorites': favorites,
                'trust_score': business.trust_score, # Assuming this is a property or field
                'period': frequency
            }
            
            # Send notification
            notification_service.send_notification(
                user=business.user,
                notification_type='weekly_performance',
                title=f"Your {frequency.capitalize()} Performance Report",
                message=f"📊 Your business '{business.business_name}' had {views} views and {favorites} new favorites this {frequency}.",
                link='/dashboard',
                sms_enabled=True,
                email_enabled=True,
                email_data={
                    'subject': f"📊 {business.business_name} - {frequency.capitalize()} Report",
                    'html_content': f"""
                        <h2>Your {frequency.capitalize()} Performance Report</h2>
                        <p>Hello {business.user.first_name},</p>
                        <p>Here's how <strong>{business.business_name}</strong> performed from {start_date.date()} to {timezone.now().date()}:</p>
                        <ul>
                            <li><strong>Profile Views:</strong> {views}</li>
                            <li><strong>New Favorites:</strong> {favorites}</li>
                            <li><strong>Current Trust Score:</strong> {business.trust_score}/100</li>
                        </ul>
                        <p>Keep improving your profile to reach more community members!</p>
                        <a href="https://faithconnect.co.ke/dashboard">View Detailed Analytics</a>
                    """
                }
            )
            count += 1
            
        self.stdout.write(self.style.SUCCESS(f"Successfully sent {count} {frequency} reports."))
