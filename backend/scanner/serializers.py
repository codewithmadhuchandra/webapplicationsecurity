from rest_framework import serializers
from .models import WebApplication, ScanResult, Vulnerability

class WebApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebApplication
        fields = ['id', 'name', 'url', 'description', 'date_added']

class VulnerabilitySerializer(serializers.ModelSerializer):
    web_application = WebApplicationSerializer(read_only=True)
    
    class Meta:
        model = Vulnerability
        fields = [
            'id', 'scan_result', 'web_application', 'name', 'type', 'description', 
            'severity', 'location', 'remediation', 'date_discovered'
        ]

class ScanResultSerializer(serializers.ModelSerializer):
    web_application = WebApplicationSerializer(read_only=True)
    vulnerabilities_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ScanResult
        fields = [
            'id', 'web_application', 'scan_date', 'status', 
            'vulnerabilities_count'
        ]
    
    def get_vulnerabilities_count(self, obj):
        return obj.vulnerability_set.count()

class WebApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebApplication
        fields = ['id', 'name', 'url', 'description'] 