from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Sprint
from .serializers import SprintSerializer
from tasks.models import Task
from django.utils import timezone
from tasks.models import TaskSprintHistory
from history.services import log_activity

def get_sprint_values(sprint):
    return {
        "sprint_name": sprint.sprint_name,
        "project": sprint.project_id,
        "milestone": sprint.milestone_id,
        "goal": sprint.goal,
        "start_date": str(sprint.start_date) if sprint.start_date else None,
        "end_date": str(sprint.end_date) if sprint.end_date else None,
        "actual_start_date": (
            str(sprint.actual_start_date)
            if sprint.actual_start_date else None
        ),
        "status": sprint.status,
    }
def has_active_sprint(project, exclude_pk=None):
    sprints = Sprint.objects.filter(
        project=project,
        status="In Progress"
    )

    if exclude_pk is not None:
        sprints = sprints.exclude(pk=exclude_pk)

    return sprints.exists()

def has_overlapping_sprint(
        project,
        start_date,
        end_date,
        exclude_pk=None
):
    sprints = Sprint.objects.filter(
        project=project,
        status__in=["Planned", "In Progress"],
        start_date__lte=end_date,
        end_date__gte=start_date
    )

    if exclude_pk is not None:
        sprints = sprints.exclude(pk=exclude_pk)

    return sprints.exists()

class SprintListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sprints = Sprint.objects.select_related(
            'project',
            'milestone'
        ).prefetch_related(
            'tasks'
        ).all().order_by('created_at')

        serializer = SprintSerializer(sprints, many=True)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def post(self, request):
        serializer = SprintSerializer(data=request.data)

        if serializer.is_valid():
            project = serializer.validated_data["project"]
            start_date = serializer.validated_data["start_date"]
            end_date = serializer.validated_data["end_date"]
            sprint_status = serializer.validated_data.get(
                "status", "Planned"
            )

            if start_date > end_date:
                return Response(
                    {"detail": "End date must be after start date."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if has_overlapping_sprint(project, start_date, end_date):
                return Response(
                    {
                        "detail": (
                            "Another sprint already exists during "
                            "these dates in this project."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            if (
                sprint_status == "In Progress"
                and has_active_sprint(project)
            ):
                return Response(
                    {"detail": "Another sprint is already in progress. "},
                    status=status.HTTP_400_BAD_REQUEST
                )

            sprint = serializer.save()
            log_activity(
            user=request.user,
            module="Sprints",
            action="Created",
            object_id=sprint.id,
            object_name=sprint.sprint_name,
            description=f"Sprint '{sprint.sprint_name}' was created.",
            new_values=get_sprint_values(sprint),
        )

            return Response(
                SprintSerializer(sprint).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class SprintDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Sprint.objects.select_related(
                'project',
                'milestone'
            ).get(pk=pk)
        except Sprint.DoesNotExist:
            return None

    def get(self, request, pk):
        sprint = self.get_object(pk)

        if sprint is None:
            return Response(
                {"detail": "Sprint not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = SprintSerializer(sprint)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def put(self, request, pk):
        sprint = self.get_object(pk)

        if sprint is None:
            return Response(
                {"detail": "Sprint not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = SprintSerializer(
            sprint,
            data=request.data
        )

        if serializer.is_valid():
            data = serializer.validated_data
            old_values = get_sprint_values(sprint)

            project = data.get("project", sprint.project)
            start_date = data.get("start_date", sprint.start_date)
            end_date = data.get("end_date", sprint.end_date)
            sprint_status = data.get("status", sprint.status)

            if start_date > end_date:
                return Response(
                    {"detail": "End date must be after start date. "},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if has_overlapping_sprint(
                project,
                start_date,
                end_date,
                exclude_pk=sprint.pk
            ):
                return Response(
                    {
                        "detail": (
                            "Another sprint already exists during"
                            "these dates in this project"
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            if (
                sprint_status == "In Progress"
                and has_active_sprint(
                    project,
                    exclude_pk=sprint.pk
                )
            ):
                return Response(
                    {"detail": "Another sprint is already in progress "},
                    status=status.HTTP_400_BAD_REQUEST
                )

            updated_sprint = serializer.save()
            new_values = get_sprint_values(updated_sprint)

            changed_fields = [
                field for field in old_values
                if old_values[field] != new_values[field]
            ]

            if changed_fields:
                changed_old_values = {
                    field: old_values[field] for field in changed_fields
                }
                changed_new_values = {
                    field: new_values[field] for field in changed_fields
                }

                log_activity(
                    user=request.user,
                    module="Sprints",
                    action="Updated",
                    object_id=updated_sprint.id,
                    object_name=updated_sprint.sprint_name,
                    description=f"Sprint '{updated_sprint.sprint_name}' was updated.",
                    old_values=changed_old_values,
                    new_values=changed_new_values,
                )

            return Response(
                SprintSerializer(updated_sprint).data,
                status=status.HTTP_200_OK
            )

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

    def patch(self, request, pk):
        sprint = self.get_object(pk)

        if sprint is None:
            return Response(
                {"detail": "Sprint not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = SprintSerializer(
            sprint,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            old_values = get_sprint_values(sprint)
            project = serializer.validated_data.get(
                "project", sprint.project
            )

            sprint_status = serializer.validated_data.get(
                "status", sprint.status
            )

            if (
                sprint_status == "In Progress"
                and has_active_sprint(
                    project,
                    exclude_pk=sprint.pk
                )
            ):
                return Response(
                    {
                        "detail": (
                            "Another sprint is already in progress "
                            "for this project."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            updated_sprint = serializer.save()
            new_values = get_sprint_values(updated_sprint)

            changed_fields = [
                field for field in old_values
                if old_values[field] != new_values[field]
            ]

            if changed_fields:
                changed_old_values = {
                    field: old_values[field] for field in changed_fields
                }

                changed_new_values = {
                    field: new_values[field] for field in changed_fields
                }

            log_activity(
                user=request.user,
                module="Sprints",
                action="Updated",
                object_id=updated_sprint.id,
                object_name=updated_sprint.sprint_name,
                description=f"Sprint '{updated_sprint.sprint_name}' was updated.",
                old_values=changed_old_values,
                new_values=changed_new_values,
            )

            return Response(
                SprintSerializer(updated_sprint).data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):
        sprint = self.get_object(pk)

        if sprint is None:
            return Response(
                {"detail": "Sprint not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        old_values = get_sprint_values(sprint)

        log_activity(
            user=request.user,
            module="Sprints",
            action="Deleted",
            object_id=sprint.id,
            object_name=sprint.sprint_name,
            description=f"Sprint '{sprint.sprint_name}' was deleted.",
            old_values=old_values,
        )

        sprint.delete()

        return Response(
            {'message': 'Sprint deleted successfully.'},
            status=status.HTTP_204_NO_CONTENT
        )


class SprintStartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            sprint = Sprint.objects.get(pk=pk)
        except Sprint.DoesNotExist:
            return Response(
                {"detail": "Sprint not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        # STEP 1: Validate start choise
        choice = request.data.get("start_choice")
        today = timezone.localdate()

        if choice not in ["today", "tomorrow"]:
            return Response(
                {"detail": "Select either today or tomorrow."},
                status=status.HTTP_400_BAD_REQUEST
            )
        # STEP 2: Check sprint status
        if sprint.status in ["Completed", "Cancelled"]:
            return Response(
                {"detail": "Completed or cancelled sprints cannot be started."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if sprint.status == "in Progress":
            return Response(
                {"detail": "This sprint is already in progress."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # STEP 3: Get tasks belonging to this sprint
        sprint_tasks = Task.objects.filter(sprint_id=sprint.id)

        if not sprint_tasks.exists():
            return Response(
                {
                    "detail": 
                    "Please add at least one task before starting the sprint."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # STEP 4: Check employee assignment
        unassigned_tasks = sprint_tasks.filter(
            assigned_to__isnull=True
        )

        if unassigned_tasks.exists():
            return Response(
                {
                    "detail":
                    "Assign an employee to every task before starting the sprint.",
                    "unassigned_task_ids": list(
                        unassigned_tasks.values_list("id", flat=True)
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        # STEP 5: Handle tommorow scheduling
        if choice == "tomorrow":

            duration = (
                sprint.end_date - sprint.start_date
            ).days

            tomorrow = today + timezone.timedelta(days=1)

            new_start_date = tomorrow
            new_end_date = tomorrow + timezone.timedelta(days=duration)

            if has_overlapping_sprint(
                sprint.project,
                new_start_date,
                new_end_date,
                exclude_pk=sprint.pk
            ):
                return Response(
                    {
                        "detail": 
                        "Another sprint already exists during these dates."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            old_values = get_sprint_values(sprint)
            sprint.start_date = new_start_date
            sprint.end_date = new_end_date
            sprint.actual_start_date = None
            sprint.status = "Planned"


            sprint.save(

                update_fields=[
                    "start_date",
                    "end_date",
                    "actual_start_date",
                    "status",
                    "updated_at",
                ]
            )
            log_activity(
                user=request.user,
                module="Sprints",
                action="Updated",
                object_id=sprint.id,
                object_name=sprint.sprint_name,
                description=f"Sprint '{sprint.sprint_name}' was scheduled to start tomorrow.",
                old_values=old_values,
                new_values=get_sprint_values(sprint),
)

            return Response(
                {
                    "message": "Sprint scheduled to start tomorrow.",
                    "sprint": SprintSerializer(sprint).data,
                },
                status=status.HTTP_200_OK
            )

        # STEP 6: Check another active sprint
        if has_active_sprint(
            sprint.project,
            exclude_pk=sprint.pk
        ):
            return Response(
                {
                    "detail":
                    "Another sprint is already in progress."
                    "Complete it before starting a new sprint."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # STEP 7: Check sprint end date
        if sprint.end_date < today:
            return Response(
                {
                    "detail":
                    "This sprint's end date has already passed."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # STEP 8: Check overlapping sprint dates
        if has_overlapping_sprint(
            sprint.project,
            today,
            sprint.end_date,
            exclude_pk=sprint.pk
        ):
            return Response(
                {
                    "detail":
                    "Another sprint already exists during these dates. "
                    "Choose different dates."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # STEP 9: Start sprint
        sprint.start_date = today
        sprint.actual_start_date = today
        sprint.status = "In Progress"

        sprint.save(
            update_fields=[
                "start_date",
                "actual_start_date",
                "status",
                "updated_at",
            ]
        )

        return Response(
            {
                "message": "Sprint started successfully.",
                "sprint": SprintSerializer(sprint).data,
            },
            status=status.HTTP_200_OK
        )

        
        # TODAY: Check for another active sprint first.
        if has_active_sprint(
            sprint.project,
            exclude_pk=sprint.pk
        ):
            return Response(
                {
                    "detail": (
                        "Another sprint is already in progress. "
                        "Complete it before starting a new sprint."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if sprint.end_date < today:
            return Response(
                {"detail": "This sprint's end date has already passed."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if has_overlapping_sprint(
            sprint.project,
            today,
            sprint.end_date,
            exclude_pk=sprint.pk
        ):
            return Response(
                {
                    "detail": (
                        "Another sprint already exists during these "
                        "dates in this project. Choose different dates."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        old_values = get_sprint_values(sprint)
        # Start sprint today.
        sprint.start_date = today
        sprint.actual_start_date = today
        sprint.status = "In Progress"

        sprint.save(
            update_fields=[
                "start_date",
                "actual_start_date",
                "status",
                "updated_at",
            ]
        )
        log_activity(
            user=request.user,
            module="Sprints",
            action="Started",
            object_id=sprint.id,
            object_name=sprint.sprint_name,
            description=f"Sprint '{sprint.sprint_name}' was started.",
            old_values=old_values,
            new_values=get_sprint_values(sprint),
        )

        return Response(
            {
                "message": "Sprint started successfully.",
                "sprint": SprintSerializer(sprint).data,
            },
            status=status.HTTP_200_OK
        )


class SprintTaskAssignView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            sprint = Sprint.objects.get(pk=pk)
        except Sprint.DoesNotExist:
            return Response(
                {"detail": "Sprint not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        task_ids = request.data.get('task_ids')

        if not task_ids:
            return Response(
                {"task_ids": "At least one task must be selected."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not isinstance(task_ids, list):
            return Response(
                {"task_ids": "task_ids must be a list."},
                status=status.HTTP_400_BAD_REQUEST
            )

        tasks = Task.objects.filter(id__in=task_ids)

        if tasks.count() != len(set(task_ids)):
            return Response(
                {"task_ids": "One or more selected tasks were not found."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Make sure all tasks belong to the same project as the sprint
        invalid_tasks = tasks.exclude(
            project_id=sprint.project_id
        )

        if invalid_tasks.exists():
            return Response(
                {
                    "task_ids": (
                        "One or more selected tasks do not belong "
                        "to the sprint's project."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Only backlog tasks can be added to a sprint
        already_assigned = tasks.exclude(sprint__isnull=True)

        if already_assigned.exists():
            return Response(
                {
                    "task_ids": (
                        "One or more selected tasks are already "
                        "assigned to a sprint."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        for task in tasks:
            TaskSprintHistory.objects.create(
                task=task,
                from_sprint=None,
                to_sprint=sprint,
                status_at_move=task.status,
                moved_by=request.user,
                reason="Task assigned from backlog to sprint"
            )

            task.sprint = sprint
            task.save(update_fields=["sprint"])

        sprint.refresh_from_db()

        return Response(
            SprintSerializer(sprint).data,
            status=status.HTTP_200_OK
        )
