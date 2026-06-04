// src/api/auditApi.ts
import api from './api';
import { toast } from 'sonner';

export interface AuditLog {
  id: number;
  ticketId?: number;
  userId: number;
  action: string;
  createdAt: string;
  // Backend includes User as alias "actor" AND sometimes as "User"
  // We normalise both into .user in the API layer below
  user?: {
    id: number;
    name: string;
    email: string;
  };
  // Backend includes Ticket with { id, subject } — note: field is "subject" not "title"
  ticket?: {
    id: number;
    subject: string; // ← your Ticket model uses "subject"
  };
  // Raw aliases the backend might return — consumed internally
  User?: { id: number; name: string; email: string };
  actor?: { id: number; name: string; email: string };
  Ticket?: { id: number; subject: string };
}

/** Normalise the raw backend shape into a clean AuditLog */
function normalise(raw: AuditLog): AuditLog {
  return {
    ...raw,
    // Prefer explicit .user, fall back to Sequelize aliases "actor" or "User"
    user: raw.user ?? raw.actor ?? raw.User,
    // Ticket comes back as raw.Ticket (Sequelize default) or raw.ticket
    ticket: raw.ticket ?? raw.Ticket
      ? {
          id:    (raw.ticket ?? raw.Ticket)!.id,
          subject: (raw.ticket ?? raw.Ticket)!.subject,
        }
      : undefined,
  };
}

export const auditApi = {
  getAllAuditLogs: async (): Promise<AuditLog[]> => {
    try {
      const response = await api.get<{ success: boolean; data: AuditLog[] }>('/api/audit-logs');
      return (response.data.data ?? []).map(normalise);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch audit logs';
      toast.error(message);
      throw error;
    }
  },

  getTicketAuditLogs: async (ticketId: number): Promise<AuditLog[]> => {
    try {
      const response = await api.get<{ success: boolean; data: AuditLog[] }>(`/api/tickets/${ticketId}/audit`);
      return (response.data.data ?? []).map(normalise);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch audit logs';
      toast.error(message);
      throw error;
    }
  },
};