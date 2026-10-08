from django.db import models

# Create your models here.
from projects.models import Project
from milestones.models import Milestone

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
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.sprint_name
    