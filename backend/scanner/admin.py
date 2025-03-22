from django.contrib import admin
from .models import WebApplication, ScanResult, Vulnerability

class VulnerabilityInline(admin.TabularInline):
    model = Vulnerability
    extra = 0

class ScanResultAdmin(admin.ModelAdmin):
    list_display = ('web_application', 'scan_date', 'status')
    list_filter = ('status', 'scan_date')
    inlines = [VulnerabilityInline]

class WebApplicationAdmin(admin.ModelAdmin):
    list_display = ('name', 'url', 'date_added')
    search_fields = ('name', 'url')

class VulnerabilityAdmin(admin.ModelAdmin):
    list_display = ('name', 'severity', 'scan_result', 'web_application')
    list_filter = ('severity',)
    search_fields = ('name', 'description')

admin.site.register(WebApplication, WebApplicationAdmin)
admin.site.register(ScanResult, ScanResultAdmin)
admin.site.register(Vulnerability, VulnerabilityAdmin)
