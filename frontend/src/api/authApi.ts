import api from './api';
import { toast } from 'sonner';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  employeeId: string;
  branchCode?: string;
  designation?: string;
  departmentId?: number;
}

export interface AuthResponse {
  success?: boolean;
  message?: string;
  token?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
    employeeId: string;
    branchCode?: string;
    designation?: string;
    departmentId?: number;
    status?: string;
    accountStatus?: string;
    organization?: string;
  };
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post<{ message: string; user: any; token: string }>('/api/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await api.post<{ message: string; user: any; token: string }>('/api/auth/register', data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  },

  getProfile: async (): Promise<any> => {
    try {
      const response = await api.get<{ success: boolean; data: any }>('/api/auth/profile');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch profile';
      toast.error(message);
      throw error;
    }
  },

  updateProfile: async (data: Partial<RegisterData>): Promise<any> => {
    try {
      const response = await api.put<{ success: boolean; data: any }>('/api/auth/profile', data);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
      throw error;
    }
  },
};
