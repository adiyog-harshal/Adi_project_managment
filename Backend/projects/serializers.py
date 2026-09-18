from rest_framework import serializers
from .models import Project,Notification,Resource,Attachment,ProjectComment


class ProjectSerializer(serializers.ModelSerializer):

    class Meta:
        model = Project
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Notification
        fields = [
            'id',
            'recipient',
            'message',
            'is_read',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'recipient',
            'message',
            'created_at',
        ]

class ResourceSerializer(serializers.ModelSerializer):

    class Meta:
        model = Resource
        fields = [
            'id',
            'resource_name',
            'resource_type',
            'project',
            'task',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
        ]

class AttachmentSerializer(serializers.ModelSerializer):

	class Meta:
		model = Attachment
		fields = [
			'id',
			'file',
			'project',
			'task',
			'comment',
			'uploaded_by',
			'created_at',
		]
		read_only_fileds = [
			'id',
			'uploaded_by',
			'created_at',
		]
	def validate_file(self,file):
		max_size = 50 * 1024 * 1024
		if file.size > max_size:
			raise serializers.ValidationError(
				'File size cannot exceed 50 MB.'
				)
		return file
class ProjectCommentSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProjectComment
        fields = [
            'id',
            'project',
            'user',
            'message',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'user',
            'created_at',
            'updated_at',
        ]


