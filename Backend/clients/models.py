from django.db import models


class Client(models.Model):
    client_name = models.CharField(max_length=200)
    project_name = models.CharField(max_length=200)
    phone_number = models.CharField(max_length=30, blank=True, default="")
    contract = models.CharField(max_length=225)
    address = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.client_name