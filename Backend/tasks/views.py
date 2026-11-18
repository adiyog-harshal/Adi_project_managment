from history.services import log_activity
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

    def perform_create(self, serializer):

        task = serializer.save()

        log_activity(
            user=self.request.user,
            module="Tasks",
            action="Created",
            object_id=task.id,
            object_name=task.task_name,
            description=f"Task '{task.task_name}' was created.",
            new_values={
                "task_name": task.task_name,
                "status": task.status,
                "priority": task.priority,
                "project_id": task.project_id,
                "sprint_id": task.sprint_id,
                "assigned_to_id": task.assigned_to_id,
            }
        )

        if task.assigned_to:
            notify_task_assigned(task)

            log_activity(
                user=self.request.user,
                module="Tasks",
                action="Assigned",
                object_id=task.id,
                object_name=task.task_name,
                description=(
                    f"Task '{task.task_name}' was assigned to "
                    f"{task.assigned_to.username}."
                ),
                new_values={
                    "assigned_to_id": task.assigned_to_id,
                    "assigned_to": task.assigned_to.username,
                }
            )


# ==========================================
# TASK DETAIL, UPDATE AND DELETE
# ==========================================

class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):

        old_task = self.get_object()

        old_assignee = old_task.assigned_to
        old_sprint = old_task.sprint
        old_status = old_task.status

        old_values = {
            "task_name": old_task.task_name,
            "description": old_task.description,
            "status": old_task.status,
            "priority": old_task.priority,
            "project_id": old_task.project_id,
            "milestone_id": old_task.milestone_id,
            "sprint_id": old_task.sprint_id,
            "assigned_to_id": old_task.assigned_to_id,
            "start_date": (
                old_task.start_date.isoformat()
                if old_task.start_date else None
            ),
            "due_date": (
                old_task.due_date.isoformat()
                if old_task.due_date else None
            ),
        }

        task = serializer.save()

        # Preserve existing sprint movement history.
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

        new_assignee = task.assigned_to

        new_values = {
            "task_name": task.task_name,
            "description": task.description,
            "status": task.status,
            "priority": task.priority,
            "project_id": task.project_id,
            "milestone_id": task.milestone_id,
            "sprint_id": task.sprint_id,
            "assigned_to_id": task.assigned_to_id,
            "start_date": (
                task.start_date.isoformat()
                if task.start_date else None
            ),
            "due_date": (
                task.due_date.isoformat()
                if task.due_date else None
            ),
        }

        if old_values != new_values:
            log_activity(
                user=self.request.user,
                module="Tasks",
                action="Updated",
                object_id=task.id,
                object_name=task.task_name,
                description=f"Task '{task.task_name}' was updated.",
                old_values=old_values,
                new_values=new_values
            )

        # Log status changes separately.
        if old_status != task.status:

            action = (
                "Completed"
                if task.status == "Completed"
                else "Status Changed"
            )

            log_activity(
                user=self.request.user,
                module="Tasks",
                action=action,
                object_id=task.id,
                object_name=task.task_name,
                description=(
                    f"Task '{task.task_name}' status changed "
                    f"from '{old_status}' to '{task.status}'."
                ),
                old_values={"status": old_status},
                new_values={"status": task.status}
            )

        # Preserve existing assignment notifications and log changes.
        if old_assignee != new_assignee:

            if new_assignee is not None:
                notify_task_assigned(task)

                log_activity(
                    user=self.request.user,
                    module="Tasks",
                    action="Assigned",
                    object_id=task.id,
                    object_name=task.task_name,
                    description=(
                        f"Task '{task.task_name}' was assigned to "
                        f"{new_assignee.username}."
                    ),
                    old_values={
                        "assigned_to": (
                            old_assignee.username
                            if old_assignee else None
                        )
                    },
                    new_values={
                        "assigned_to": new_assignee.username
                    }
                )

            else:
                log_activity(
                    user=self.request.user,
                    module="Tasks",
                    action="Unassigned",
                    object_id=task.id,
                    object_name=task.task_name,
                    description=(
                        f"Task '{task.task_name}' was unassigned."
                    ),
                    old_values={
                        "assigned_to": old_assignee.username
                    },
                    new_values={"assigned_to": None}
                )

            if old_assignee is not None:
                notify_task_reassigned(task, old_assignee)

    def perform_destroy(self, instance):

        log_activity(
            user=self.request.user,
            module="Tasks",
            action="Deleted",
            object_id=instance.id,
            object_name=instance.task_name,
            description=f"Task '{instance.task_name}' was deleted.",
            old_values={
                "task_name": instance.task_name,
                "status": instance.status,
                "priority": instance.priority,
                "project_id": instance.project_id,
                "sprint_id": instance.sprint_id,
                "assigned_to_id": instance.assigned_to_id,
            }
        )

        instance.delete()

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

        comment = serializer.save(
        task_id=task_id,
        user=self.request.user
    )

        log_activity(
        user=self.request.user,
        module="Comments",
        action="Created",
        object_id=comment.id,
        object_name=f"Comment on {comment.task.task_name}",
        description=(
            f"A comment was added to task "
            f"'{comment.task.task_name}'."
        ),
        new_values={
            "task_id": comment.task_id,
            "message": comment.message,
        }
    )


# ==========================================
# TASK COMMENT: DETAIL, UPDATE AND DELETE
# ==========================================

class TaskCommentDetailView(generics.RetrieveUpdateDestroyAPIView):

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

        old_message = comment.message

        comment = serializer.save()

        log_activity(
            user=self.request.user,
            module="Comments",
            action="Updated",
            object_id=comment.id,
            object_name=f"Comment on {comment.task.task_name}",
            description=(
                f"A comment on task '{comment.task.task_name}' was updated."
            ),
            old_values={
                "message": old_message,
            },
            new_values={
                "message": comment.message,
            }
        )

    def perform_destroy(self, instance):

        if instance.user != self.request.user:
            raise PermissionDenied(
                "You can only delete your own comments."
            )

        log_activity(
            user=self.request.user,
            module="Comments",
            action="Deleted",
            object_id=instance.id,
            object_name=f"Comment on {instance.task.task_name}",
            description=(
                f"A comment on task '{instance.task.task_name}' was deleted."
            ),
            old_values={
                "task_id": instance.task_id,
                "message": instance.message,
            }
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
                log_activity(
                    user=request.user,
                    module="Tasks",
                    action="Updated",
                    object_id=task.id,
                    object_name=task.task_name,
                    description=(
                        f"Task '{task.task_name}' was carried over from "
                        f"sprint '{previous_sprint.sprint_name}' to "
                        f"sprint '{target_sprint.sprint_name}'."
                    ),
                    old_values={
                        "sprint_id": previous_sprint.id,
                        "sprint_name": previous_sprint.sprint_name,
                    },
                     new_values={
                        "sprint_id": target_sprint.id,
                        "sprint_name": target_sprint.sprint_name,
                        "reason": reason,
                    }
)

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
