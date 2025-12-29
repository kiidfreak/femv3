from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_fix_nullable_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='business',
            name='is_visible',
            field=models.BooleanField(default=True),
        ),
    ]
