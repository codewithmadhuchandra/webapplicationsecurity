"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import WebScanner from "./WebScanner";

interface WebApplication {
  id: number;
  name: string;
  url: string;
  description: string;
}

export default function WebApplicationsPage() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [webApps, setWebApps] = useState<WebApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newAppData, setNewAppData] = useState({ name: "", url: "", description: "" });
  const [scanning, setScanning] = useState<number | null>(null);
  const router = useRouter();

  // Define the base API URL
  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  // Fetch web applications from backend
  useEffect(() => {
    const fetchWebApplications = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/web-applications/`);
        if (!response.ok) {
          throw new Error("Failed to fetch web applications");
        }
        const data = await response.json();
        setWebApps(data);
        setError("");
      } catch (err) {
        console.error("Error fetching web applications:", err);
        setError("Failed to load web applications. Please ensure the backend server is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchWebApplications();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/web-applications/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          url,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add web application");
      }

      const newWebApp = await response.json();
      
      // Run a scan for the new web application
      const scanResponse = await fetch(`${API_BASE_URL}/web-applications/${newWebApp.id}/scan/`, {
        method: "POST",
      });
      
      if (!scanResponse.ok) {
        console.error("Failed to start scan, but web application was added");
      }

      // Reset form and update list
      setName("");
      setUrl("");
      setDescription("");
      setShowForm(false);
      setWebApps([...webApps, newWebApp]);
    } catch (err) {
      console.error("Error adding web application:", err);
      alert("Failed to add web application. Please try again.");
    }
  };

  const handleScan = async (appId: number) => {
    setScanning(appId);
    
    try {
      const response = await fetch(`${API_BASE_URL}/web-applications/${appId}/scan/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to initiate scan");
      }

      const scanResult = await response.json();
      
      // Keep the scanning indicator for at least 2 seconds
      setTimeout(() => {
        setScanning(null);
        router.push(`/scan-results?appId=${appId}`);
      }, 2000);
      
    } catch (err) {
      console.error("Error scanning web application:", err);
      setTimeout(() => {
        setScanning(null);
      }, 2000);
      setError("Failed to initiate scan. Please try again.");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Web Applications</h1>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "Add New Web Application"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Web Application</h2>
          <form>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="name">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="url">
                URL
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="https://example.com"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="description">
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                rows={3}
              />
            </div>
            <WebScanner onSubmit={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)} />
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">
          <p className="text-gray-600">Loading web applications...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      ) : webApps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {webApps.map((app) => (
            <div key={app.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-blue-500 py-2 px-4 text-white">
                <h3 className="text-lg font-semibold">{app.name}</h3>
              </div>
              <div className="p-4">
                <p className="text-gray-500 mb-2">
                  <a href={app.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {app.url}
                  </a>
                </p>
                {app.description && <p className="text-gray-600 mb-4">{app.description}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleScan(app.id)}
                    disabled={scanning === app.id}
                    className={`px-3 py-1 rounded text-white ${scanning === app.id ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-600'}`}
                  >
                    {scanning === app.id ? 'Scanning...' : 'Scan Now'}
                  </button>
                  <Link 
                    href={`/scan-results?appId=${app.id}`}
                    className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded"
                  >
                    View Scan Results
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-600 mb-4">No web applications have been added yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Your First Web Application
          </button>
        </div>
      )}

      {/* Scanning overlay */}
      {scanning !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-800">Scanning website...</p>
            <p className="text-gray-600">This may take a few moments</p>
          </div>
        </div>
      )}
    </div>
  );
} 