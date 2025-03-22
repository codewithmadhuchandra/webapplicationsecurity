"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { WebApplication, WebApplicationFormData } from '../../types';
import { fetchWebApplications, createWebApplication, scanWebApplication } from '../../services/api';

export default function WebApplicationsPage() {
  const [webApps, setWebApps] = useState<WebApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [scanning, setScanning] = useState<number | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<WebApplicationFormData>();

  useEffect(() => {
    loadWebApplications();
  }, []);

  const loadWebApplications = async () => {
    try {
      setLoading(true);
      const data = await fetchWebApplications();
      setWebApps(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching web applications:', err);
      setError('Failed to load web applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: WebApplicationFormData) => {
    try {
      const newWebApp = await createWebApplication(data);
      setWebApps([...webApps, newWebApp]);
      setShowAddForm(false);
      reset();
    } catch (err) {
      console.error('Error creating web application:', err);
      setError('Failed to create web application. Please try again.');
    }
  };

  const handleScan = async (id: number) => {
    try {
      setScanning(id);
      await scanWebApplication(id);
      // Refresh the list after starting a scan
      await loadWebApplications();
    } catch (err) {
      console.error('Error initiating scan:', err);
      setError('Failed to initiate scan. Please try again.');
    } finally {
      setScanning(null);
    }
  };

  if (loading && webApps.length === 0) {
    return <div className="flex justify-center items-center h-64">Loading web applications...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Web Applications</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : 'Add New Web Application'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}

      {showAddForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Web Application</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                type="text"
                {...register('name', { required: 'Name is required' })}
                className={`w-full px-3 py-2 border rounded ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Application name"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="url">
                URL
              </label>
              <input
                id="url"
                type="url"
                {...register('url', { 
                  required: 'URL is required',
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: 'URL must start with http:// or https://'
                  }
                })}
                className={`w-full px-3 py-2 border rounded ${errors.url ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="https://example.com"
              />
              {errors.url && (
                <p className="text-red-500 text-xs mt-1">{errors.url.message}</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                Description (optional)
              </label>
              <textarea
                id="description"
                {...register('description')}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                rows={3}
                placeholder="Brief description of the web application"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="mr-4 px-4 py-2 border border-gray-300 rounded"
                onClick={() => {
                  setShowAddForm(false);
                  reset();
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Web Application'}
              </button>
            </div>
          </form>
        </div>
      )}

      {webApps.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500 mb-4">No web applications added yet.</p>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => setShowAddForm(true)}
          >
            Add Your First Web Application
          </button>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Scan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vulnerabilities
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {webApps.map((app) => {
                const latestScan = app.scan_results?.[0];
                const vulnCount = latestScan?.vulnerabilities?.length || 0;
                
                return (
                  <tr key={app.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/web-applications/${app.id}`} className="text-blue-600 hover:underline">
                        {app.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a 
                        href={app.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {app.url}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {latestScan ? (
                        <div>
                          <div>{new Date(latestScan.scan_date).toLocaleString()}</div>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${latestScan.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            latestScan.status === 'failed' ? 'bg-red-100 text-red-800' : 
                            latestScan.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                            'bg-gray-100 text-gray-800'}`}>
                            {latestScan.status}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500">Never</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {latestScan?.status === 'completed' ? vulnCount : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className="bg-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-green-700 disabled:opacity-50"
                        onClick={() => handleScan(app.id)}
                        disabled={scanning === app.id || latestScan?.status === 'in_progress'}
                      >
                        {scanning === app.id ? 'Starting Scan...' : 'Scan Now'}
                      </button>
                      {latestScan && (
                        <Link 
                          href={`/scan-results/${latestScan.id}`}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                          View Report
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 