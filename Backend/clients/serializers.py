from rest_framework import serializers

from .models import Client


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = [
            "id",
            "client_name",
            "project_name",
            "phone_number",
            "contract",
            "address",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_client_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Client name is required.")
        return value