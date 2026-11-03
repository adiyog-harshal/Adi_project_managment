from django.db import models


class Role(models.Model):
    role_name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.role_name

class ModulePermission(models.Model):
    MODULE_CHOICES = [
        ("dashboard", "dashboard"),
        ("projects", "projects"),
        ("users", "users"),
        ("designations", "designations"),
        ("backlog", "backlog"),
        ("sprints", "sprints"),
        ("modules", "modules"),
        ("roles", "roles"),
    ]

    role = models.ForeignKey(
        Role,
        on_delete=models.CASCADE,
        related_name="module_permissions",
    )
    module_name = models.CharField(
        max_length=50,
        choices=MODULE_CHOICES,
    )

    can_view = models.BooleanField(default=False)
    can_create = models.BooleanField(default=False)
    can_edit = models.BooleanField(default=False)
    can_delete = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["role", "module_name"],
                name="unique_role_module_permission",
            )
        ]

    def __str__(self):
        return f"{self.role.role_name} - {self.module_name}"