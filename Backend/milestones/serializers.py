from rest_framework import serializers
from .models import Milestone

class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = '__all__'

    def validate_milestone_name(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Module name is required."
            )

        project_id = self.initial_data.get("project")

        if not project_id and self.instance:
            project_id = self.instance.project_id

        existing_modules = Milestone.objects.filter(
            project_id=project_id,
            milestone_name__iexact=value
        )

        # Allow the existing name while editing the same module
        if self.instance:
            existing_modules = existing_modules.exclude(
                id=self.instance.id
            )

        if existing_modules.exists():
            raise serializers.ValidationError(
                "This module name already exists in this project."
            )

        return value