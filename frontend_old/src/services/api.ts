import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  ComplianceScore,
  DashboardData,
  UploadResponse,
  HealthResponse,
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add any auth tokens here if needed
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleError(error: AxiosError): void {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
    } else {
      // Error in request setup
      console.error('Request Error:', error.message);
    }
  }

  // Health check
  async healthCheck(): Promise<HealthResponse> {
    const { data } = await this.client.get<HealthResponse>('/');
    return data;
  }

  // Upload PDF file
  async uploadPDF(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await this.client.post<UploadResponse>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  }

  // Upload PDF from URL
  async uploadPDFFromURL(url: string): Promise<UploadResponse> {
    const { data } = await this.client.post<UploadResponse>('/upload-url', null, {
      params: { url },
    });
    return data;
  }

  // Get compliance score
  async getComplianceScore(standard?: string): Promise<ComplianceScore> {
    const { data } = await this.client.get<ComplianceScore>('/compliance-score', {
      params: standard ? { standard } : undefined,
    });
    return data;
  }

  // Get dashboard data
  async getDashboardData(): Promise<DashboardData> {
    const { data } = await this.client.get<DashboardData>('/dashboard');
    return data;
  }

  // Get violations
  async getViolations(standard?: string): Promise<{
    by_severity: Record<string, number>;
    by_category: Record<string, number>;
  }> {
    const { data } = await this.client.get('/violations', {
      params: standard ? { standard } : undefined,
    });
    return data;
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export class for testing
export default ApiService;

// Made with Bob
