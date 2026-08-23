import { apiClient, getStoredRefreshToken, clearStoredTokens, setStoredTokens } from './apiClient';
import { 
  RegisterRequestPayload, 
  RegisterResponseData, 
  LoginRequestPayload, 
  LoginResponseData, 
  RefreshTokenResponseData,
  UserProfileData, 
  ApiSuccessResponse 
} from '../types';

export const authService = {
  /**
   * 1. Register a new user account
   * POST /api/v1/auth/register
   */
  async register(payload: RegisterRequestPayload): Promise<RegisterResponseData> {
    const res = await apiClient.post<ApiSuccessResponse<RegisterResponseData>>('/auth/register', payload);
    return res.data.data;
  },

  /**
   * 2. Login with email & password
   * POST /api/v1/auth/login
   */
  async login(payload: LoginRequestPayload): Promise<LoginResponseData> {
    const res = await apiClient.post<ApiSuccessResponse<LoginResponseData>>('/auth/login', payload);
    const data = res.data.data;
    setStoredTokens(data.access_token, data.refresh_token);
    return data;
  },

  /**
   * 3. Refresh access token
   * POST /api/v1/auth/refresh
   */
  async refresh(refreshToken: string): Promise<RefreshTokenResponseData> {
    const res = await apiClient.post<ApiSuccessResponse<RefreshTokenResponseData>>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    const data = res.data.data;
    setStoredTokens(data.access_token, data.refresh_token);
    return data;
  },

  /**
   * 4. Get current user profile
   * GET /api/v1/auth/me
   */
  async getMe(): Promise<UserProfileData> {
    const res = await apiClient.get<ApiSuccessResponse<UserProfileData>>('/auth/me');
    return res.data.data;
  },

  /**
   * 5. Logout session
   * POST /api/v1/auth/logout
   */
  async logout(): Promise<void> {
    const refreshToken = getStoredRefreshToken();
    try {
      if (refreshToken) {
        await apiClient.post('/auth/logout', {
          refresh_token: refreshToken,
        });
      }
    } finally {
      clearStoredTokens();
    }
  },
};
