from rest_framework import serializers
from .models import ProjectMember


class ProjectMemberSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    project_name = serializers.CharField(
        source="project.project_name",
        read_only=True
    )

    class Meta:
        model = ProjectMember
        fields = [
            "id",
            "project",
            "project_name",
            "user",
            "username",
            "joined_at",
            "is_team_leader",
            "is_project_manager",
        ]

        read_only_fields = [
            "id",
            "project_name",
            "username",
            "joined_at",
        ]

    def validate(self, attrs):
        user = attrs.get(
            "user",
            self.instance.user if self.instance else None
        )

        project = attrs.get(
            "project",
            self.instance.project if self.instance else None
        )

        if not user or not project:
            return attrs

        # Prevent duplicate assignment to the same project.
        existing = ProjectMember.objects.filter(
            user=user,
            project=project
        )

        if self.instance:
            existing = existing.exclude(pk=self.instance.pk)

        if existing.exists():
            raise serializers.ValidationError({
                "user": "This user is already assigned to this project."
            })

        # Allow a maximum of 2 distinct projects per user.
        assigned_projects = ProjectMember.objects.filter(
            user=user
        ).exclude(
            project=project
        ).values("project_id").distinct().count()

        if assigned_projects >= 2:
            raise serializers.ValidationError({
                "user": "This user is already assigned to 2 projects. A maximum of 2 projects is allowed."
            })

        return attrs
