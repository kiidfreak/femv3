from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_fix_featured_default'),
    ]

    operations = [
        # Fix business_type
        migrations.RunSQL(
            "ALTER TABLE business_business ALTER COLUMN business_type DROP NOT NULL;",
            reverse_sql="ALTER TABLE business_business ALTER COLUMN business_type SET NOT NULL;"
        ),
        # Fix subcategory
        migrations.RunSQL(
            "ALTER TABLE business_business ALTER COLUMN subcategory DROP NOT NULL;",
            reverse_sql="ALTER TABLE business_business ALTER COLUMN subcategory SET NOT NULL;"
        ),
        # Fix postal/location fields
        migrations.RunSQL(
            "ALTER TABLE business_business ALTER COLUMN zip_code DROP NOT NULL;",
            reverse_sql="ALTER TABLE business_business ALTER COLUMN zip_code SET NOT NULL;"
        ),
        migrations.RunSQL(
            "ALTER TABLE business_business ALTER COLUMN latitude DROP NOT NULL;",
            reverse_sql="ALTER TABLE business_business ALTER COLUMN latitude SET NOT NULL;"
        ),
        migrations.RunSQL(
            "ALTER TABLE business_business ALTER COLUMN longitude DROP NOT NULL;",
            reverse_sql="ALTER TABLE business_business ALTER COLUMN longitude SET NOT NULL;"
        ),
        # Fix social urls
        migrations.RunSQL(
            "ALTER TABLE business_business ALTER COLUMN twitter_url DROP NOT NULL;",
            reverse_sql="ALTER TABLE business_business ALTER COLUMN twitter_url SET NOT NULL;"
        ),
        migrations.RunSQL(
            "ALTER TABLE business_business ALTER COLUMN linkedin_url DROP NOT NULL;",
            reverse_sql="ALTER TABLE business_business ALTER COLUMN linkedin_url SET NOT NULL;"
        ),
        migrations.RunSQL(
            "ALTER TABLE business_business ALTER COLUMN youtube_url DROP NOT NULL;",
            reverse_sql="ALTER TABLE business_business ALTER COLUMN youtube_url SET NOT NULL;"
        ),
    ]
