
from django.contrib.auth import get_user_model

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework import serializers

from .serializers import UserSerializer

from django.contrib.auth import get_user_model, password_validation
from django.contrib.auth.hashers import check_password
from django.core.exceptions import ValidationError

from rest_framework.permissions import IsAdminUser
from rest_framework import status

from django.shortcuts import get_object_or_404
from django.utils.crypto import get_random_string

User = get_user_model()


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "first_name": request.user.first_name,
            "last_name": request.user.last_name,
            "email": request.user.email,
            "is_staff": request.user.is_staff,
            "is_superuser": request.user.is_superuser,
        })


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