from django.urls import path, include
from rest_framework import routers
from .views import WebApplicationViewSet, ScanResultViewSet, VulnerabilityViewSet

router = routers.DefaultRouter()
router.register(r'web-applications', WebApplicationViewSet)
router.register(r'scan-results', ScanResultViewSet)
router.register(r'vulnerabilities', VulnerabilityViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 