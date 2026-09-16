from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import Task, TaskComment
from .serializers import TaskSerializer, TaskCommentSerializer
from helpers import (
    notify_task_assigned,
    notify_task_reassigned,
)


# Create your views here.


class TaskListCreateView(generics.ListCreateAPIView):

    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):

        task = serializer.save()

        if task.assigned_to :
            notify_task_assigned(task)

        


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_update(self,serializer):
        
        #get the assignee before updatintg the task
        old_assignee = self.get_object().assigned_to
        
        #save the updated task
        task = serializer.save()
        
        #get the assignee after updating the task
        new_assignee = task.assigned_to
        
        #first-time assignment
        if old_assignee is None and new_assignee is not None:
            notify_task_assigned(task)

        #reassignment
        elif(
            old_assignee is not None
            and new_assignee is not None
            and old_assignee != new_assignee
        ):
            notify_task_reassignment(
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
                "You can only edit your own comments."
            )

        serializer.save()

    def perform_destroy(self, instance):

        if instance.user != self.request.user:

            raise PermissionDenied(
                "You can only delete your own comments."
            )

        instance.delete()