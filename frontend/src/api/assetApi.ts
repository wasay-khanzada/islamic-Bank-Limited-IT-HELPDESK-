import api from './api';
import { toast } from 'sonner';

export interface Asset {
  id: number;
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssetsResponse {
  success: boolean;
  data: Asset[];
}

export const assetApi = {
  getAssets: async (): Promise<AssetsResponse> => {
    const response = await api.get<AssetsResponse>('/api/assets');
    return response.data;
  },

  getMyAssets: async (): Promise<AssetsResponse> => {
    try {
      const response = await api.get<AssetsResponse>('/api/assets/my');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch your assets';
      toast.error(message);
      throw error;
    }
  },
};
