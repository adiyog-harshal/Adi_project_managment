from rest_framework import serializers

from .models import ProjectMember


class ProjectMemberSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    class Meta:
        model = ProjectMember

        fields = [
            "id",
            "project",
            "user",
            "username",
            "joined_at",
        ]

        read_only_fields = [
            "id",
            "username",
            "joined_at",
        ]