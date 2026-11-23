from django.db.models import Count
from django.db.models.functions import TruncMonth
from django.utils import timezone

from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Report
from .serializers import ReportSerializer


class ReportViewSet(viewsets.ModelViewSet):

    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    queryset = Report.objects.all()

    def get_queryset(self):

        return Report.objects.all().order_by('-created_at')

    def perform_create(self, serializer):

        serializer.save(
            created_by=self.request.user
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def report_analytics(request):

    # Import your existing Task model
    from tasks.models import Task

    tasks = Task.objects.all()

    total_tasks = tasks.count()

    # Adjust status values to match your Task model
    completed_tasks = tasks.filter(
        status__iexact='completed'
    ).count()

    pending_tasks = tasks.exclude(
        status__iexact='completed'
    ).count()

    completion_rate = (
        round((completed_tasks / total_tasks) * 100, 1)
        if total_tasks > 0
        else 0
    )

    # Monthly task progress
    monthly_data = (
        tasks
        .annotate(month=TruncMonth('created_at'))
        .values('month')
        .annotate(
            created=Count('id')
        )
        .order_by('month')
    )

    monthly_progress = []

    for item in monthly_data:

        month = item['month']

        monthly_progress.append({
            'month': month.strftime('%b'),
            'created': item['created'],
            'completed': 0
        })

    # Tasks by category
    category_data = (
        tasks
        .values('category')
        .annotate(total=Count('id'))
        .order_by('-total')
    )

    tasks_by_category = []

    for item in category_data:

        tasks_by_category.append({
            'category': item['category'] or 'Other',
            'total': item['total']
        })

    # Tasks by status
    status_data = (
        tasks
        .values('status')
        .annotate(total=Count('id'))
        .order_by('-total')
    )

    tasks_by_status = []

    for item in status_data:

        tasks_by_status.append({
            'status': item['status'],
            'total': item['total']
        })

    analytics = {
        'kpis': {
            'completion_rate': completion_rate,
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'pending_tasks': pending_tasks,
            'average_response_time': None,
            'team_velocity': completed_tasks,
            'sprint_success_rate': None,
        },

        'monthly_progress': monthly_progress,

        'tasks_by_category': tasks_by_category,

        'tasks_by_status': tasks_by_status,

        'generated_at': timezone.now(),
    }

    return Response(analytics)