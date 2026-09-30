from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import (
    Project,
    Notification,
    Resource,
    Attachment,
    ProjectComment,
)

from .serializers import (
    ProjectSerializer,
    NotificationSerializer,
    ResourceSerializer,
    AttachmentSerializer,
    ProjectCommentSerializer,
)

from helpers import mark_notification_as_read


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


class NotificationListView(generics.ListAPIView):

    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Notification.objects.filter(
            recipient=self.request.user
        ).order_by("-created_at")


class NotificationReadView(generics.UpdateAPIView):

    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Notification.objects.filter(
            recipient=self.request.user
        )

    def perform_update(self, serializer):

        notification = serializer.save(
            is_read=True
        )

        mark_notification_as_read(notification)


class ResourceListCreateView(generics.ListCreateAPIView):

    serializer_class = ResourceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        project_id = self.request.query_params.get("project")

        if project_id:
            return Resource.objects.filter(
                project_id=project_id
            ).select_related(
                "project",
                "task"
            )

        return Resource.objects.all().select_related(
            "project",
            "task"
        )


class ResourceDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = Resource.objects.select_related(
        "project",
        "task"
    )

    serializer_class = ResourceSerializer
    permission_classes = [IsAuthenticated]


class AttachmentListCreateView(generics.ListCreateAPIView):

    serializer_class = AttachmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Attachment.objects.select_related(
            "project",
            "task",
            "comment",
            "uploaded_by"
        ).order_by("-created_at")

    def perform_create(self, serializer):

        serializer.save(
            uploaded_by=self.request.user
        )


class AttachmentDetailView(generics.RetrieveDestroyAPIView):

    queryset = Attachment.objects.select_related(
        "project",
        "task",
        "comment",
        "uploaded_by"
    )

    serializer_class = AttachmentSerializer
    permission_classes = [IsAuthenticated]