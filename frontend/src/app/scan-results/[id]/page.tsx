"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ScanResult, Vulnerability, WebApplication, VulnerabilityTypeCount } from '../../../types';
import { fetchScanResult, fetchWebApplication } from '../../../services/api';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register Chart.js components
Chart.register(ArcElement, Tooltip, Legend);

export default function ScanResultDetailPage() {
  const params = useParams();
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [webApp, setWebApp] = useState<WebApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const scanId = Number(params.id);
        
        if (isNaN(scanId)) {
          throw new Error('Invalid scan ID');
        }
        
        const scanData = await fetchScanResult(scanId);
        setScanResult(scanData);
        
        // Fetch web application details
        const webAppData = await fetchWebApplication(scanData.web_application);
        setWebApp(webAppData);
        
      } catch (err) {
        console.error('Error fetching scan result:', err);
        setError('Failed to load scan result. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [params.id]);
  
  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading scan result...</div>;
  }
  
  if (error || !scanResult) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error || 'Scan result not found'}</p>
        <Link href="/scan-results" className="mt-4 inline-block text-blue-600">
          ← Back to Scan Results
        </Link>
      </div>
    );
  }
  
  // Group vulnerabilities by severity
  const vulnerabilitiesBySeverity = scanResult.vulnerabilities?.reduce<Record<string, Vulnerability[]>>((acc, vuln) => {
    if (!acc[vuln.severity]) {
      acc[vuln.severity] = [];
    }
    acc[vuln.severity].push(vuln);
    return acc;
  }, {}) || {};
  
  // Count vulnerability types
  const vulnerabilityTypeCounts: VulnerabilityTypeCount = scanResult.vulnerabilities?.reduce<VulnerabilityTypeCount>((acc, vuln) => {
    acc[vuln.type] = (acc[vuln.type] || 0) + 1;
    return acc;
  }, {}) || {};
  
  // Prepare data for the severity chart
  const severityChartData = {
    labels: ['Critical', 'High', 'Medium', 'Low', 'Info'],
    datasets: [
      {
        data: [
          vulnerabilitiesBySeverity.critical?.length || 0,
          vulnerabilitiesBySeverity.high?.length || 0,
          vulnerabilitiesBySeverity.medium?.length || 0,
          vulnerabilitiesBySeverity.low?.length || 0,
          vulnerabilitiesBySeverity.info?.length || 0,
        ],
        backgroundColor: [
          '#ef4444', // red-500 (critical)
          '#f97316', // orange-500 (high)
          '#eab308', // yellow-500 (medium)
          '#3b82f6', // blue-500 (low)
          '#9ca3af', // gray-400 (info)
        ],
      },
    ],
  };
  
  // Helper function to get human-readable vulnerability type names
  const getReadableTypeName = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  return (
    <div>
      <div className="mb-8">
        <Link href="/scan-results" className="text-blue-600">
          ← Back to Scan Results
        </Link>
        <h1 className="text-3xl font-bold mt-2">Scan Result</h1>
        <p className="text-gray-600">
          {new Date(scanResult.scan_date).toLocaleString()}
        </p>
      </div>
      
      {/* Summary Card */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold mb-2">
              {webApp?.name || 'Web Application'}
            </h2>
            <p className="text-gray-600">
              <a 
                href={webApp?.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {webApp?.url}
              </a>
            </p>
            <div className="mt-4">
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                ${scanResult.status === 'completed' ? 'bg-green-100 text-green-800' : 
                scanResult.status === 'failed' ? 'bg-red-100 text-red-800' : 
                scanResult.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                'bg-gray-100 text-gray-800'}`}>
                {scanResult.status}
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-4xl font-bold mb-1">
              {scanResult.vulnerabilities?.length || 0}
            </div>
            <div className="text-gray-600">Vulnerabilities Found</div>
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Summary</h3>
          <p>{scanResult.summary || 'No summary available'}</p>
        </div>
      </div>
      
      {/* Chart and Stats */}
      {scanResult.vulnerabilities && scanResult.vulnerabilities.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Severity Breakdown</h2>
            <div className="h-64">
              <Pie data={severityChartData} />
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Vulnerability Types</h2>
            <div className="space-y-4">
              {Object.entries(vulnerabilityTypeCounts).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <div>{getReadableTypeName(type)}</div>
                  <div className="flex items-center">
                    <div className="h-2.5 w-32 bg-gray-200 rounded-full mr-2">
                      <div 
                        className="h-2.5 bg-blue-600 rounded-full" 
                        style={{ 
                          width: `${(count / (scanResult.vulnerabilities?.length || 1)) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600">{count}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Vulnerabilities List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-6 border-b">Vulnerabilities</h2>
        
        {scanResult.vulnerabilities && scanResult.vulnerabilities.length > 0 ? (
          <div className="divide-y">
            {['critical', 'high', 'medium', 'low', 'info'].map(severity => (
              vulnerabilitiesBySeverity[severity] && vulnerabilitiesBySeverity[severity].length > 0 && (
                <div key={severity} className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <span className={`inline-block w-3 h-3 rounded-full mr-2 
                      ${severity === 'critical' ? 'bg-red-500' : 
                      severity === 'high' ? 'bg-orange-500' : 
                      severity === 'medium' ? 'bg-yellow-500' : 
                      severity === 'low' ? 'bg-blue-500' : 
                      'bg-gray-400'}`}>
                    </span>
                    {severity.charAt(0).toUpperCase() + severity.slice(1)} ({vulnerabilitiesBySeverity[severity].length})
                  </h3>
                  
                  <div className="space-y-4">
                    {vulnerabilitiesBySeverity[severity].map(vuln => (
                      <div key={vuln.id} className="bg-gray-50 p-4 rounded">
                        <h4 className="font-semibold">{vuln.name}</h4>
                        <p className="text-gray-600 mb-2">{vuln.description}</p>
                        
                        {vuln.url && (
                          <div className="text-sm mt-2">
                            <span className="font-semibold">URL:</span> {vuln.url}
                          </div>
                        )}
                        
                        {vuln.parameter && (
                          <div className="text-sm mt-2">
                            <span className="font-semibold">Parameter:</span> {vuln.parameter}
                          </div>
                        )}
                        
                        {vuln.evidence && (
                          <div className="text-sm mt-2">
                            <span className="font-semibold">Evidence:</span>
                            <pre className="bg-gray-200 p-2 rounded mt-1 overflow-x-auto text-xs">{vuln.evidence}</pre>
                          </div>
                        )}
                        
                        {vuln.mitigation && (
                          <div className="text-sm mt-2">
                            <span className="font-semibold">Mitigation:</span>
                            <div className="bg-blue-50 p-2 rounded mt-1 text-blue-800">{vuln.mitigation}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            {scanResult.status === 'completed' 
              ? 'No vulnerabilities found. Great job!' 
              : 'Vulnerabilities will appear here once the scan is complete.'}
          </div>
        )}
      </div>
    </div>
  );
} 