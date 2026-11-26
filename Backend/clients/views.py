from django.contrib.auth import get_user_model
from django.utils.crypto import get_random_string
from django.utils.text import slugify
from django.db import transaction

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.permissions import BasePermission
from rest_framework.response import Response

from .models import Client
from .serializers import ClientSerializer
from history.services import log_activity

User = get_user_model()

# only django superuser can create clients accounts
class IsSuperUser(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_superuser
        )
class ClientViewSet(viewsets.ModelViewSet):

    queryset = Client.objects.all()
    serializer_class = ClientSerializer

    filter_backends = [filters.SearchFilter]

    search_fields = [
        "client_name",
        "project_name",
        "address",
    ]

    # CREATE CLIENT ACCOUNT
    @action(
        detail=True,
        methods=["post"],
        url_path="create-account",
        permission_classes=[IsSuperUser]
    )
    def create_account(self, request, pk=None):

        client = self.get_object()

    # check whether account already exists
        if client.user:
            return Response(
                {"error": "This client already has a login account."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate unique name
        base_username = (
            slugify(client.client_name).replace("-", "_")[:140]
            or "client"
        )

        username = base_username
        counter = 1

        while User.objects.filter(username=username).exists():

            suffix = f"_{counter}"

            username = (
                base_username[:150 - len(suffix)] + suffix
            )

            counter += 1

        # generate temporary pass
        password = get_random_string(16)

        # create account and connect it to client
        with transaction.atomic():

            user = User.objects.create_user(
                username=username,
                email=client.email,
                first_name=client.client_name[:150],
                password=password
            )

            client.user = user
            client.save(update_fields=["user", "updated_at"])

        # return credentials to admin only once
        return Response(
            {
                "message": "Client account created successfully.",
                "username": username,
                "password": password,
            },
            status=status.HTTP_201_CREATED
        )


    # RESET CLIENT LOGIN PASSWORD
    @action(
        detail=True,
        methods=["post"],
        url_path="reset-account-password",
        permission_classes=[IsSuperUser]
    )
    def reset_account_password(self, request, pk=None):

        client = self.get_object()

        if not client.user:
            return Response(
                {"error": "This client does not have a login account."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate a new temporary password
        password = get_random_string(16)

        client.user.set_password(password)
        client.user.save(update_fields=["password"])

        return Response({
            "message": "Client password reset successfully.",
            "username": client.user.username,
            "password": password
        })
