from django.shortcuts import render

from django.contrib.auth.models import User

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Project
from .serializers import ProjectSerializer

from .models import ProjectComment
from .serializers import ProjectCommentSerializer

from rest_framework.exceptions import PermissionDenied


# Create your views here.
class ProjectListCreateView(generics.ListCreateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]


class ProjectCommentListCreateView(generics.ListCreateAPIView):

    serializer_class = ProjectCommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        project_id = self.kwargs["project_id"]

        return ProjectComment.objects.filter(
            project_id=project_id
        ).select_related(
            "user",
            "project"
        ).order_by("created_at")

    def perform_create(self, serializer):

        project_id = self.kwargs["project_id"]

        # user = User.objects.get(id=1)

        serializer.save(
            project_id=project_id,
            user=self.request.user
        )


class ProjectCommentDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    queryset = ProjectComment.objects.select_related(
        "user",
        "project"
    )

    serializer_class = ProjectCommentSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):

        comment = self.get_object()

        if comment.user != self.request.user:

            raise PermissionDenied(
                "You can only edit your own comments."
            )

        serializer.save()

    def perform_destroy(self, instance):

        if instance.user != self.request.user:

            raise PermissionDenied(
                "You can only delete your own comments."
            )

        instance.delete()
        




