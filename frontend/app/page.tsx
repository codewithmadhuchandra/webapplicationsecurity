"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

// Define types
interface WebApplication {
  id: number;
  name: string;
  url: string;
  description: string;
}

interface ScanResult {
  id: number;
  web_application: {
    id: number;
    name: string;
    url: string;
  };
  scan_date: string;
  status: string;
  vulnerabilities_count: number;
}

interface Vulnerability {
  id: number;
  name: string;
  type: string;
  description: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  url: string | null;
  parameter: string | null;
  evidence: string | null;
  mitigation: string | null;
}

interface SeverityCount {
  info: number;
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export default function Dashboard() {
  const [webApplications, setWebApplications] = useState<WebApplication[]>([]);
  const [recentScanResults, setRecentScanResults] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Define the base API URL
  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch web applications
        const appsResponse = await fetch(`${API_BASE_URL}/web-applications/`);
        if (!appsResponse.ok) {
          throw new Error('Failed to fetch web applications');
        }
        const appsData = await appsResponse.json();
        setWebApplications(appsData);
        
        // Fetch recent scan results
        const scansResponse = await fetch(`${API_BASE_URL}/scan-results/`);
        if (!scansResponse.ok) {
          throw new Error('Failed to fetch scan results');
        }
        const scansData = await scansResponse.json();
        setRecentScanResults(scansData);
        
        setError('');
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load data. Please ensure the backend server is running at ' + API_BASE_URL);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Web Security Audit Tool</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <p className="text-gray-700 mb-4">Welcome to the Web Application Security Audit Tool. This tool allows you to scan web applications for common security vulnerabilities.</p>
        
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Features:</h2>
        <ul className="list-disc pl-6 mb-6 text-gray-700">
          <li>Detect SQL Injection vulnerabilities</li>
          <li>Find Cross-Site Scripting (XSS) issues</li>
          <li>Identify Cross-Site Request Forgery (CSRF) problems</li>
          <li>Check for sensitive data exposure</li>
          <li>Analyze security header configuration</li>
        </ul>
        
        <p className="text-gray-700 mb-4">To get started, add your first web application:</p>
        <Link href="/web-applications" className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
          Add Web Application
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : recentScanResults.length > 0 ? (
            <div>
              {recentScanResults.map((scan) => (
                <div key={scan.id} className="mb-3 pb-3 border-b">
                  <p className="text-gray-700">
                    <span className="font-semibold">{scan.web_application.name}</span> - {formatDate(scan.scan_date)}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Status: {scan.status} | Vulnerabilities: {scan.vulnerabilities_count}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No recent scans. Start by adding a web application.</p>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Security Tips</h2>
          <ul className="list-disc pl-6 text-gray-700">
            <li className="mb-2">Always validate and sanitize user input</li>
            <li className="mb-2">Use parameterized queries to prevent SQL injection</li>
            <li className="mb-2">Implement proper Content Security Policy (CSP)</li>
            <li className="mb-2">Enable HTTPS across your entire site</li>
            <li className="mb-2">Keep your dependencies updated</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
