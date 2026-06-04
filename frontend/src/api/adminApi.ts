import api from './api';
import { toast } from 'sonner';

export interface Stats {
  // User stats
  myOpen?: number;
  myInProgress?: number;
  myResolved?: number;
  // Agent stats
  assignedOpen?: number;
  assignedInProgress?: number;
  assignedResolved?: number;
  // Admin stats
  totalTickets?: number;
  open?: number;
  inProgress?: number;
  resolved?: number;
  totalAgents?: number;
  pendingRegistrations?: number;
}

export interface StatsResponse {
  success: boolean;
  data: Stats;
}

export interface Agent {
  id: number;
  name: string;
  email: string;
}

export interface AgentsResponse {
  success: boolean;
  data: Agent[];
}

export interface RegistrationRequest {
  id: number;
  name: string;
  email: string;
  role: string;
  employeeId: string;
  createdAt: string;
}

export interface RegistrationRequestsResponse {
  success: boolean;
  count: number;
  data: RegistrationRequest[];
}

export const adminApi = {
  getStats: async (): Promise<Stats> => {
    try {
      const response = await api.get<StatsResponse>('/api/dashboard/stats');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch stats';
      toast.error(message);
      throw error;
    }
  },

  getAllTickets: async () => {
    try {
      const response = await api.get<{ success: boolean; data: any[]; count: number }>('/api/admin/tickets');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch all tickets';
      toast.error(message);
      throw error;
    }
  },

  getAgents: async (): Promise<Agent[]> => {
    try {
      const response = await api.get<AgentsResponse>('/api/admin/agents');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch agents';
      toast.error(message);
      throw error;
    }
  },

  getRegistrationRequests: async (): Promise<RegistrationRequest[]> => {
    try {
      const response = await api.get<RegistrationRequestsResponse>('/api/admin/registration-requests');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch registration requests';
      toast.error(message);
      throw error;
    }
  },

  approveRegistration: async (id: number): Promise<void> => {
    try {
      await api.put(`/api/admin/registration-requests/${id}/approve`);
      toast.success('User approved successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to approve user';
      toast.error(message);
      throw error;
    }
  },

  rejectRegistration: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/admin/registration-requests/${id}/reject`);
      toast.success('User rejected successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to reject user';
      toast.error(message);
      throw error;
    }
  },
};
