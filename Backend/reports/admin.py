from  django.contrib import admin
from.models import Report

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
 list_display = (
     'id',
     'name',
     'report_type',
     'created_by',
     'created_at',
     
 )
 
 list_filter = (
     'report_type',
     'created_at',
 )
 
 readonly_fields = (
     'created_at',
      'updated_at',
 )