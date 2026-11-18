from django.contrib import admin

# Register your models here.

from django.contrib import admin
from .models import ActivityLog


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'user',
        'module',
        'action',
        'object_name',
        'created_at',
    )

    list_filter = (
        'module',
        'action',
        'created_at',
    )

    search_fields = (
        'user__username',
        'object_name',
        'description',
    )

    readonly_fields = (
        'user',
        'module',
        'action',
        'object_id',
        'object_name',
        'description',
        'old_values',
        'new_values',
        'created_at',
    )

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
