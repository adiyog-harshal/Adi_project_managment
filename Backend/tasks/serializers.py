from rest_framework import serializers

from .models import Task,TaskComment

class TaskSerializer(serializers.ModelSerializer):

    class Meta:
        model = Task
        fields = '__all__'


class TaskCommentSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    class Meta:
        model = TaskComment

        fields = [
            "id",
            "task",
            "user",
            "username",
            "message",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "task",
            "user",
            "username",
            "created_at",
            "updated_at",
        ]

    def validate_message(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Comment cannot be empty."
            )

        return value