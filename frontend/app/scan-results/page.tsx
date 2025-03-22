"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

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

interface WebApplication {
  id: number;
  name: string;
  url: string;
}

export default function ScanResultsPage() {
  const searchParams = useSearchParams();
  const appId = searchParams.get("appId");
  
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [applications, setApplications] = useState<WebApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAppId, setSelectedAppId] = useState<string | null>(appId);

  // Fetch scan results and applications
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch applications
        const appsResponse = await fetch("http://127.0.0.1:8000/api/web-applications/");
        if (!appsResponse.ok) {
          throw new Error("Failed to fetch web applications");
        }
        const appsData = await appsResponse.json();
        setApplications(appsData);
        
        // Fetch scan results based on app id if present
        const scanUrl = selectedAppId 
          ? `http://127.0.0.1:8000/api/web-applications/${selectedAppId}/scans/`
          : "http://127.0.0.1:8000/api/scan-results/";
          
        const scanResponse = await fetch(scanUrl);
        if (!scanResponse.ok) {
          throw new Error("Failed to fetch scan results");
        }
        const scanData = await scanResponse.json();
        setScanResults(scanData);
        
        setError("");
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedAppId]);

  // Function to start a new scan
  const startNewScan = async (appId: number) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/web-applications/${appId}/scan/`, {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Failed to start scan");
      }
      
      // Refresh scan results
      const scanUrl = `http://127.0.0.1:8000/api/web-applications/${appId}/scans/`;
      const scanResponse = await fetch(scanUrl);
      if (scanResponse.ok) {
        const scanData = await scanResponse.json();
        setScanResults(scanData);
      }
      
      alert("Scan started successfully!");
    } catch (err) {
      console.error("Error starting scan:", err);
      alert("Failed to start scan. Please try again.");
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Scan Results</h1>
      
      {applications.length > 0 && (
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="application">
            Select Web Application:
          </label>
          <div className="flex space-x-4">
            <select
              id="application"
              value={selectedAppId || ""}
              onChange={(e) => setSelectedAppId(e.target.value || null)}
              className="p-2 border border-gray-300 rounded w-64"
            >
              <option value="">All Applications</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.name}
                </option>
              ))}
            </select>
            
            {selectedAppId && (
              <button
                onClick={() => startNewScan(Number(selectedAppId))}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Start New Scan
              </button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">
          <p className="text-gray-600">Loading scan results...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      ) : scanResults.length > 0 ? (
        <div>
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="py-3 px-4 text-left">ID</th>
                <th className="py-3 px-4 text-left">Web Application</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Vulnerabilities</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {scanResults.map((scan) => (
                <tr key={scan.id} className="border-b hover:bg-gray-100">
                  <td className="py-3 px-4">{scan.id}</td>
                  <td className="py-3 px-4">{scan.web_application.name}</td>
                  <td className="py-3 px-4">{formatDate(scan.scan_date)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-white ${
                      scan.status === 'Completed' ? 'bg-green-500' : 
                      scan.status === 'In Progress' ? 'bg-blue-500' : 'bg-yellow-500'
                    }`}>
                      {scan.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{scan.vulnerabilities_count}</td>
                  <td className="py-3 px-4">
                    <Link 
                      href={`/vulnerabilities?scanId=${scan.id}`}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <p className="text-gray-600 mb-4">No scan results available.</p>
          
          {applications.length > 0 ? (
            <div>
              <p className="text-gray-600 mb-4">Select a web application and start a new scan.</p>
              {!selectedAppId && (
                <Link 
                  href="/web-applications"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Go to Web Applications
                </Link>
              )}
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">Add a web application to start scanning.</p>
              <Link 
                href="/web-applications"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Add Web Application
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 