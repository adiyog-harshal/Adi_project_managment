from rest_framework import serializers

from .models import Designation

class DesignationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Designation

        fields = [
            "id",
            "name",
            "description",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    def validate_name(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Designation name cannot be empty."
            )

        return value

        