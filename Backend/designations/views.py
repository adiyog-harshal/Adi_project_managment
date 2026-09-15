from django.shortcuts import render

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Designation
from .serializers import DesignationSerializer

# Create your views here.
class DesignationListCreateView(
    generics.ListCreateAPIView
):

    queryset = Designation.objects.all().order_by("name")

    serializer_class = DesignationSerializer

    permission_classes = [
        IsAuthenticated
    ]

class DesignationDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    queryset = Designation.objects.all()

    serializer_class = DesignationSerializer

    permission_classes = [
        IsAuthenticated
    ]