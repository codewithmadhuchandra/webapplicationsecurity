export interface WebApplication {
  id: number;
  name: string;
  url: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  scan_results?: ScanResult[];
}

export interface ScanResult {
  id: number;
  web_application: number;
  scan_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  summary: string | null;
  vulnerabilities?: Vulnerability[];
}

export interface Vulnerability {
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

export interface SeverityCount {
  info: number;
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface VulnerabilityTypeCount {
  [key: string]: number;
}

export interface WebApplicationFormData {
  name: string;
  url: string;
  description?: string;
} 