from rest_framework import viewsets, filters

from .models import Client
from .serializers import ClientSerializer
from history.services import log_activity


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer

    filter_backends = [filters.SearchFilter]
    search_fields = [
        "client_name",
        "project_name",
        "address",
    ]

    def get_client_values(self, client):
        return {
            "client_name": client.client_name,
            "project_name": client.project_name,
            "email": client.email,
            "phone_number": client.phone_number,
            "address": client.address,
        }

    def perform_create(self, serializer):
        client = serializer.save()

        log_activity(
            user=self.request.user,
            module="Clients",
            action="Created",
            object_id=client.id,
            object_name=client.client_name,
            description=f"Client '{client.client_name}' was created.",
            new_values=self.get_client_values(client),
        )

    def perform_update(self, serializer):
        client = self.get_object()

        old_values = self.get_client_values(client)

        client = serializer.save()

        new_values = self.get_client_values(client)

        changed_fields = [
            field
            for field in old_values
            if old_values[field] != new_values[field]
        ]

        if changed_fields:
            changed_old_values = {
                field: old_values[field]
                for field in changed_fields
            }

            changed_new_values = {
                field: new_values[field]
                for field in changed_fields
            }

            log_activity(
                user=self.request.user,
                module="Clients",
                action="Updated",
                object_id=client.id,
                object_name=client.client_name,
                description=(
                    f"Client '{client.client_name}' was updated. "
                    f"Changed fields: {', '.join(changed_fields)}."
                ),
                old_values=changed_old_values,
                new_values=changed_new_values,
            )

    def perform_destroy(self, instance):
        old_values = self.get_client_values(instance)

        log_activity(
            user=self.request.user,
            module="Clients",
            action="Deleted",
            object_id=instance.id,
            object_name=instance.client_name,
            description=f"Client '{instance.client_name}' was deleted.",
            old_values=old_values,
        )

        instance.delete()
