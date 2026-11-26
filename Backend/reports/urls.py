from django.urls import path
from .views import ReportView, ReportOptionsView

urlpatterns = [
    path('', ReportView.as_view(), name='reports'),
    path('options/', ReportOptionsView.as_view(), name='report-options'),
]
