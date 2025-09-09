import { TokenManager } from './auth';

interface RefreshResult {
  success: boolean;
  accessToken?: string;
  error?: string;
}

class TokenRefreshService {
  private static isRefreshing = false;
  private static refreshPromise: Promise<RefreshResult> | null = null;

  /**
   * Refresh the access token using the refresh token from HTTP cookie
   */
  static async refreshAccessToken(): Promise<RefreshResult> {
    // If already refreshing, return the existing promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;

    this.refreshPromise = this.performRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Perform the actual refresh request (refresh token comes from HTTP cookie)
   */
  private static async performRefresh(): Promise<RefreshResult> {
    try {
      // Import trpc client directly
      const { trpcClient } = await import('../app/_trpc/trpcClient');

      const result = await trpcClient.refreshToken.mutate();

      // Update access token in storage (refresh token is in cookie)
      TokenManager.updateAccessToken(result.accessToken);

      return {
        success: true,
        accessToken: result.accessToken,
      };
    } catch (error: any) {
      console.error('Token refresh failed:', error);

      // If refresh fails, clear tokens
      if (error?.data?.code === 'UNAUTHORIZED') {
        TokenManager.clearTokens();
      }

      return {
        success: false,
        error: error?.message || 'Token refresh failed',
      };
    }
  }

  /**
   * Check if access token is expired (basic check)
   */
  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;

      // Add 5 minute buffer before actual expiration
      return payload.exp < (currentTime + 300);
    } catch (error) {
      console.error('Error parsing token:', error);
      return true; // Assume expired if we can't parse
    }
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  static async getValidAccessToken(): Promise<string | null> {
    let accessToken = TokenManager.getAccessToken();

    if (!accessToken) {
      return null;
    }

    // Check if token is expired or will expire soon
    if (this.isTokenExpired(accessToken)) {
      const refreshResult = await this.refreshAccessToken();

      if (refreshResult.success && refreshResult.accessToken) {
        accessToken = refreshResult.accessToken;
      } else {
        // Refresh failed, token is invalid
        return null;
      }
    }

    return accessToken;
  }
}

export { TokenRefreshService };
export type { RefreshResult };
