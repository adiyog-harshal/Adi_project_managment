
from django.contrib.auth.models import User

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .serializers import UserSerializer
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError


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

        users = User.objects.all()

        serializer = UserSerializer(
            users,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):

        serializer = UserSerializer(
            data=request.data
        )

        if serializer.is_valid():

            user = serializer.save()

            return Response(
                UserSerializer(user).data,
                status=201
            )

        return Response(
            serializer.errors,
            status=400
        )


