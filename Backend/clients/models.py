from django.db import models
from django.core.validators import RegexValidator, EmailValidator

phone_validator = RegexValidator(
    regex=r'^[0-9]{10}$',
    message="Phone number must contain exactly 10 digits."
)
class Client(models.Model):
    client_name = models.CharField(max_length=200)
    project_name = models.CharField(max_length=200, blank=True, default="")

    email = models.EmailField(
        max_length=254,
        blank=True,
        default=""
    )
    phone_number = models.CharField(max_length=10, validators=[phone_validator], blank=True, default="")
    address = models.TextField(blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.client_name