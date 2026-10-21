





from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Role
from .serializers import RoleSerializer


class RoleListCreateView(APIView):

    def get(self, request):
        roles = Role.objects.all().order_by('-id')
        serializer = RoleSerializer(roles, many=True)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    # POST - Create role
    def post(self, request):
        serializer = RoleSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class RoleDetailView(APIView):

    def get_role(self, pk):
        try:
            return Role.objects.get(pk=pk)
        except Role.DoesNotExist:
            return None


    def get(self, request, pk):
        role = self.get_role(pk)

        if role is None:
            return Response(
                {"message": "Role not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = RoleSerializer(role)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


    def put(self, request, pk):
        role = self.get_role(pk)

        if role is None:
            return Response(
                {"message": "Role not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = RoleSerializer(
            role,
            data=request.data
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    
    def patch(self, request, pk):
        role = self.get_role(pk)

        if role is None:
            return Response(
                {"message": "Role not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = RoleSerializer(
            role,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


    def delete(self, request, pk):
        role = self.get_role(pk)

        if role is None:
            return Response(
                {"message": "Role not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        role.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
