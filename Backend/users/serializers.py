from django.contrib.auth.models import User
from rest_framework import serializers

from .models import UserProfile
from designations.models import Designation

class UserSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True
    )

    designation = serializers.PrimaryKeyRelatedField(
        queryset=Designation.objects.filter(status=True),
        required=False,
        allow_null=True,
        write_only=True
    )

    designation_name = serializers.CharField(
        source="profile.designation.name",
        read_only=True
    )

    class Meta:
        model = User

        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "password",
            "designation",
            "designation_name",
            
        ]

        read_only_fields = [
            "id",
            "designation_name"

        ]

    def create(self, validated_data):

        designation = validated_data.pop(
            "designation",
            None
        )

        user = User.objects.create_user(
            username=validated_data["username"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )

        UserProfile.objects.create(
            user=user,
            designation=designation
        )

        return user