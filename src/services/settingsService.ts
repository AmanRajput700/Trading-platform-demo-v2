import { apiClient } from './apiClient';
import { UserSettingsData, UpdateUserSettingsRequest, ApiSuccessResponse } from '../types';

export const settingsService = {
  /**
   * 6. Get current user terminal settings
   * GET /api/v1/users/me/settings
   */
  async getSettings(): Promise<UserSettingsData> {
    const res = await apiClient.get<ApiSuccessResponse<UserSettingsData>>('/users/me/settings');
    return res.data.data;
  },

  /**
   * 7. Update user settings (trading_mode, theme)
   * PATCH /api/v1/users/me/settings
   */
  async updateSettings(payload: UpdateUserSettingsRequest): Promise<UserSettingsData> {
    const res = await apiClient.patch<ApiSuccessResponse<UserSettingsData>>('/users/me/settings', payload);
    return res.data.data;
  },
};
