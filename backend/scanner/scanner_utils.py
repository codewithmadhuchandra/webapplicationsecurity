import requests
from bs4 import BeautifulSoup
import re
import urllib.parse
import logging
from concurrent.futures import ThreadPoolExecutor
import subprocess
import os
import json
import time
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WebSecurityScanner:
    """A more realistic web security scanner that uses Python security libraries."""
    
    def __init__(self, target_url):
        """Initialize scanner with target URL."""
        self.target_url = target_url
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive'
        }
        self.vulnerabilities = []
        self.visited_urls = set()
        self.forms = []
        self.cookies = {}
        self.session = requests.Session()
    
    def scan(self):
        """Main scan method - orchestrates the scanning process."""
        start_time = time.time()
        logger.info(f"Starting security scan of {self.target_url}")
        
        try:
            # Initial request to get the site
            initial_response = self.session.get(self.target_url, headers=self.headers, timeout=10, verify=True)
            self.cookies = initial_response.cookies
            
            # Check for basic security headers
            self.check_security_headers(initial_response)
            
            # Crawl the site to find forms and links
            self.crawl_site(initial_response)
            
            # Check forms for vulnerabilities
            for form in self.forms:
                self.check_form_vulnerabilities(form)
            
            # Check for common vulnerabilities
            self.check_common_vulnerabilities()
            
            # Compile scan results
            scan_time = time.time() - start_time
            summary = f"Scan completed in {scan_time:.2f} seconds. Found {len(self.vulnerabilities)} potential vulnerabilities."
            
            return {
                'summary': summary,
                'vulnerabilities': self.vulnerabilities,
                'scan_date': datetime.now().isoformat(),
                'target_url': self.target_url
            }
            
        except Exception as e:
            logger.error(f"Scan failed: {str(e)}")
            return {
                'summary': f"Scan failed: {str(e)}",
                'vulnerabilities': [],
                'scan_date': datetime.now().isoformat(),
                'target_url': self.target_url
            }
    
    def crawl_site(self, response, max_pages=10):
        """Crawl the website to find forms and links."""
        if len(self.visited_urls) >= max_pages:
            return
        
        self.visited_urls.add(response.url)
        
        try:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Find all forms
            for form in soup.find_all('form'):
                form_data = {
                    'action': form.get('action', ''),
                    'method': form.get('method', 'get'),
                    'inputs': []
                }
                
                for input_field in form.find_all(['input', 'textarea', 'select']):
                    input_data = {
                        'name': input_field.get('name', ''),
                        'type': input_field.get('type', 'text'),
                        'value': input_field.get('value', '')
                    }
                    form_data['inputs'].append(input_data)
                
                form_data['url'] = response.url
                self.forms.append(form_data)
            
            # Find all links for further crawling
            with ThreadPoolExecutor(max_workers=5) as executor:
                futures = []
                for link in soup.find_all('a', href=True):
                    href = link['href']
                    if href.startswith('#') or href.startswith('javascript:'):
                        continue
                    
                    # Make absolute URL if needed
                    if not href.startswith(('http://', 'https://')):
                        href = urllib.parse.urljoin(response.url, href)
                    
                    # Only follow links on the same domain
                    if not href.startswith(self.target_url):
                        continue
                    
                    if href not in self.visited_urls:
                        futures.append(executor.submit(self.visit_url, href))
                
                for future in futures:
                    future.result()
                    
        except Exception as e:
            logger.error(f"Error crawling site: {str(e)}")
    
    def visit_url(self, url):
        """Visit a URL and process it."""
        if url in self.visited_urls:
            return
        
        try:
            response = self.session.get(url, headers=self.headers, timeout=5, verify=True)
            if response.status_code == 200:
                self.crawl_site(response)
        except Exception as e:
            logger.error(f"Error visiting URL {url}: {str(e)}")
    
    def check_security_headers(self, response):
        """Check for security headers in the response."""
        headers_to_check = {
            'Strict-Transport-Security': {'required': True, 'description': 'Missing HTTP Strict Transport Security header'},
            'Content-Security-Policy': {'required': False, 'description': 'Missing Content Security Policy header'},
            'X-Content-Type-Options': {'required': True, 'description': 'Missing X-Content-Type-Options: nosniff header'},
            'X-Frame-Options': {'required': True, 'description': 'Missing X-Frame-Options header'},
            'X-XSS-Protection': {'required': False, 'description': 'Missing X-XSS-Protection header'}
        }
        
        for header, check in headers_to_check.items():
            if check['required'] and header not in response.headers:
                self.add_vulnerability(
                    name=f"Missing {header} Header",
                    description=check['description'],
                    severity='Low' if not check['required'] else 'Medium',
                    url=response.url,
                    parameter='HTTP Headers',
                    evidence=f"Response headers: {list(response.headers.keys())}",
                    mitigation=f"Add the {header} header to your server responses"
                )
    
    def check_form_vulnerabilities(self, form):
        """Check a form for security vulnerabilities."""
        # Check CSRF protection
        csrf_tokens = ['csrf_token', 'csrftoken', '_csrf', 'csrf', 'csrf_name', 'token']
        has_csrf = False
        
        for input_field in form['inputs']:
            if any(token in input_field['name'].lower() for token in csrf_tokens):
                has_csrf = True
                break
        
        if not has_csrf and form['method'].lower() == 'post':
            self.add_vulnerability(
                name="CSRF Vulnerability",
                description="Form doesn't have CSRF protection",
                severity='Medium',
                url=form['url'],
                parameter='Form',
                evidence=f"Form action: {form['action']}",
                mitigation="Implement CSRF tokens for all POST forms"
            )
        
        # Check for potential SQL injection
        for input_field in form['inputs']:
            if input_field['type'] not in ['hidden', 'submit', 'button', 'checkbox', 'radio']:
                if input_field['name'].lower() in ['username', 'user', 'email', 'login', 'password', 'pass', 'query', 'search', 'id']:
                    self.add_vulnerability(
                        name="Potential SQL Injection",
                        description=f"Form input '{input_field['name']}' could be vulnerable to SQL injection",
                        severity='High',
                        url=form['url'],
                        parameter=input_field['name'],
                        evidence=f"Input field: {input_field['name']}, Type: {input_field['type']}",
                        mitigation="Use parameterized queries or ORM for database operations. Validate and sanitize all inputs."
                    )
    
    def check_common_vulnerabilities(self):
        """Check for common web vulnerabilities."""
        # Check for insecure cookies
        for cookie_name, cookie in self.session.cookies.items():
            if not cookie.secure:
                self.add_vulnerability(
                    name="Insecure Cookies",
                    description=f"Cookie '{cookie_name}' is set without the Secure flag",
                    severity='Medium',
                    url=self.target_url,
                    parameter=cookie_name,
                    evidence=f"Cookie: {cookie_name}",
                    mitigation="Set the Secure flag for all cookies"
                )
            
            if not cookie.has_nonstandard_attr('HttpOnly'):
                self.add_vulnerability(
                    name="Cookies Without HttpOnly",
                    description=f"Cookie '{cookie_name}' is set without the HttpOnly flag",
                    severity='Medium',
                    url=self.target_url,
                    parameter=cookie_name,
                    evidence=f"Cookie: {cookie_name}",
                    mitigation="Set the HttpOnly flag for all cookies containing sensitive data"
                )
    
    def add_vulnerability(self, name, description, severity, url, parameter, evidence, mitigation):
        """Add a vulnerability to the list."""
        vuln = {
            'name': name,
            'type': name.lower().replace(' ', '_'),
            'description': description,
            'severity': severity,
            'url': url,
            'parameter': parameter,
            'evidence': evidence,
            'mitigation': mitigation
        }
        self.vulnerabilities.append(vuln)

class SecurityScanner:
    """More simplified scanner for demonstration purposes."""
    
    @staticmethod
    def scan_web_application(url):
        """Scan a web application and return simulated results."""
        scanner = WebSecurityScanner(url)
        return scanner.scan() 