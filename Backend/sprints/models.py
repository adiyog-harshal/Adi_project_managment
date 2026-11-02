from django.db import models

# Create your models here.
from projects.models import Project
from milestones.models import Milestone
from django.core.exceptions import ValidationError

class Sprint(models.Model):
    
    STATUS_CHOICES = [
        ('Planned', 'Planned'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]
    sprint_name = models.CharField(max_length=200)
    
    project = models.ForeignKey(
        Project, 
        on_delete=models.CASCADE, 
        related_name='sprints')
    
    milestone = models.ForeignKey(
        Milestone,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sprints'
    )
    goal = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField()

    # Actual date when the sprint really begins
    actual_start_date = models.DateField(
        null=True,
        blank=True
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='planned',
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        if self.status == 'In Progress':
            existing_sprint = Sprint.objects.filter(
                project=self.project,
                status='In Progress'
            ).exclude(pk=self.pk)

            if existing_sprint.exists():
                raise ValidationError({
                    'status': (
                        'Another sprint is already in progress '
                        'for this project. Complete it before'
                        'activating a new sprint.'
                    )
                })
    
    def __str__(self):
        return self.sprint_name
    