from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/role/',include('role.urls') ),
    path('api/user/',include('user.urls'))


]