
from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from users.views import ProfileView


def home(request):
    return HttpResponse("PMS Backend is running successfully!")


urlpatterns = [
    path('', home, name='home'),

    path('admin/', admin.site.urls),

    # Authentication
    path('api/login/', TokenObtainPairView.as_view(), name='login'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/profile/', ProfileView.as_view(), name='profile'),

    # Applications
    path('api/users/', include('users.urls')),
    path('api/projects/', include('projects.urls')),
    path('api/tasks/', include('tasks.urls')),
    path('api/milestones/', include('milestones.urls')),
    path('api/sprints/', include('sprints.urls')),
    path('api/designations/', include('designations.urls')),
    path('api/roles/', include('role.urls')),
    path('api/clients/', include('clients.urls')),
]
