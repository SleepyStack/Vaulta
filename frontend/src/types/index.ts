// Authentication Response
export interface AuthResponse {
  token: string;
  refreshToken: string;
  username: string; //  'email' from SecureUser.getUsername()
  role: 'USER' | 'ADMIN';
  tokenVersion: number;
}

// User Profile (Matches User.java)
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED'; 
  tokenVersion: number;
}

// Transaction (Matches Transaction.java)
export interface Transaction {
  id: number;
  type: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER';
  amount: number;
  fromAccountNumber?: string;
  toAccountNumber?: string;
  timestamp: string; 
}