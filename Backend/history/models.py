from django.db import models

# Create your models here.

from django.db import models
from django.contrib.auth.models import User


class ActivityLog(models.Model):

    MODULE_CHOICES = [
        ('Projects', 'Projects'),
        ('Tasks', 'Tasks'),
        ('Clients', 'Clients'),
        ('Sprints', 'Sprints'),
        ('Milestones', 'Milestones'),
        ('Users', 'Users'),
        ('Comments', 'Comments'),
        ('Designations', 'Designations'),
        ('Roles', 'Roles'),
    ]

    ACTION_CHOICES = [
        ('Created', 'Created'),
        ('Updated', 'Updated'),
        ('Deleted', 'Deleted'),
        ('Assigned', 'Assigned'),
        ('Unassigned', 'Unassigned'),
        ('Completed', 'Completed'),
        ('Started', 'Started'),
        ('Status Changed', 'Status Changed'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='activity_logs'
    )

    module = models.CharField(
        max_length=50,
        choices=MODULE_CHOICES
    )

    action = models.CharField(
        max_length=50,
        choices=ACTION_CHOICES
    )

    object_id = models.CharField(
        max_length=100,
        blank=True,
        default=""
    )

    object_name = models.CharField(
        max_length=255,
        blank=True,
        default=""
    )

    description = models.TextField()

    old_values = models.JSONField(
        default=dict,
        blank=True
    )

    new_values = models.JSONField(
        default=dict,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Activity Log'
        verbose_name_plural = 'Activity Logs'
        indexes = [
            models.Index(fields=['module', 'created_at']),
            models.Index(fields=['user', 'created_at']),
        ]

    def __str__(self):
        username = self.user.username if self.user else "Deleted User"
        return f"{username} - {self.action} - {self.module}"
