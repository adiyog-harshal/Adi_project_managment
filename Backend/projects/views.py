from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from history.services import log_activity

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

from projects.ProjectMember.models import ProjectMember
from projects.ProjectMember.serializers import ProjectMemberSerializer

from django.shortcuts import render, get_object_or_404

from django.db import models
def get_project_values(project):
    return {
        "project_name": project.project_name,
        "description": project.description,
        "start_date": str(project.start_date) if project.start_date else None,
        "end_date": str(project.end_date) if project.end_date else None,
        "status": project.status,
        "project_manager": project.project_manager_id,
    }

class ProjectListCreateView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Superusers can see all projects
        if user.is_superuser:
            return Project.objects.all()

        # Employees see projects they are members of.
        # Project managers see projects they manage or are assigned to.
        return Project.objects.filter(
            models.Q(project_members__user=user) |
            models.Q(project_manager=user),
            models.Q(
                project_members__user=user,
                project_members__is_project_manager=True
            )
        ).distinct()

    def perform_create(self, serializer):
        project = serializer.save()

        log_activity(
            user=self.request.user,
            module="Projects",
            action="Created",
            object_id=project.id,
            object_name=project.project_name,
            description=f"Project '{project.project_name}' was created.",
            new_values=get_project_values(project),
        )

class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser:
            return Project.objects.all()

        return Project.objects.filter(
            models.Q(project_members__user=user) |
            models.Q(project_manager=user),
            models.Q(
                project_members__user=user,
                project_members__is_project_manager=True
            )
        ).distinct()

    def perform_update(self, serializer):
        project = self.get_object()

        old_values = get_project_values(project)

        project = serializer.save()

        new_values = get_project_values(project)

        changed_fields = [
            field
            for field in old_values
            if old_values[field] != new_values[field]
        ]

        if changed_fields:
            changed_old_values = {
                field: old_values[field]
                for field in changed_fields
            }

            changed_new_values = {
                field: new_values[field]
                for field in changed_fields
            }

            log_activity(
                user=self.request.user,
                module="Projects",
                action="Updated",
                object_id=project.id,
                object_name=project.project_name,
                description=(
                    f"Project '{project.project_name}' was updated. "
                    f"Changed fields: {', '.join(changed_fields)}."
                ),
                old_values=changed_old_values,
                new_values=changed_new_values,
            )

    def perform_destroy(self, instance):
        old_values = get_project_values(instance)

        log_activity(
            user=self.request.user,
            module="Projects",
            action="Deleted",
            object_id=instance.id,
            object_name=instance.project_name,
            description=f"Project '{instance.project_name}' was deleted.",
            old_values=old_values,
        )

        instance.delete()

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

class ProjectMemberRoleUpdateView(APIView):
    permission_classes = [IsAuthenticated]
