
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile
from designations.models import Designation


from .models import UserProfile
from designations.models import Designation

class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(write_only=True)
    password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True
    )

    designation = serializers.PrimaryKeyRelatedField(
        queryset=Designation.objects.filter(status=True),
        required=False,
        allow_null=True,
        write_only=True
    )

    designation_name = serializers.SerializerMethodField()

    class Meta:
        model = User

        fields = [
            "id",
            "name",
            "username",
            "first_name",
            "last_name",
            "email",
            "password",
            "designation",
            "designation_name",
            "is_active",
        ]
        read_only_fields = ["id", "username", "designation_name"]

    def get_designation_name(self, obj):
        try:
            return obj.profile.designation.name if obj.profile.designation else ""
        except UserProfile.DoesNotExist:
            return ""

    def create(self, validated_data):
        name = validated_data.pop("name").strip()
        designation = validated_data.pop("designation", None)
        password = validated_data.pop("password", None)

        if not password:
            from django.utils.crypto import get_random_string
            password = get_random_string(12)

        parts = name.split()
        first_name = parts[0]
        last_name = " ".join(parts[1:])

        base_username = name.lower().replace(" ", "_")
        username = base_username
        counter = 1

        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        user = User.objects.create_user(
            username=username,
            first_name=first_name,
            last_name=last_name,
            email=validated_data.get("email", ""),
            password=password,
        )

        user.is_active = validated_data.get("is_active", True)
        user.save()

        UserProfile.objects.create(
            user=user,
            designation=designation,
        )

        return user
