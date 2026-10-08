from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Sprint
from .serializers import SprintSerializer
from tasks.models import Task

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
            return Sprint.objects.select_related('project', 'milestone').get(pk=pk)
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
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request, pk):
        sprint = self.get_object(pk)
        if sprint is None:
            return Response(
                {"detail": "Sprint not found."}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = SprintSerializer(sprint, data=request.data)
        if serializer.is_valid():
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

        tasks.update(sprint=sprint)

        sprint.refresh_from_db()

        return Response(
            SprintSerializer(sprint).data,
            status=status.HTTP_200_OK
        )