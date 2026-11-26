
from django.contrib.auth import get_user_model

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework import serializers

from .serializers import UserSerializer
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from django.contrib.auth import get_user_model, password_validation
from django.contrib.auth.hashers import check_password
from django.core.exceptions import ValidationError

from rest_framework.permissions import IsAdminUser
from rest_framework import status

from django.shortcuts import get_object_or_404
from django.utils.crypto import get_random_string
import os
User = get_user_model()



class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = getattr(user, "profile", None)

        return Response({
            "id": user.id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "designation_name": (
                profile.designation.name
                if profile and profile.designation
                else ""
            ),
        })

    def patch(self, request):
        user = request.user

        allowed_fields = ["first_name", "last_name", "email"]
        errors = {}

        for field in allowed_fields:
            if field in request.data:
                value = request.data[field]

                if not isinstance(value, str):
                    errors[field] = ["Must be a string."]
                elif field == "email" and value.strip():
                    from django.core.validators import validate_email
                    from django.core.exceptions import ValidationError

                    try:
                        validate_email(value.strip())
                    except ValidationError:
                        errors[field] = ["Enter a valid email address."]

        if errors:
            return Response(errors, status=400)

        for field in allowed_fields:
            if field in request.data:
                setattr(user, field, request.data[field].strip())

        user.save()

        return self.get(request)

class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        current_password = request.data.get("current_password", "")
        new_password = request.data.get("new_password", "")
        confirm_password = request.data.get("confirm_password", "")

        if not all([
            current_password,
            new_password,
            confirm_password,
        ]):
            return Response(
                {"detail": "All password fields are required."},
                status=400,
            )

        if not request.user.check_password(current_password):
            return Response(
                {"current_password": "Current password is incorrect."},
                status=400,
            )

        if new_password != confirm_password:
            return Response(
                {"confirm_password": "Passwords do not match."},
                status=400,
            )

        try:
            validate_password(new_password, user=request.user)
        except ValidationError as exc:
            return Response(
                {"new_password": list(exc.messages)},
                status=400,
            )

        if current_password == new_password:
            return Response(
                {"new_password": "Choose a different password."},
                status=400,
            )

        request.user.set_password(new_password)
        request.user.save(update_fields=["password"])

        return Response({"detail": "Password changed successfully."})


class UserListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = User.objects.filter(
            client_account__isnull=True
        ).select_related(
            "profile__role",
            "profile__designation"
        ).order_by("id")

        serializer = UserSerializer(users, many=True)
        
        return Response(serializer.data)

    def post(self, request):
        serializer = UserSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            return Response({
            "message": "User created successfully.",
            "user": UserSerializer(user).data,
            "credentials": {
                "username": user.username,
                "password": serializer.generated_password,
            }
        }, status=201)

        return Response(serializer.errors, status=400)


class UserDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    queryset = User.objects.filter(
        client_account__isnull=True
    )
    
    def perform_destroy(self, instance):
        if instance.is_superuser:
            raise serializers.ValidationError(
                "Superuser account is protected and cannot be deleted."
            )

        instance.delete()

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")

        # check required fileds
        if not current_password or not new_password or not confirm_password:
            return Response(
                {"error": "All password fields are required."},
                status=400
            )

        # verifycurrent password
        if not check_password(current_password, request.user.password):
            return Response(
                {"error": "Current password is incorrect."},
                status=400
            )

        # check new password confirmation
        if new_password != confirm_password:
            return Response(
                {"error": "New password and confirm password do not match."},
                status=400
            )

        # prevent using the same password
        if current_password == new_password:
            return Response(
                {"error": "New password must be different from current password."},
                status=400
            )

        # validate password strength using django validators
        try:
            password_validation.validation_password(
                new_password,
                request.user
            )
        except ValidationError as error:
            return Response(
                {"error": error.message},
                status=400
            )

        # save new password securely
        request.user.set_password(new_password)
        request.user.save()

        return Response(
            {"message": "Password changed successfully."},
            status=200
        )

class ResetUserPasswordView(APIView):

    permission_classes = [IsAdminUser]

    def post(self, request, pk):

        user = get_object_or_404(
            User.objects.filter(client_account__isnull=True),
            pk=pk,
            is_superuser=False
        )

        new_password = get_random_string(16)

        user.set_password(new_password)
        user.save()

        return Response({
            "message": "Password reset successfully.",
            "credentials": {
                "username": user.username,
                "password": new_password
            }
        }, status=status.HTTP_200_OK)