from django.db import models
from django.utils import timezone

class WebApplication(models.Model):
    """Model to store web application details for scanning"""
    name = models.CharField(max_length=100)
    url = models.URLField()
    description = models.TextField(blank=True, null=True)
    date_added = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class ScanResult(models.Model):
    """Model to store results of security scans"""
    SCAN_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    SEVERITY_CHOICES = [
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
        ('info', 'Info'),
    ]
    
    web_application = models.ForeignKey(WebApplication, on_delete=models.CASCADE)
    scan_date = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=20, choices=SCAN_STATUS_CHOICES, default='completed')
    
    def __str__(self):
        return f"Scan of {self.web_application.name} on {self.scan_date}"

class Vulnerability(models.Model):
    """Model to store individual vulnerabilities found during scans"""
    VULNERABILITY_TYPES = [
        ('sql_injection', 'SQL Injection'),
        ('xss', 'Cross-Site Scripting'),
        ('csrf', 'Cross-Site Request Forgery'),
        ('data_exposure', 'Sensitive Data Exposure'),
        ('auth_failure', 'Authentication Failure'),
        ('misconfiguration', 'Security Misconfiguration'),
        ('missing_header', 'Missing Security Header'),
        ('insecure_cookies', 'Insecure Cookies'),
        ('other', 'Other'),
    ]
    
    scan_result = models.ForeignKey(ScanResult, on_delete=models.CASCADE)
    web_application = models.ForeignKey(WebApplication, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=50, choices=VULNERABILITY_TYPES, default='other')
    description = models.TextField()
    severity = models.CharField(max_length=20, choices=ScanResult.SEVERITY_CHOICES, default='medium')
    location = models.TextField(blank=True, null=True)
    remediation = models.TextField(blank=True, null=True)
    date_discovered = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"{self.severity} - {self.name} - {self.web_application.name}"
