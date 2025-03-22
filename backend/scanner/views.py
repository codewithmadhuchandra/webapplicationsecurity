from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import WebApplication, ScanResult, Vulnerability
from .serializers import (
    WebApplicationSerializer, 
    WebApplicationCreateSerializer,
    ScanResultSerializer, 
    VulnerabilitySerializer
)
from .scanner_utils import WebSecurityScanner, SecurityScanner
import threading
import datetime

# Create your views here.

class WebApplicationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for web applications
    """
    queryset = WebApplication.objects.all()
    serializer_class = WebApplicationSerializer
    
    def get_serializer_class(self):
        if self.action == 'create':
            return WebApplicationCreateSerializer
        return WebApplicationSerializer
    
    @action(detail=True, methods=['post'])
    def scan(self, request, pk=None):
        """Initiate a scan for the web application"""
        web_app = self.get_object()
        
        # Create a new scan result
        scan_result = ScanResult.objects.create(
            web_application=web_app,
            scan_date=datetime.datetime.now(),
            status="In Progress"  # Initially set to in progress
        )
        
        try:
            # Use the updated WebSecurityScanner class to perform a real scan
            scanner = WebSecurityScanner(web_app.url)
            scan_data = scanner.scan()
            
            # Update scan result with scan data
            scan_result.status = "Completed"
            scan_result.save()
            
            # Create vulnerability objects
            for vuln_data in scan_data['vulnerabilities']:
                Vulnerability.objects.create(
                    scan_result=scan_result,
                    web_application=web_app,
                    name=vuln_data["name"],
                    type=vuln_data.get("type", "other"),
                    description=vuln_data["description"],
                    severity=vuln_data["severity"],
                    location=vuln_data.get("url", ""),
                    remediation=vuln_data.get("mitigation", ""),
                    date_discovered=datetime.datetime.now()
                )
            
            serializer = ScanResultSerializer(scan_result)
            return Response(serializer.data)
        except Exception as e:
            # Update scan result with error status
            scan_result.status = "Failed"
            scan_result.save()
            return Response(
                {"error": f"Scan failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def scans(self, request, pk=None):
        web_app = self.get_object()
        scans = ScanResult.objects.filter(web_application=web_app)
        serializer = ScanResultSerializer(scans, many=True)
        return Response(serializer.data)


class ScanResultViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for scan results (read-only)
    """
    queryset = ScanResult.objects.all()
    serializer_class = ScanResultSerializer
    
    def get_queryset(self):
        """Optionally filter by web application"""
        queryset = ScanResult.objects.all()
        web_app_id = self.request.query_params.get('web_application', None)
        if web_app_id is not None:
            queryset = queryset.filter(web_application_id=web_app_id)
        return queryset

    @action(detail=True, methods=['get'])
    def vulnerabilities(self, request, pk=None):
        scan_result = self.get_object()
        vulnerabilities = Vulnerability.objects.filter(scan_result=scan_result)
        serializer = VulnerabilitySerializer(vulnerabilities, many=True)
        return Response(serializer.data)


class VulnerabilityViewSet(viewsets.ModelViewSet):
    """
    API endpoint for viewing and managing vulnerabilities
    """
    queryset = Vulnerability.objects.all().order_by('-date_discovered')
    serializer_class = VulnerabilitySerializer
    
    def get_queryset(self):
        """Allow filtering by web application or scan"""
        queryset = super().get_queryset()
        
        # Filter by web application if specified
        web_app_id = self.request.query_params.get('web_application')
        if web_app_id:
            queryset = queryset.filter(web_application_id=web_app_id)
            
        # Filter by scan result if specified
        scan_id = self.request.query_params.get('scan_result')
        if scan_id:
            queryset = queryset.filter(scan_result_id=scan_id)
            
        # Filter by severity if specified
        severity = self.request.query_params.get('severity')
        if severity:
            queryset = queryset.filter(severity=severity)
            
        # Filter by type if specified
        vuln_type = self.request.query_params.get('type')
        if vuln_type:
            queryset = queryset.filter(type=vuln_type)
            
        return queryset
