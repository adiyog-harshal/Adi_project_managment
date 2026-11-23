from rest_framework import serializers
from .models import Report


class ReportSerializer(serializers.ModelSerializer):

    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = [
            'id',
            'name',
            'report_type',
            'description',
            'filters',
            'created_by',
            'created_by_name',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'created_by',
            'created_by_name',
            'created_at',
            'updated_at',
        ]

    def get_created_by_name(self, obj):

        if obj.created_by:
            return obj.created_by.username

        return None
