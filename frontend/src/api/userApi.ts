import api from './api';
import { toast } from 'sonner';

export interface PendingUser {
  id: number;
  name: string;
  email: string;
  role: string;
  employeeId: string;
  branchCode?: string;
  departmentId?: number;
  designation?: string;
  status: string;
  accountStatus: string;
  organization: string;
  createdAt: string;
  department?: {
    id: number;
    name: string;
  };
}

export interface UserApprovalResponse {
  success: boolean;
  message: string;
  data: PendingUser;
}

export interface PendingUsersResponse {
  success: boolean;
  count: number;
  data: PendingUser[];
}

export interface AllUsersResponse {
  success: boolean;
  count: number;
  data: PendingUser[];
}

export const userApi = {
  getAllUsers: async (): Promise<AllUsersResponse> => {
    try {
      const response = await api.get<AllUsersResponse>('/api/users');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch users';
      toast.error(message);
      throw error;
    }
  },

  getPendingUsers: async (): Promise<PendingUsersResponse> => {
    try {
      const response = await api.get<PendingUsersResponse>('/api/users/pending');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch pending users';
      toast.error(message);
      throw error;
    }
  },

  approveUser: async (userId: number): Promise<UserApprovalResponse> => {
    try {
      const response = await api.patch<UserApprovalResponse>(`/api/users/${userId}/approve`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to approve user';
      toast.error(message);
      throw error;
    }
  },

  rejectUser: async (userId: number): Promise<UserApprovalResponse> => {
    try {
      const response = await api.patch<UserApprovalResponse>(`/api/users/${userId}/reject`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to reject user';
      toast.error(message);
      throw error;
    }
  },
};
