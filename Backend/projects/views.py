from django.shortcuts import render

from rest_framework import generics
# from rest_framework.permissions import IsAuthenticated

from .models import Project
from .serializers import ProjectSerializer


# Create your views here.
class ProjectListCreateView(generics.ListCreateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    # permission_classes = [IsAuthenticated]


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    # permission_classes = [IsAuthenticated]


