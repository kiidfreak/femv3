from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_add_is_visible_field'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='email_notifications',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='user',
            name='sms_notifications',
            field=models.BooleanField(default=True),
        ),
    ]
