from rest_framework import generics, permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import Task, TaskComment
from .serializers import TaskSerializer, TaskCommentSerializer

from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from sprints.models import Sprint
from .models import TaskSprintHistory

from .models import TimeLog
from .serializers import TimeLogSerializer

from django.utils import timezone
from django.db.models import Sum, Count
from datetime import timedelta
from .models import TaskTimer

from helpers import (
    notify_task_assigned,
    notify_task_reassigned,
)


class TaskListCreateView(generics.ListCreateAPIView):

    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        queryset = Task.objects.select_related(
            'project',
            'sprint',
            'assigned_to'
        ).all().order_by('-created_at')

        project_id = self.request.query_params.get('project')
        sprint_id = self.request.query_params.get('sprint')

        if project_id:
            queryset = queryset.filter(project_id=project_id)

        if sprint_id == 'null':
            queryset = queryset.filter(sprint__isnull=True)
        elif sprint_id:
            queryset = queryset.filter(sprint_id=sprint_id)

        return queryset

        from rest_framework import generics, permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import Task, TaskComment
from .serializers import TaskSerializer, TaskCommentSerializer

from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from sprints.models import Sprint
from .models import TaskSprintHistory

from .models import TimeLog
from .serializers import TimeLogSerializer

from django.utils import timezone
from django.db.models import Sum, Count
from datetime import timedelta
from .models import TaskTimer

from helpers import (
    notify_task_assigned,
    notify_task_reassigned,
)


class TaskListCreateView(generics.ListCreateAPIView):

    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        queryset = Task.objects.select_related(
            'project',
            'sprint',
            'assigned_to'
        ).all().order_by('-created_at')

        project_id = self.request.query_params.get('project')
        sprint_id = self.request.query_params.get('sprint')

        if project_id:
            queryset = queryset.filter(
                project_id=project_id
            )

        if sprint_id:
            queryset = queryset.filter(
                sprint_id=sprint_id
            )

        elif sprint_id == 'null':
            queryset = queryset.filter(
                sprint__isnull=True
            )

        return queryset

    def perform_create(self, serializer):

        # Save the task first
        task = serializer.save()

        # Notify the assigned user
        if task.assigned_to:
            notify_task_assigned(task)


# ==========================================
# TASK DETAIL, UPDATE AND DELETE
# ==========================================

class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        old_task = self.get_object()

        # Get the existing task and its current assignee
        old_assignee = old_task.assigned_to
        old_sprint = old_task.sprint
        old_status = old_task.status

        # Save the updated task
        task = serializer.save()

         # Record sprint movement
        if old_sprint != task.sprint:
            if task.sprint is None:
                reason = "Task moved from sprint to backlog"

            elif old_sprint is None:
                reason = "Task assigned from backlog to sprint"

            else:
                reason = "Task shifted to another sprint"

            TaskSprintHistory.objects.create(
                task=task,
                from_sprint=old_sprint,
                to_sprint=task.sprint,
                status_at_move=old_status,
                moved_by=self.request.user,
                reason=reason
            )
        # Existing assignment notification logic
        new_assignee = task.assigned_to

        if old_assignee != new_assignee and new_assignee is not None:
            notify_task_assigned(task)

        if old_assignee is not None and old_assignee != new_assignee:
            notify_task_reassigned(task, old_assignee)    


# ==========================================
# TASK COMMENTS: LIST AND CREATE
# ==========================================

class TaskCommentListCreateView(generics.ListCreateAPIView):

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


# ==========================================
# TASK COMMENT: DETAIL, UPDATE AND DELETE
# ==========================================

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

# TASK CARRY OVER TO NEXT SPRINT
class TaskCarryOverView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, task_id):
        target_sprint_id = request.data.get("target_sprint_id")
        reason = request.data.get("reason", "")

        if not target_sprint_id:
            return Response(
                {"detail": "Please select a destination sprint."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                task = Task.objects.select_for_update().get(
                    pk=task_id
                )

                target_sprint = Sprint.objects.get(
                    pk=target_sprint_id
                )

                if task.project_id != target_sprint.project_id:
                    return Response(
                        {"detail": "The destination sprint must belong to the same project."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                previous_sprint = task.sprint

                if previous_sprint is None:
                    return Response(
                        {"detail": "This task is already in the backlog."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                if previous_sprint.pk == target_sprint.pk:
                    return Response(
                        {"detail": "The task is already in this sprint."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                if task.status == "Completed":
                    return Response(
                        {"detail": "Completed tasks cannot be carried over."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                TaskSprintHistory.objects.create(
                    task=task,
                    from_sprint=previous_sprint,
                    to_sprint=target_sprint,
                    status_at_move=task.status,
                    moved_by=request.user,
                    reason=reason
                )

                task.sprint = target_sprint
                task.save(update_fields=["sprint"])

            return Response(
                {
                    "detail": "Task carried over successfully.",
                    "task_id": task.pk,
                    "from_sprint": previous_sprint.sprint_name,
                    "to_sprint": target_sprint.sprint_name,
                },
                status=status.HTTP_200_OK
            )

        except Task.DoesNotExist:
            return Response(
                {"detail": "Task not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Sprint.DoesNotExist:
            return Response(
                {"detail": "Destination sprint not found."},
                status=status.HTTP_404_NOT_FOUND
            )

class TimeLogListCreateView(generics.ListCreateAPIView):
    serializer_class = TimeLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = TimeLog.objects.select_related(
            "task", "user", "sprint"
        )

        task_id = self.request.query_params.get("task_id")
        user_id = self.request.query_params.get("user_id")

        # Filter by task when requested
        if task_id:
            queryset = queryset.filter(task_id=task_id)

        # Filter by user when requested
        if user_id:
            queryset = queryset.filter(user_id=user_id)

        # By default, show the logged-in user's own entries
        if not task_id and not user_id:
            queryset = queryset.filter(user=self.request.user)

        return queryset

    def perform_create(self, serializer):
        # Never trust a user ID supplied by the frontend
        serializer.save(user=self.request.user)


class TimeSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        logs = TimeLog.objects.all()

        task_id = request.query_params.get("task_id")
        user_id = request.query_params.get("user_id")
        sprint_id = request.query_params.get("sprint_id")

        if task_id:
            logs = logs.filter(task_id=task_id)

        if user_id:
            logs = logs.filter(user_id=user_id)

        if sprint_id:
            logs = logs.filter(sprint_id=sprint_id)

        # Total time grouped by task
        by_task = list(
            logs.values(
                "task_id",
                "task__task_name"
            ).annotate(
                total_minutes=Sum("duration_minutes"),
                entry_count=Count("id")
            ).order_by("task_id")
        )

        # Total time grouped by user
        by_user = list(
            logs.values(
                "user_id",
                "user__username"
            ).annotate(
                total_minutes=Sum("duration_minutes"),
                entry_count=Count("id")
            ).order_by("user_id")
        )

        total_minutes = logs.aggregate(
            total=Sum("duration_minutes")
        )["total"] or 0

        return Response({
            "total_minutes": total_minutes,
            "total_hours": round(total_minutes / 60, 2),
            "by_task": by_task,
            "by_user": by_user,
        })




        return queryset

    def perform_create(self, serializer):

        # Save the task first
        task = serializer.save()

        # Notify the assigned user
        if task.assigned_to:
            notify_task_assigned(task)


# ==========================================
# TASK DETAIL, UPDATE AND DELETE
# ==========================================

class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):

        # Get the existing task and its current assignee
        old_assignee = self.get_object().assigned_to

        # Save the updated task
        task = serializer.save()

        if task.assigned_to:
            notify_task_assigned(task)

        # Get the updated assignee
        new_assignee = task.assigned_to

        # First-time assignment
        if old_assignee is None and new_assignee is not None:
            notify_task_assigned(task)

        # Notify when assigned to a different user
        elif (
            old_assignee is not None
            and new_assignee is not None
            and old_assignee != new_assignee
        ):
            notify_task_reassigned(
                task,
                old_assignee,
            )


# ==========================================
# TASK COMMENTS: LIST AND CREATE
# ==========================================

class TaskCommentListCreateView(generics.ListCreateAPIView):

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


# ==========================================
# TASK COMMENT: DETAIL, UPDATE AND DELETE
# ==========================================

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

# TASK CARRY OVER TO NEXT SPRINT
class TaskCarryOverView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, task_id):
        target_sprint_id = request.data.get("target_sprint_id")
        reason = request.data.get("reason", "")

        if not target_sprint_id:
            return Response(
                {"detail": "Please select a destination sprint."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                task = Task.objects.select_for_update().get(
                    pk=task_id
                )

                target_sprint = Sprint.objects.get(
                    pk=target_sprint_id
                )

                if task.project_id != target_sprint.project_id:
                    return Response(
                        {"detail": "The destination sprint must belong to the same project."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                previous_sprint = task.sprint

                if previous_sprint is None:
                    return Response(
                        {"detail": "This task is already in the backlog."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                if previous_sprint.pk == target_sprint.pk:
                    return Response(
                        {"detail": "The task is already in this sprint."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                if task.status == "Completed":
                    return Response(
                        {"detail": "Completed tasks cannot be carried over."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                TaskSprintHistory.objects.create(
                    task=task,
                    from_sprint=previous_sprint,
                    to_sprint=target_sprint,
                    status_at_move=task.status,
                    moved_by=request.user,
                    reason=reason
                )

                task.sprint = target_sprint
                task.save(update_fields=["sprint"])

            return Response(
                {
                    "detail": "Task carried over successfully.",
                    "task_id": task.pk,
                    "from_sprint": previous_sprint.sprint_name,
                    "to_sprint": target_sprint.sprint_name,
                },
                status=status.HTTP_200_OK
            )

        except Task.DoesNotExist:
            return Response(
                {"detail": "Task not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Sprint.DoesNotExist:
            return Response(
                {"detail": "Destination sprint not found."},
                status=status.HTTP_404_NOT_FOUND
            )

class TimeLogListCreateView(generics.ListCreateAPIView):
    serializer_class = TimeLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = TimeLog.objects.select_related(
            "task", "user", "sprint"
        )

        task_id = self.request.query_params.get("task_id")
        user_id = self.request.query_params.get("user_id")

        # Filter by task when requested
        if task_id:
            queryset = queryset.filter(task_id=task_id)

        # Filter by user when requested
        if user_id:
            queryset = queryset.filter(user_id=user_id)

        # By default, show the logged-in user's own entries
        if not task_id and not user_id:
            queryset = queryset.filter(user=self.request.user)

        return queryset

    def perform_create(self, serializer):
        # Never trust a user ID supplied by the frontend
        serializer.save(user=self.request.user)


class TimeSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        logs = TimeLog.objects.all()

        task_id = request.query_params.get("task_id")
        user_id = request.query_params.get("user_id")
        sprint_id = request.query_params.get("sprint_id")

        if task_id:
            logs = logs.filter(task_id=task_id)

        if user_id:
            logs = logs.filter(user_id=user_id)

        if sprint_id:
            logs = logs.filter(sprint_id=sprint_id)

        # Total time grouped by task
        by_task = list(
            logs.values(
                "task_id",
                "task__task_name"
            ).annotate(
                total_minutes=Sum("duration_minutes"),
                entry_count=Count("id")
            ).order_by("task_id")
        )

        # Total time grouped by user
        by_user = list(
            logs.values(
                "user_id",
                "user__username"
            ).annotate(
                total_minutes=Sum("duration_minutes"),
                entry_count=Count("id")
            ).order_by("user_id")
        )

        total_minutes = logs.aggregate(
            total=Sum("duration_minutes")
        )["total"] or 0

        return Response({
            "total_minutes": total_minutes,
            "total_hours": round(total_minutes / 60, 2),
            "by_task": by_task,
            "by_user": by_user,
        })
# ==========================================
# AUTOMATIC TASK TIMER
# ==========================================

class TaskTimerStartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        task_id = request.data.get("task_id")

        if not task_id:
            return Response(
                {"detail": "task_id is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            task = Task.objects.get(pk=task_id)
        except Task.DoesNotExist:
            return Response(
                {"detail": "Task not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Prevent this user from running multiple timers simultaneously
        running_timer = TaskTimer.objects.filter(
            user=request.user,
            is_running=True
        ).first()

        if running_timer:
            return Response(
                {"detail": "Stop your current timer before starting another."},
                status=status.HTTP_400_BAD_REQUEST
            )

        timer = TaskTimer.objects.create(
            task=task,
            user=request.user
        )

        return Response(
            {
                "id": timer.id,
                "task_id": timer.task_id,
                "started_at": timer.started_at,
                "is_running": timer.is_running,
            },
            status=status.HTTP_201_CREATED
        )


class TaskTimerStopView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        timer = TaskTimer.objects.filter(
            user=request.user,
            is_running=True
        ).select_related("task").first()

        if not timer:
            return Response(
                {"detail": "No active timer found."},
                status=status.HTTP_400_BAD_REQUEST
            )

        now = timezone.now()
        elapsed_seconds = max(
            0,
            int((now - timer.started_at).total_seconds())
        )
        elapsed_minutes = max(1, round(elapsed_seconds / 60))

        # Save elapsed time in the existing TimeLog table
        TimeLog.objects.create(
            task=timer.task,
            user=request.user,
            sprint=timer.task.sprint,
            duration_minutes=elapsed_minutes,
            work_date=timezone.localdate(),
            description="Time tracked using task timer."
        )

        timer.is_running = False
        timer.save(update_fields=["is_running"])

        return Response(
            {
                "detail": "Timer stopped successfully.",
                "task_id": timer.task_id,
                "duration_minutes": elapsed_minutes,
                "is_running": False,
            },
            status=status.HTTP_200_OK
        )


class ActiveTaskTimerView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        timer = TaskTimer.objects.filter(
            user=request.user,
            is_running=True
        ).select_related("task").first()

        if not timer:
            return Response(
                {"active": False},
                status=status.HTTP_200_OK
            )

        elapsed_seconds = max(
            0,
            int((timezone.now() - timer.started_at).total_seconds())
        )

        return Response(
            {
                "active": True,
                "id": timer.id,
                "task_id": timer.task_id,
                "task_name": timer.task.task_name,
                "started_at": timer.started_at,
                "elapsed_seconds": elapsed_seconds,
                "elapsed_minutes": elapsed_seconds // 60,
                "is_running": timer.is_running,
            },
            status=status.HTTP_200_OK
        )