
"""
URL configuration for config project.
"""

from django.contrib import admin
from django.urls import path, include

<<<<<<< HEAD
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from users.views import ProfileView
=======
from users.views import ProfileView

from rest_framework_simplejwt.views import ( 
    TokenObtainPairView, 
    TokenRefreshView )
>>>>>>> b8b7faa (Added changes in projectDetails)

urlpatterns = [
    path('admin/', admin.site.urls),

<<<<<<< HEAD
    # Authentication
=======
    path('api/profile/', ProfileView.as_view(), name='profile'),

>>>>>>> b8b7faa (Added changes in projectDetails)
    path('api/login/', TokenObtainPairView.as_view(), name='login'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/milestones/', include('milestones.urls')),
    path('api/sprints/', include('sprints.urls')),
    path('api/profile/', ProfileView.as_view(), name='profile'),
    path('api/clients/',include('clients.urls')),
    path('api/users/', include('users.urls')),
    path('api/projects/', include('projects.urls')),
    path('api/tasks/', include('tasks.urls')),
    path('api/milestones/', include('milestones.urls')),
    path('api/sprints/', include('sprints.urls')),
    path('api/designations/', include('designations.urls')),
    path('api/roles/', include('role.urls')),
<<<<<<< HEAD
]
=======
    
]
>>>>>>> b8b7faa (Added changes in projectDetails)
