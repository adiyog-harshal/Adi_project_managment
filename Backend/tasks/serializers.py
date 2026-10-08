from rest_framework import serializers
from .models import Task, TaskComment


class TaskSerializer(serializers.ModelSerializer):

    class Meta:
        model = Task
        fields = '__all__'

    def validate(self, attrs):

        project = attrs.get('project')

        # During update, use existing project if project
        # was not included in the request.
        if project is None and self.instance:
            project = self.instance.project

        sprint = attrs.get('sprint')

        # During update, use existing sprint if sprint
        # was not included in the request.
        if 'sprint' not in attrs and self.instance:
            sprint = self.instance.sprint

        if sprint and project:
            if sprint.project_id != project.id:
                raise serializers.ValidationError({
                    'sprint': 'The selected sprint does not belong to the specified project.'
                })

        return attrs


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