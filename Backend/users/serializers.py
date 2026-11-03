
from django.contrib.auth import get_user_model
from django.utils.crypto import get_random_string
from rest_framework import serializers

from .models import UserProfile
from designations.models import Designation
from role.models import Role

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(write_only=True, required=False)

    password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True
    )

    designation = serializers.PrimaryKeyRelatedField(
        queryset=Designation.objects.all(),
        required=False,
        allow_null=True,
        write_only=True
    )

    designation_id = serializers.SerializerMethodField()
    designation_name = serializers.SerializerMethodField()

    role = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.filter(is_active=True),
        required=False,
        allow_null=True,
        write_only=True
    )

    role_id = serializers.SerializerMethodField()
    role_name = serializers.SerializerMethodField()

    status = serializers.ChoiceField(
        choices=["Active", "Inactive"],
        required=False,
        write_only=True
    )

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
            "designation_id",
            "designation_name",
            "role",
            "role_id",
            "role_name",
            "is_active",
            "status",
        ]
        read_only_fields = [
            "id",
            "username",
            "designation_id",
            "designation_name",
            "role_id",
            "role_name",
        ]

    def get_designation_id(self, obj):
        try:
            return obj.profile.designation_id
        except UserProfile.DoesNotExist:
            return None

    def get_designation_name(self, obj):
        try:
            designation = obj.profile.designation
            return designation.name if designation else ""
        except UserProfile.DoesNotExist:
            return ""

    def get_role_id(self, obj):
        try:
            return obj.profile.role_id
        except UserProfile.DoesNotExist:
            return None

    def get_role_name(self, obj):
        try:
            role = obj.profile.role
            return role.role_name if role else ""
        except UserProfile.DoesNotExist:
            return ""

    def create(self, validated_data):
        name = validated_data.pop("name", "").strip()
        designation = validated_data.pop("designation", None)
        password = validated_data.pop("password", None)
        status = validated_data.pop("status", "Active")

        if name:
            parts = name.split()
            validated_data["first_name"] = parts[0]
            validated_data["last_name"] = " ".join(parts[1:])

        if not password:
            password = get_random_string(12)

        if not validated_data.get("username"):
            base = (
                name.lower().replace(" ", "_")
                or validated_data.get("email", "").split("@")[0]
                or "user"
            )
            username = base
            counter = 1

            while User.objects.filter(username=username).exists():
                username = f"{base}{counter}"
                counter += 1

            validated_data["username"] = username

        validated_data["is_active"] = status == "Active"

        user = User.objects.create_user(
            password=password,
            **validated_data
        )

        UserProfile.objects.update_or_create(
            user=user,
            defaults={"designation": designation}
        )

        return user

    def update(self, instance, validated_data):
        name = validated_data.pop("name", None)
        designation = validated_data.pop(
            "designation",
            serializers.empty
        )
        password = validated_data.pop("password", None)
        status = validated_data.pop("status", None)

        if name is not None:
            parts = name.strip().split()
            instance.first_name = parts[0] if parts else ""
            instance.last_name = " ".join(parts[1:])

        if status is not None:
            instance.is_active = status == "Active"

        for field, value in validated_data.items():
            setattr(instance, field, value)

        if password:
            instance.set_password(password)

        instance.save()

        if designation is not serializers.empty:
            UserProfile.objects.update_or_create(
                user=instance,
                defaults={"designation": designation}
            )

        return instance
