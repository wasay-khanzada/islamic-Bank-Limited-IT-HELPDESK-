import api from './api';
import { toast } from 'sonner';

export interface TicketData {
  title: string;
  description: string;
  categoryId: number;
  assetId?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  attachment?: File;
}

export interface Ticket {
  id: number;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  categoryId: number;
  created_by: number;
  assigned_to?: number;
  department_id?: number;
  createdAt: string;
  updatedAt: string;
  slaDeadline?: string;
  slaStatus?: string;
  attachment?: string;
  assetId?: number;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
  assignedAgent?: {
    id: number;
    name: string;
    email: string;
  };
  category?: {
    id: number;
    name: string;
  };
  department?: {
    id: number;
    name: string;
  };
  asset?: {
    id: number;
    name: string;
    type: string;
  };
  comments?: any[];
  logs?: any[];
}

export const ticketApi = {
  createTicket: async (formData: FormData): Promise<Ticket> => {
    try {
      const response = await api.post<{ success: boolean; data: Ticket }>('/api/tickets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Ticket created successfully');
      return response.data.data;
    } catch (error: any) {
      console.log("Full error response:", error.response?.data); // ← add this
      const message = error.response?.data?.message || 'Failed to create ticket';
      toast.error(message);
      throw error;
    }
  },

  getAllTickets: async (): Promise<Ticket[]> => {
    try {
      const response = await api.get<{ success: boolean; data: Ticket[] }>('/api/tickets');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch tickets';
      toast.error(message);
      throw error;
    }
  },

  getMyTickets: async (): Promise<Ticket[]> => {
    try {
      const response = await api.get<{ success: boolean; data: Ticket[] }>('/api/tickets/my');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch your tickets';
      toast.error(message);
      throw error;
    }
  },

  getAssignedTickets: async (): Promise<Ticket[]> => {
    try {
      const response = await api.get<{ success: boolean; data: Ticket[] }>('/api/tickets/assigned');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch assigned tickets';
      toast.error(message);
      throw error;
    }
  },

  getTicketById: async (id: number, param?: string): Promise<Ticket> => {
    try {
      const response = await api.get<{ success: boolean; data: Ticket }>(`/api/tickets/${id}`);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch ticket details';
      toast.error(message);
      throw error;
    }
  },

  getAuditLog: async (id: number): Promise<any[]> => {
    try {
      const response = await api.get<{ success: boolean; data: any[] }>(`/api/tickets/${id}/audit`);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch audit log';
      toast.error(message);
      throw error;
    }
  },

  assignTicket: async (ticketId: number, agentId: number): Promise<Ticket> => {
    try {
      const response = await api.put<{ success: boolean; data: Ticket }>(`/api/tickets/assign/${ticketId}`, { agentId });
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to assign ticket';
      toast.error(message);
      throw error;
    }
  },

  updateStatus: async (id: number, status: string): Promise<Ticket> => {
    try {
      const response = await api.put<{ success: boolean; data: Ticket }>(`/api/tickets/status/${id}`, { status });
      toast.success('Status updated successfully');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update status';
      toast.error(message);
      throw error;
    }
  },

  deleteTicket: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/tickets/${id}`);
      toast.success('Ticket deleted successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete ticket';
      toast.error(message);
      throw error;
    }
  },

  addComment: async (ticketId: number, body: string): Promise<any> => {
    try {
      const response = await api.post<{ success: boolean; data: any }>('/api/tickets/comment', { ticketId, body });
      toast.success('Comment added');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add comment';
      toast.error(message);
      throw error;
    }
  },
};
