from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Fix postgres sequence for categories'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            cursor.execute("SELECT MAX(id) FROM business_category;")
            max_id = cursor.fetchone()[0] or 0
            
            self.stdout.write(f"Max category ID is: {max_id}")
            
            # Reset sequence to max_id + 1
            cursor.execute(f"SELECT setval('business_category_id_seq', {max_id + 1}, false);")
            
            self.stdout.write(self.style.SUCCESS(f"Sequence reset to start at: {max_id + 1}"))
