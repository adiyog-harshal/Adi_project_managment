
from rest_framework import serializers
from .models import Milestone


class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = "__all__"

    def validate_milestone_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError(
                "Milestone name is required."
            )

        if len(value.strip()) < 2:
            raise serializers.ValidationError(
                "Milestone name must contain at least 2 characters."
            )

        return value.strip()

    def validate(self, attrs):
        start_date = attrs.get(
            "start_date",
            getattr(self.instance, "start_date", None)
        )
        due_date = attrs.get(
            "due_date",
            getattr(self.instance, "due_date", None)
        )

        if start_date and due_date and due_date < start_date:
            raise serializers.ValidationError({
                "due_date": (
                    "Due date cannot be before the start date."
                )
            })

        return attrs
