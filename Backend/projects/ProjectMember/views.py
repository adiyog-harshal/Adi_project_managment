from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import ProjectMember
from .serializers import ProjectMemberSerializer


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