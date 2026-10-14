from django.urls import path
from .views import (
    SprintListCreateView,
    SprintDetailView,
    SprintTaskAssignView,
    SprintStartView,
)

urlpatterns = [
    path('', SprintListCreateView.as_view(), name='sprint-list-create'),

    path(
        '<int:pk>/tasks/',
        SprintTaskAssignView.as_view(),
        name='sprint-task-assign'
    ),

    path(
        '<int:pk>/',
        SprintDetailView.as_view(),
        name='sprint-detail'
    ),

    path(
        '<int:pk>/start/',
        SprintStartView.as_view(),
        name='sprint-start'
    ),
]