# Repair placeholder migration so Django can load the project migration graph.
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0003_alter_project_id'),
    ]

    operations = []
