from django.contrib import admin
from .models import ProjectComment

# Register your models here.

@admin.register(ProjectComment)
class ProjectCommentAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "project",
        "user",
        "message",
        "created_at"
    )

    search_fields = (
        "message",
        "user__username",
        "project__project_name",
    )

    ordering = ("-created_at",)
