from django.db import models
from django.contrib.auth.models import User
from designations.models import Designation

# Create your models here.
class UserProfile(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    designation = models.ForeignKey(
        Designation,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users"
    )

    def __str__(self):
        return self.user.username