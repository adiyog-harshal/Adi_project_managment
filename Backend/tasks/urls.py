from django.urls import path

from .views import (
    TaskListCreateView, 
    TaskDetailView,
    TaskCommentListCreateView,
    TaskCommentDetailView,
    TaskCarryOverView,
    TimeLogListCreateView,
    TimeSummaryView,
    TaskTimerStartView,
    TaskTimerStopView,
    ActiveTaskTimerView,
)

urlpatterns = [

    path(
        '',
        TaskListCreateView.as_view(),
        name='task-list-create'
    ),

    path(
        '<int:pk>/',
        TaskDetailView.as_view(),
        name='task-detail'
    ),

    path(
        "<int:task_id>/comments/",
        TaskCommentListCreateView.as_view(),
        name="task-comment-list-create"
    ),

    path(
        "task-comments/<int:pk>/",
        TaskCommentDetailView.as_view(),
        name="task-comment-detail"

    ),

    path(
        "<int:task_id>/carry-over/",
        TaskCarryOverView.as_view(),
        name="task-carry-over"
    ),

    # Automatic task timer
    path(
        "timers/start/",
        TaskTimerStartView.as_view(),
        name="task-timer-start",
    ),

    path(
        "timers/stop/",
        TaskTimerStopView.as_view(),
        name="task-timer-stop",
    ),

    path(
        "timers/active/",
        ActiveTaskTimerView.as_view(),
        name="active-task-timer",
    ),

    path(
        "time-logs/",
        TimeLogListCreateView.as_view(),
        name="time-log-list-create",
    ),
    
    path(
        "time-summary/",
        TimeSummaryView.as_view(),
        name="time-summary",
    ),
]