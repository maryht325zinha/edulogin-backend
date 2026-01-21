
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface Site {
  id: string;
  name: string;
  url: string;
  icon: string;
  description: string;
}

export interface Credential {
  id: string;
  userId: string;
  siteId: string;
  login: string;
  passwordEncrypted: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}
