import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Web application APIs
export const fetchWebApplications = async () => {
  const response = await api.get('/web-apps/');
  return response.data;
};

export const fetchWebApplication = async (id: number) => {
  const response = await api.get(`/web-apps/${id}/`);
  return response.data;
};

export const createWebApplication = async (data: { name: string; url: string; description?: string }) => {
  const response = await api.post('/web-apps/', data);
  return response.data;
};

export const scanWebApplication = async (id: number) => {
  const response = await api.post(`/web-apps/${id}/scan/`);
  return response.data;
};

// Scan result APIs
export const fetchScanResults = async (webAppId?: number) => {
  const url = webAppId ? `/scan-results/?web_application=${webAppId}` : '/scan-results/';
  const response = await api.get(url);
  return response.data;
};

export const fetchScanResult = async (id: number) => {
  const response = await api.get(`/scan-results/${id}/`);
  return response.data;
};

// Vulnerability APIs
export const fetchVulnerabilities = async (scanResultId?: number) => {
  const url = scanResultId ? `/vulnerabilities/?scan_result=${scanResultId}` : '/vulnerabilities/';
  const response = await api.get(url);
  return response.data;
};

export default api; 