from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

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
from django.db.models import Count, Q

def get_visible_projects(user):
    # Admin / superuser cxan see evrything
    if user.is_superuser:
        return Project.objects.all()

    # Project managers and assigned members
    return Project.objects.filter(
        Q(project_manager=user) |
        Q(project_members__user=user)
    ).distinct()

class ProjectListCreateView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return get_visible_projects(self.request.user)

    def get_queryset(self):
        user = self.request.user

        #Superusers can see all projects
        if user.is_superuser:
            queryset = Project.objects.all()

        # Client can see only thire projects
        elif hasattr(user, "client_account"):
            queryset = Project.objects.filter(
                client__user=user               
            )

        # Employee and project Mangaers
        else:
            queryset = Project.objects.filter(
                models.Q(project_members__user=user) |
                models.Q(project_manager=user)
            ).distinct()
            
        return queryset.annotate(
            total_tasks=Count('tasks', distinct=True),
            completed_tasks=Count(
                'tasks',
                filter=Q(tasks__status='Completed'),
                distinct=True
            )
        )

    def perform_create(self, serializer):
        if hasattr(self.request.user, "client_account"):
            raise PermissionDenied(
                "Clients cannot create projects."
            )
        serializer.save()

class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return get_visible_projects(self.request.user)

    def get_queryset(self):
        user = self.request.user

        # Admin can access all projects
        if user.is_superuser:
           return Project.objects.all()

        # client can access only their own projects
        elif hasattr(user, "client_account"):
           return Project.objects.filter(
               client__user=user
           )
       
        # Employees and project Managers
        return Project.objects.filter(
           models.Q(project_members__user=user) |
           models.Q(project_manager=user)
        ).distinct()

    def perform_update(self, serializer):
        if hasattr(self.request.user, "client__account"):
            raise PermissionDenied(
                "Clients cannot update projects."
            )
        serializer.save()

    def perform_destroy(self, instance):
        if hasattr(self.request.user, "client_account"):
            raise PermissionDenied(
                "Clients cannot delete projects."
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
