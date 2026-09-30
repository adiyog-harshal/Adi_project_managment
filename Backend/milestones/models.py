from django.db import models

# Create your models here.
from projects.models import Project

class Milestone(models.Model):
    STATUS_CHOICES = [
        ('Not_Started', 'Not Started'),
        ('In_Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('On_Hold', 'On Hold'),
    ]

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='milestones'
    )
    milestone_name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    start_date = models.DateField(null=True, blank=True)
    due_date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Not_Started'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.milestone_name