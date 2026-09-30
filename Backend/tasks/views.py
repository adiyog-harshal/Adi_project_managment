from rest_framework import generics

from .models import Task
from .serializers import TaskSerializer

from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import TaskComment
from .serializers import TaskCommentSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import Task, TaskComment
from .serializers import TaskSerializer, TaskCommentSerializer

from helpers import (
    notify_task_assigned,
    notify_task_reassigned,
)


class TaskListCreateView(generics.ListCreateAPIView):

    queryset  = Task.objects.all()

    serializer_class  = TaskSerializer
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):

        task = serializer.save()

        if task.assigned_to:
            notify_task_assigned(task)


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = Task.objects.all()

    serializer_class = TaskSerializer

    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):

        old_assignee = self.get_object().assigned_to

        task = serializer.save()

        new_assignee = task.assigned_to

        if old_assignee is None and new_assignee is not None:
            notify_task_assigned(task)

        elif (
            old_assignee is not None
            and new_assignee is not None
            and old_assignee != new_assignee
        ):
            notify_task_reassigned(
                task,
                old_assignee,
            )


class TaskCommentListCreateView(
    generics.ListCreateAPIView
):

    serializer_class = TaskCommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        task_id = self.kwargs["task_id"]

        return TaskComment.objects.filter(
            task_id=task_id
        ).select_related(
            "user",
            "task"
        ).order_by("created_at")

def perform_create(self, serializer):

    task_id = self.kwargs["task_id"]

    serializer.save(
        task_id=task_id,
        user=self.request.user
    )
    def perform_create(self, serializer):

        task_id = self.kwargs["task_id"]

        serializer.save(
            task_id=task_id,
            user=self.request.user
        )


class TaskCommentDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    queryset = TaskComment.objects.select_related(
        "user",
        "task"
    )

    serializer_class = TaskCommentSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):

        comment = self.get_object()

        if comment.user != self.request.user:

            raise PermissionDenied(
                "you can only edit your own comments."
                "You can only edit your own comments."
            )

        serializer.save()

    def perform_destroy(self, instance):

        if instance.user != self.request.user:

            raise PermissionDenied(
                "You can only delete your own comments."
            )

        instance.delete()


        instance.delete()
