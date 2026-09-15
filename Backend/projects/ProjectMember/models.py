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

    joined_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.project} - {self.user.username}"