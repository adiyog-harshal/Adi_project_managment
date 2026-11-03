
from rest_framework import serializers
from .models import Client
import re


class ClientSerializer(serializers.ModelSerializer):

    class Meta:
        model = Client
        fields = [
            "id",
            "client_name",
            "project_name",
            "email",
            "phone_number",
            "address",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_client_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Client name is required."
            )

        return value

    def validate_email(self, value):
        value = value.strip()

        if value and not re.match(
            r"^[^@\s]+@[^@\s]+\.[^@\s]+$", value
        ):
            raise serializers.ValidationError(
                "Enter a valid email address."
            )

        return value

    def validate_phone_number(self, value):
        value = value.strip()

        if value and not re.fullmatch(r"[0-9]{10}", value):
            raise serializers.ValidationError(
                "Phone number must contain exactly 10 digits."
            )

        return value
