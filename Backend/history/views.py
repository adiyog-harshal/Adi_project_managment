from django.db.models import Q

from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination

from .models import ActivityLog
from .serializers import ActivityLogSerializer


class HistoryPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class ActivityLogListView(generics.ListAPIView):
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = HistoryPagination

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    search_fields = [
        "object_name",
        "description",
        "user__username",
    ]

    ordering_fields = [
        "created_at",
        "module",
        "action",
        "object_name",
    ]

    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = ActivityLog.objects.select_related("user").all()

        module = self.request.query_params.get("module")
        action = self.request.query_params.get("action")
        user_id = self.request.query_params.get("user")

        if module:
            queryset = queryset.filter(module=module)

        if action:
            queryset = queryset.filter(action=action)

        if user_id:
            queryset = queryset.filter(user_id=user_id)

        return queryset