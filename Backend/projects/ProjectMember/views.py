from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import ProjectMember
from .serializers import ProjectMemberSerializer

from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction

class ProjectMemberListCreateView(
    generics.ListCreateAPIView
):

    serializer_class = ProjectMemberSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs["project_id"]

        return ProjectMember.objects.filter(
            project_id=project_id
        ).select_related(
            "user",
            "project"
        )

    def perform_create(self, serializer):
        project_id = self.kwargs["project_id"]

        serializer.save(
            project_id=project_id
        )


class ProjectMemberDetailView(
    generics.RetrieveDestroyAPIView
):

    queryset = ProjectMember.objects.select_related(
        "user",
        "project"
    )

    serializer_class = ProjectMemberSerializer
    permission_classes = [IsAuthenticated]


class ProjectMemberRoleUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def patch(self, request, project_id, pk):
        member = get_object_or_404(
            ProjectMember,
            pk=pk,
            project_id=project_id,
        )

        allowed_fields = {
            "is_team_leader",
            "is_project_manager",
        }

        if len(request.data) != 1:
            return Response(
                {"error": "Send exactly one role field."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        role_field = next(iter(request.data))

        if role_field not in allowed_fields:
            return Response(
                {"error": "Invalid role field."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        value = request.data[role_field]

        if not isinstance(value, bool):
            return Response(
                {"error": "Role value must be true or false."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if value is True:
            # Remove this role from other members belonging to the same project
            ProjectMember.objects.filter(
                project_id=project_id,
                **{role_field: True},
            ).exclude(
                pk=member.pk
            ).update(
                **{role_field: False}
            )   

        setattr(member, role_field, value)
        member.save(update_fields=[role_field])

        return Response(
            ProjectMemberSerializer(member).data,
            status=status.HTTP_200_OK,
        )
