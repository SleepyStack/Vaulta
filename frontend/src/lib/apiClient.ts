import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

class APIClient {
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private readonly DELAY_BETWEEN_REQUESTS = 200;
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 30000,
    });

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error:  AxiosError) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            
            if (currentPath !== '/login' && currentPath !== '/register') {
              localStorage.removeItem('vaulta_token');
              localStorage.removeItem('vaulta_role');
              localStorage.removeItem('vaulta_email');
              localStorage.removeItem('vaulta_username');
              window.location.href = '/login';
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async request<T>(config: AxiosRequestConfig): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue. push(async () => {
        try {
          const token = localStorage.getItem('vaulta_token');
          const headers = {
            ... config.headers,
            ...(token && { Authorization: `Bearer ${token}` }),
            'Content-Type': 'application/json',
          };

          const response = await this.axiosInstance({ ...config, headers });
          resolve(response.data);
        } catch (error) {
          reject(error);
        }
      });

      if (! this.isProcessing) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    if (this.requestQueue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const request = this.requestQueue.shift();

    if (request) {
      await request();
      await new Promise(resolve => setTimeout(resolve, this.DELAY_BETWEEN_REQUESTS));
      this.processQueue();
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ... config, method: 'GET', url });
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  async delete<T>(url: string, config?:  AxiosRequestConfig): Promise<T> {
    return this. request<T>({ ...config, method: 'DELETE', url });
  }
}

export const apiClient = new APIClient();