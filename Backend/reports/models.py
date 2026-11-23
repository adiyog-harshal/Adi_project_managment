from django.db import models
from django.contrib.auth import get_user_model


User = get_user_model()


class Report(models.Model):
    REPORT_TYPES = (
        ('project', 'Project Report'),
        ('task', 'Task Report'),
        ('team', 'Team Report'),
        ('sprint', 'Sprint Report'),
        ('productivity', 'Productivity Report'),
        ('summary', 'Summary Report'),
    )

    name = models.CharField(max_length=100)
    report_type = models.CharField(
        max_length=50,
        choices=REPORT_TYPES,
    )
    descrption = models.TextField(blank=True, null=True)
    filters = models.JSONField(default=dict, blank=True)

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_reports',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

        


