from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Sprint
from .serializers import SprintSerializer
from tasks.models import Task
from django.utils import timezone
from tasks.models import TaskSprintHistory

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

        choice = request.data.get("start_choice")
        today = timezone.localdate()

        if choice not in ["today", "tomorrow"]:
            return Response(
                {"detail": "Select either today or tomorrow."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if sprint.status in ["Completed", "Cancelled"]:
            return Response(
                {"detail": "Completed or cancelled sprints cannot be started."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if choice == "tomorrow":
            duration = (sprint.end_date - sprint.start_date).days
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
                        "detail": (
                            "Another sprint already exists during these "
                            "dates in this project. Choose different dates."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

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

            return Response(
                {
                    "message": "Sprint scheduled to start tomorrow.",
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