from rest_framework import viewsets, filters
from .models import Client
from .serializers import ClientSerializer


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer

    filter_backends = [filters.SearchFilter]
    search_fields = [
        "client_name",
        "project_name",
        "contract",
        "address",
    ]
