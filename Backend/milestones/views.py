from rest_framework import generics

from .models import Milestone
from .serializers import MilestoneSerializer


# 1. List all milestones
class MilestoneListView(generics.ListAPIView):
    queryset = Milestone.objects.all()
    serializer_class = MilestoneSerializer


# 2. Create a milestone
class MilestoneCreateView(generics.CreateAPIView):
    queryset = Milestone.objects.all()
    serializer_class = MilestoneSerializer


# 3. View a single milestone
class MilestoneDetailView(generics.RetrieveAPIView):
    queryset = Milestone.objects.all()
    serializer_class = MilestoneSerializer


# 4. Update a milestone
class MilestoneUpdateView(generics.UpdateAPIView):
    queryset = Milestone.objects.all()
    serializer_class = MilestoneSerializer


# 5. Delete a milestone
class MilestoneDeleteView(generics.DestroyAPIView):
    queryset = Milestone.objects.all()
    serializer_class = MilestoneSerializer