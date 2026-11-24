from django.contrib import admin
from .models import Role, ModulePermission

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('id','role_name','description','is_active','created_at','updated_at')
    list_filter = ('is_active','created_at')
    search_fields = ('role_name', 'description')
    
    ordering = ('-created_at',)

admin.site.register(ModulePermission)