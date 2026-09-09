from django.urls import path
from .views import ProjectListCreateView, ProjectDetailView

from .views import(
    ProjectCommentListCreateView,
    ProjectCommentDetailView,
)

urlpatterns = [
    path('', ProjectListCreateView.as_view(), name='project-list-create'),
    path('<int:pk>/', ProjectDetailView.as_view(), name='project-detail'),

    path(
        "<int:project_id>/comments/",
        ProjectCommentListCreateView.as_view(),
        name="project-comment-list-create"

    ),

    path(
        "project-comments/<int:pk>/",
        ProjectCommentDetailView.as_view(),
        name="project-comment-detail"
    ),
]