"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";

interface Vulnerability {
  id: number;
  name: string;
  type: string;
  description: string;
  severity: string;
  location: string;
  remediation: string;
  date_discovered: string;
  web_application: number;
}

export default function VulnerabilitiesPage() {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVulnerabilities = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/vulnerabilities/');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setVulnerabilities(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch vulnerabilities");
        setLoading(false);
        console.error(err);
      }
    };

    fetchVulnerabilities();
  }, []);

  // Function to get color class based on severity
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-black';
      case 'low':
        return 'bg-blue-400 text-black';
      case 'info':
        return 'bg-gray-300 text-black';
      default:
        return 'bg-gray-200 text-black';
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Vulnerabilities</h1>
      
      {loading ? (
        <p className="text-gray-800">Loading vulnerabilities...</p>
      ) : error ? (
        <div>
          <p className="text-red-500 mb-4">{error}</p>
          <div className="mb-8">
            <p className="text-gray-800 mb-2">No vulnerabilities data available. You may need to:</p>
            <ul className="list-disc pl-5 text-gray-800 mb-4">
              <li>Add web applications for scanning</li>
              <li>Run security scans on your applications</li>
            </ul>
            <Link 
              href="/web-applications"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Web Application
            </Link>
          </div>
        </div>
      ) : vulnerabilities.length === 0 ? (
        <div>
          <p className="text-gray-800 mb-4">No vulnerabilities have been found yet.</p>
          <p className="text-gray-800 mb-4">Add web applications and run security scans to detect vulnerabilities.</p>
          <Link 
            href="/web-applications"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Web Application
          </Link>
        </div>
      ) : (
        <div>
          <p className="text-gray-800 mb-4">Found {vulnerabilities.length} vulnerabilities across your applications.</p>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg shadow-md">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="border px-4 py-2">Severity</th>
                  <th className="border px-4 py-2">Name</th>
                  <th className="border px-4 py-2">Type</th>
                  <th className="border px-4 py-2">Description</th>
                  <th className="border px-4 py-2">Location</th>
                  <th className="border px-4 py-2">Remediation</th>
                </tr>
              </thead>
              <tbody>
                {vulnerabilities.map((vulnerability) => (
                  <tr key={vulnerability.id} className="hover:bg-gray-50">
                    <td className={`border px-4 py-2 text-center ${getSeverityColor(vulnerability.severity)}`}>
                      {vulnerability.severity}
                    </td>
                    <td className="border px-4 py-2 text-gray-800 font-medium">{vulnerability.name}</td>
                    <td className="border px-4 py-2 text-gray-800">{vulnerability.type}</td>
                    <td className="border px-4 py-2 text-gray-800">{vulnerability.description}</td>
                    <td className="border px-4 py-2 text-gray-800">{vulnerability.location}</td>
                    <td className="border px-4 py-2 text-gray-800">{vulnerability.remediation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <div className="mt-12 mb-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Common Vulnerability Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">SQL Injection</h3>
            <p className="text-gray-800">Occurs when untrusted data is sent to an interpreter as part of a command or query. Attackers can execute unauthorized SQL commands to access, modify, or delete data.</p>
          </div>
          
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Cross-Site Scripting (XSS)</h3>
            <p className="text-gray-800">Allows attackers to inject client-side scripts into web pages viewed by others. This can be used to bypass access controls or steal user information.</p>
          </div>
          
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Cross-Site Request Forgery (CSRF)</h3>
            <p className="text-gray-800">Forces an end user to execute unwanted actions on a web application in which they're authenticated. Attacks target state-changing requests.</p>
          </div>
          
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Sensitive Data Exposure</h3>
            <p className="text-gray-800">Occurs when an application doesn't adequately protect sensitive information such as financial data, healthcare information, or passwords.</p>
          </div>
          
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Missing Security Headers</h3>
            <p className="text-gray-800">HTTP security headers help secure websites against various attacks like XSS, clickjacking, and more. Missing headers can leave your site vulnerable.</p>
          </div>
          
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Insecure Cookies</h3>
            <p className="text-gray-800">Cookies without proper security flags (HttpOnly, Secure, SameSite) can be vulnerable to theft or manipulation, potentially exposing user sessions.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 