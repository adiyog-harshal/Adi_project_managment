from django.urls import path
from .views import (
    ProjectListCreateView,
    ProjectDetailView,
   
   )
from .views import (
    NotificationListView,
    NotificationReadView,
)


urlpatterns = [
    path('', ProjectListCreateView.as_view(), name='project-list-create'),
    path('<int:pk>/', ProjectDetailView.as_view(), name='project-detail'),

     path(
        'notifications/',
        NotificationListView.as_view(),
        name='notification-list'
    ),

    path(
        'notifications/<int:pk>/read/',
        NotificationReadView.as_view(),
        name='notification-read'
    ),
]