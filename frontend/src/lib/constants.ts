/**
 * API Configuration Constants
 * 
 * These constants centralize all API endpoints and configuration. 
 * The base URL is read from environment variables.
 */

export const API_BASE_URL = process. env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH:  {
    REGISTER: `${API_BASE_URL}/api/v1/auth/register`,
    LOGIN: `${API_BASE_URL}/api/v1/auth/login`,
    LOGOUT: `${API_BASE_URL}/api/v1/auth/logout`,
  },

  // User
  USER: {
    PROFILE: `${API_BASE_URL}/api/v1/users/profile`,
    CHANGE_PASSWORD: `${API_BASE_URL}/api/v1/users/change-password`,
    DELETE: (id: number) => `${API_BASE_URL}/api/v1/users/${id}`,
  },

  // Accounts
  ACCOUNTS: {
    MY_ACCOUNTS: `${API_BASE_URL}/api/v1/accounts/me`,
    OPEN:  `${API_BASE_URL}/api/v1/accounts/open`,
    DETAILS: (accountNumber: string) => `${API_BASE_URL}/api/v1/accounts/${accountNumber}`,
    CLOSE: (accountNumber: string) => `${API_BASE_URL}/api/v1/accounts/${accountNumber}`,
  },

  // Transactions
  TRANSACTIONS: {
    DEPOSIT: `${API_BASE_URL}/api/v1/transactions/deposit`,
    WITHDRAW: `${API_BASE_URL}/api/v1/transactions/withdraw`,
    TRANSFER: `${API_BASE_URL}/api/v1/transactions/transfer`,
    HISTORY: (accountNumber: string, page: number = 0, size: number = 20) => 
      `${API_BASE_URL}/api/v1/transactions/${accountNumber}/history?page=${page}&size=${size}`,
  },

  // Dashboard
  DASHBOARD: {
    SUMMARY: `${API_BASE_URL}/api/v1/dashboard/summary`,
  },

  // Admin
  ADMIN: {
    STATS: `${API_BASE_URL}/api/v1/admin/stats`,
    USERS: `${API_BASE_URL}/api/v1/admin/users`,
    ACCOUNTS: `${API_BASE_URL}/api/v1/admin/accounts`,
    TRANSACTIONS: (page: number = 0, size: number = 20) => 
      `${API_BASE_URL}/api/v1/admin/transactions?page=${page}&size=${size}`,
    TOGGLE_USER_STATUS: (id: number) => `${API_BASE_URL}/api/v1/admin/users/${id}/status`,
    UPDATE_USER_STATUS: (userId: number) => `${API_BASE_URL}/api/v1/admin/users/${userId}/status-update`,
    UPDATE_ACCOUNT_STATUS: (accountNumber:  string) => `${API_BASE_URL}/api/v1/admin/accounts/${accountNumber}/status`,
    PROMOTE_USER: (userId: number) => `${API_BASE_URL}/api/v1/admin/users/${userId}/promote`,
    RESET_PASSWORD: (userId: number) => `${API_BASE_URL}/api/v1/admin/users/${userId}/reset-password`,
  },
} as const;

/**
 * Helper function to build query parameters
 */
export function buildQueryParams(params: Record<string, any>): string {
  const queryString = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  
  return queryString ? `?${queryString}` : '';
}