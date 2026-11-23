from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ReportViewSet, report_analytics


router = DefaultRouter()

router.register(
    r'reports',
    ReportViewSet,
    basename='reports'
)


urlpatterns = [

    path(
        '',
        include(router.urls)
    ),

    path(
        'analytics/',
        report_analytics,
        name='report-analytics'
    ),
]