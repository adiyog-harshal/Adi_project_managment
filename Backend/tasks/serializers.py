from rest_framework import serializers
from .models import Task, TaskComment
from .models import TimeLog


class TaskSerializer(serializers.ModelSerializer):

    class Meta:
        model = Task
        fields = [
            'id',
            'task_name',
            'description',
            'project',
            'milestone',
            'assigned_to',
            'priority',
            'status',
            'sprint',
            # Planned schedule
            'start_date',
            'due_date',

            #Actual schedule
            'actual_start_date',
            'actual_end_date',

            # Manually entered actual time
            'actual_time_minutes',
            'estimated_time_minutes',
        ]

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

class TimeLogSerializer(serializers.ModelSerializer):
    hours = serializers.IntegerField(
        write_only=True, required=False, min_value=0, default=0
    )
    minutes = serializers.IntegerField(
        write_only=True, required=False, min_value=0, default=0
    )

    username = serializers.CharField(
        source="user.username", read_only=True
    )
    task_name = serializers.CharField(
        source="task.task_name", read_only=True
    )
    sprint_name = serializers.CharField(
        source="sprint.sprint_name", read_only=True, default=None
    )

    class Meta:
        model = TimeLog
        fields = [
            "id",
            "task",
            "task_name",
            "user",
            "username",
            "sprint",
            "sprint_name",
            "hours",
            "minutes",
            "duration_minutes",
            "work_date",
            "description",
            "created_at",
        ]
        read_only_fields = [
            "user",
            "sprint",
            "duration_minutes",
            "created_at",
        ]

    def validate(self, attrs):
        hours = attrs.pop("hours", 0)
        minutes = attrs.pop("minutes", 0)

        if minutes > 59:
            raise serializers.ValidationError({
                "minutes": "Minutes must be between 0 and 59."
            })

        duration = (hours * 60) + minutes

        if duration <= 0:
            raise serializers.ValidationError(
                "Log at least one minute of work."
            )

        attrs["duration_minutes"] = duration
        return attrs

    def create(self, validated_data):
        task = validated_data["task"]

        # Save the sprint as it exists at the time of logging.
        validated_data["sprint"] = task.sprint

        return super().create(validated_data)