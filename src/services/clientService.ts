import { apiClient } from './apiClient';
import { 
  ClientListItem, 
  ClientListResponseData, 
  UpdateClientStatusResponseData, 
  ApiSuccessResponse 
} from '../types';

export interface ClientListQueryParams {
  status?: 'ACTIVE' | 'BLOCKED';
  page?: number;
  per_page?: number;
}

export const clientService = {
  /**
   * 8. List clients (Admin / Superadmin only)
   * GET /api/v1/users/clients
   */
  async getClients(params?: ClientListQueryParams): Promise<ClientListResponseData> {
    const res = await apiClient.get<ApiSuccessResponse<ClientListItem[]>>('/users/clients', {
      params,
    });
    return {
      data: res.data.data,
      pagination: res.data.pagination || {
        total: res.data.data?.length || 0,
        page: params?.page || 1,
        per_page: params?.per_page || 50,
      },
    };
  },

  /**
   * 9. Block / Unblock Client Account (Admin / Superadmin only)
   * PATCH /api/v1/users/clients/{client_id}/status
   */
  async updateClientStatus(clientId: string, status: 'ACTIVE' | 'BLOCKED'): Promise<UpdateClientStatusResponseData> {
    const res = await apiClient.patch<ApiSuccessResponse<UpdateClientStatusResponseData>>(
      `/users/clients/${clientId}/status`,
      { status }
    );
    return res.data.data;
  },
};
