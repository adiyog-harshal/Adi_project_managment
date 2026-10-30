
from django.contrib import admin
from .models import Client


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "client_name",
        "project_name",
        "phone_number",
        "contract",
        "created_at",
    )

    search_fields = (
        "client_name",
        "project_name",
        "phone_number",
        "contract",
        "address",
    )

    list_filter = ("created_at",)
