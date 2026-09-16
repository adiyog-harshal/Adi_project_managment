from rest_framework import serializers
from .models import Project, ProjectComment, Notification


class ProjectSerializer(serializers.ModelSerializer):

    class Meta:
        model = Project
        fields = '__all__'


class NotificationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Notification
        fields = [
            'id',
            'recipient',
            'message',
            'is_read',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'recipient',
            'message',
            'created_at',
        ]


class ProjectCommentSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    class Meta:
        model = ProjectComment

        fields = [
            "id",
            "project",
            "user",
            "username",
            "message",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "project",
            "user",
            "username",
            "created_at",
            "updated_at"
        ]

    def validate_message(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Comment cannot be empty."
            )

        return value