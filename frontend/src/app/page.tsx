"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchWebApplications, fetchScanResults, fetchVulnerabilities } from '@/services/api';
import { WebApplication, ScanResult, Vulnerability, SeverityCount } from '@/types';

export default function Dashboard() {
  const [webApps, setWebApps] = useState<WebApplication[]>([]);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [webAppsData, scanResultsData, vulnerabilitiesData] = await Promise.all([
          fetchWebApplications(),
          fetchScanResults(),
          fetchVulnerabilities()
        ]);
        setWebApps(webAppsData);
        setScanResults(scanResultsData);
        setVulnerabilities(vulnerabilitiesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate summary counts
  const recentScans = scanResults.slice(0, 5);
  const criticalVulnerabilities = vulnerabilities.filter(v => v.severity === 'critical');
  
  const severityCounts: SeverityCount = vulnerabilities.reduce((acc, vuln) => {
    acc[vuln.severity as keyof SeverityCount]++;
    return acc;
  }, { info: 0, low: 0, medium: 0, high: 0, critical: 0 });

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading dashboard data...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <button 
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded" 
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Security Dashboard</h1>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Web Applications</h2>
          <p className="text-4xl font-bold">{webApps.length}</p>
          <Link href="/web-applications" className="text-blue-600 mt-2 inline-block">View all →</Link>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Completed Scans</h2>
          <p className="text-4xl font-bold">
            {scanResults.filter(scan => scan.status === 'completed').length}
          </p>
          <Link href="/scan-results" className="text-blue-600 mt-2 inline-block">View all →</Link>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Total Vulnerabilities</h2>
          <p className="text-4xl font-bold">{vulnerabilities.length}</p>
          <Link href="/vulnerabilities" className="text-blue-600 mt-2 inline-block">View all →</Link>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Critical Issues</h2>
          <p className="text-4xl font-bold text-red-600">{criticalVulnerabilities.length}</p>
          <Link 
            href="/vulnerabilities?severity=critical" 
            className="text-blue-600 mt-2 inline-block"
          >
            View all →
          </Link>
        </div>
      </div>

      {/* Severity breakdown */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Vulnerability Severity Breakdown</h2>
        <div className="grid grid-cols-5 gap-4">
          <div className="text-center">
            <div className="bg-gray-200 rounded-full h-20 w-20 flex items-center justify-center mx-auto">
              <span className="text-gray-700 text-xl font-bold">{severityCounts.info}</span>
            </div>
            <p className="mt-2">Info</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-200 rounded-full h-20 w-20 flex items-center justify-center mx-auto">
              <span className="text-blue-700 text-xl font-bold">{severityCounts.low}</span>
            </div>
            <p className="mt-2">Low</p>
          </div>
          <div className="text-center">
            <div className="bg-yellow-200 rounded-full h-20 w-20 flex items-center justify-center mx-auto">
              <span className="text-yellow-700 text-xl font-bold">{severityCounts.medium}</span>
            </div>
            <p className="mt-2">Medium</p>
          </div>
          <div className="text-center">
            <div className="bg-orange-200 rounded-full h-20 w-20 flex items-center justify-center mx-auto">
              <span className="text-orange-700 text-xl font-bold">{severityCounts.high}</span>
            </div>
            <p className="mt-2">High</p>
          </div>
          <div className="text-center">
            <div className="bg-red-200 rounded-full h-20 w-20 flex items-center justify-center mx-auto">
              <span className="text-red-700 text-xl font-bold">{severityCounts.critical}</span>
            </div>
            <p className="mt-2">Critical</p>
          </div>
        </div>
      </div>

      {/* Recent scans */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Scans</h2>
        {recentScans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Web Application
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vulnerabilities
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentScans.map((scan) => {
                  // Find the web app for this scan
                  const webApp = webApps.find(app => app.id === scan.web_application);
                  // Count vulnerabilities for this scan
                  const vulnCount = vulnerabilities.filter(v => 
                    v.id === scan.id
                  ).length;
                  
                  return (
                    <tr key={scan.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {webApp?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(scan.scan_date).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${scan.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            scan.status === 'failed' ? 'bg-red-100 text-red-800' : 
                            scan.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                            'bg-gray-100 text-gray-800'}`}>
                          {scan.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {vulnCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/scan-results/${scan.id}`} className="text-blue-600">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No scan results yet.</p>
        )}
      </div>
    </div>
  );
} 