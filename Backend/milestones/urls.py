from django.urls import path
from .views import (
    MilestoneCreateView,
    MilestoneDetailView,
    MilestoneListView,
    MilestoneUpdateView,
    MilestoneDeleteView,
)
urlpatterns = [
    # List
    path('', MilestoneListView.as_view(), name='milestone-list'),

    # Create
    path('create/', MilestoneCreateView.as_view(), name='milestone-create'),

    # View
    path('<int:pk>/', MilestoneDetailView.as_view(), name='milestone-detail'),

    # Update
    path('<int:pk>/update/', MilestoneUpdateView.as_view(), name='milestone-update'),

    # Delete
    path('<int:pk>/delete/', MilestoneDeleteView.as_view(), name='milestone-delete'),
]