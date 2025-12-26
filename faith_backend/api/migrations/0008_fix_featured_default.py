from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_remove_business_business_image_url_and_more'),
    ]

    operations = [
        migrations.RunSQL(
            "ALTER TABLE business_business ALTER COLUMN is_featured SET DEFAULT false;",
            reverse_sql="ALTER TABLE business_business ALTER COLUMN is_featured DROP DEFAULT;"
        ),
        migrations.RunSQL(
            "UPDATE business_business SET is_featured = false WHERE is_featured IS NULL;",
            reverse_sql=""
        ),
    ]
