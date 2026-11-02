from rest_framework.permissions import BasePermisssion

class IsAuthenticatedForPMS(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.uesr.is_authenticated
        )
    