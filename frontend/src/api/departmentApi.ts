// src/api/departmentApi.ts
import api from './api';

export interface Department {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  agentCount?: number;       // agents with role="agent" assigned to this dept
  openTickets?: number;      // tickets with status open | in-progress
  resolvedCount?: number;    // tickets resolved/closed THIS calendar month
  resolvedAllTime?: number;  // all-time resolved/closed (used for resolution rate %)
  totalTickets?: number;     // all-time total tickets for this dept (resolution rate denominator)
  status?: 'active' | 'inactive';
}

export interface DepartmentsResponse {
  success: boolean;
  data: Department[];
}

export interface DepartmentResponse {
  success: boolean;
  data: Department;
}

export const departmentApi = {
  /** GET /api/departments */
  getDepartments: async (): Promise<DepartmentsResponse> => {
    const response = await api.get<DepartmentsResponse>('/api/departments');
    return response.data;
  },

  /** GET /api/departments/:id */
  getDepartmentById: async (id: number): Promise<Department> => {
    const response = await api.get<DepartmentResponse>(`/api/departments/${id}`);
    return response.data.data;
  },

  /** POST /api/departments */
  createDepartment: async (payload: Pick<Department, 'name'> & Partial<Department>): Promise<Department> => {
    const response = await api.post<DepartmentResponse>('/api/departments', payload);
    return response.data.data;
  },

  /** PUT /api/departments/:id */
  updateDepartment: async (id: number, payload: Partial<Department>): Promise<Department> => {
    const response = await api.put<DepartmentResponse>(`/api/departments/${id}`, payload);
    return response.data.data;
  },

  /** DELETE /api/departments/:id */
  deleteDepartment: async (id: number): Promise<void> => {
    await api.delete(`/api/departments/${id}`);
  },
};