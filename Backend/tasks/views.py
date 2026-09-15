from rest_framework import generics

from .models import Task
from .serializers import TaskSerializer

from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import TaskComment
from .serializers import TaskCommentSerializer


# Create your views here.


class TaskListCreateView(generics.ListCreateAPIView):

    queryset  = Task.objects.all()

    serializer_class  = TaskSerializer

class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = Task.objects.all()

    serializer_class = TaskSerializer


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
                "you can only edit your own comments."
            )

        serializer.save()

    def perform_destroy(self, instance):

        if instance.user != self.request.user:

            raise PermissionDenied(
                "You can only delete your own comments."
            )

        instance.delete()


