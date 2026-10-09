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
        ]

        read_only_fields = [
            "id",
            "project_name",
            "username",
            "joined_at",
        ]