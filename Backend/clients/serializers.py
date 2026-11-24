
from rest_framework import serializers
from .models import Client
import re


class ClientSerializer(serializers.ModelSerializer):

    has_account = serializers.SerializerMethodField()

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
            "has_account",
        ]
        read_only_fields = ["id", "has_account", "created_at", "updated_at"]       

    def get_has_account(self, obj):
        return bool(obj.user_id)

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
