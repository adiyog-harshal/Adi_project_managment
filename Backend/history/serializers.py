from rest_framework import serializers
from .models import ActivityLog


class ActivityLogSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()

    class Meta:
        model = ActivityLog
        fields = [
            "id",
            "user",
            "username",
            "module",
            "action",
            "object_id",
            "object_name",
            "description",
            "old_values",
            "new_values",
            "created_at",
        ]

    def get_username(self, obj):
        if obj.user:
            return obj.user.username
        return "Deleted User"