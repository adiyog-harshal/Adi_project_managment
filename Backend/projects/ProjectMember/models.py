from django.db import models
from django.contrib.auth.models import User


class ProjectMember(models.Model):

    project = models.ForeignKey(
        "projects.Project",
        on_delete=models.CASCADE,
        related_name="project_members"
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="project_memberships"
    )

    is_team_leader = models.BooleanField(default=False)
    is_project_manager = models.BooleanField(default=False)

    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta: 
        constraints = [
            models.UniqueConstraint(
                fields=["user", "project"],
                name="unique_user_per_project"
            )
        ]
        
    def __str__(self):
        return f"{self.project} - {self.user.username}"