from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import os

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds a superuser/admin account for the platform'

    def handle(self, *args, **options):
        phone = os.getenv('ADMIN_PHONE', '0700000000')
        password = os.getenv('ADMIN_PASSWORD', 'admin1234')
        partnership = os.getenv('ADMIN_PARTNERSHIP', 'ADMIN001')

        if not User.objects.filter(phone=phone).exists():
            self.stdout.write(f'Creating superuser for {phone}...')
            User.objects.create_superuser(
                phone=phone,
                password=password,
                partnership_number=partnership,
                first_name='System',
                last_name='Admin'
            )
            self.stdout.write(self.style.SUCCESS(f'Successfully created superuser: {phone}'))
        else:
            self.stdout.write(self.style.WARNING(f'Superuser {phone} already exists.'))
