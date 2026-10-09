from rest_framework import serializers
from .models import Sprint
from projects.models import Project
from milestones.models import Milestone


class SprintSerializer(serializers.ModelSerializer):

    project_name = serializers.CharField(
        source='project.project_name',
        read_only=True
    )

    milestone_name = serializers.CharField(
        source='milestone.milestone_name',
        read_only=True
    )

    task_ids = serializers.PrimaryKeyRelatedField(
        source='tasks',
        many=True,
        read_only=True
    )

    class Meta:
        model = Sprint

        fields = [
            'id',
            'sprint_name',
            'project',
            'project_name',
            'milestone',
            'milestone_name',
            'task_ids',
            'goal',
            'start_date',
            'end_date',
            'status',
            'created_at',
            'updated_at'
        ]

        read_only_fields = [
            'id',
            'project_name',
            'milestone_name',
            'task_ids',
            'created_at',
            'updated_at'
        ]

    def validate_sprint_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Sprint name is required."
            )

        return value

    def validate_goal(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Sprint goal is required."
            )

        return value

    def validate(self, attrs):
        project = attrs.get('project')
        milestone = attrs.get('milestone')
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')

        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({
                'end_date': "End date cannot be earlier than start date."
            })

        if milestone and project:
            if milestone.project_id != project.id:
                raise serializers.ValidationError({
                    'milestone': (
                        "The selected milestone does not belong "
                        "to the specified project."
                    )
                })

        return attrs