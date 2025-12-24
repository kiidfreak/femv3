from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
import smtplib

class Command(BaseCommand):
    help = 'Test Email Sending'

    def handle(self, *args, **kwargs):
        self.stdout.write(f"Testing Email with Host: {settings.EMAIL_HOST}, User: {settings.EMAIL_HOST_USER}...")
        try:
            send_mail(
                'Test Subject',
                'Test Body',
                settings.DEFAULT_FROM_EMAIL,
                ['imaina671@gmail.com'], # Hardcoded likely dev email
                fail_silently=False,
            )
            self.stdout.write(self.style.SUCCESS('Successfully sent email via Django send_mail'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Django send_mail failed: {e}'))
