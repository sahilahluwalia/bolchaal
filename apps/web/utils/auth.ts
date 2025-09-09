interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'access-token';

  /**
   * Store access token only (refresh token is in HTTP cookie)
   */
  static setAccessToken(accessToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
  }

  /**
   * Get the access token
   */
  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Clear stored access token (logout)
   */
  static clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Update only the access token (after refresh)
   */
  static updateAccessToken(accessToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
  }

  /**
   * Check if user is authenticated (has valid access token)
   */
  static isAuthenticated(): boolean {
    return this.getAccessToken() !== null;
  }

  /**
   * Logout user by clearing local tokens and calling logout API
   */
  static async logout(): Promise<void> {
    try {
      // Import trpc client directly
      const { trpcClient } = await import('../app/_trpc/trpcClient');
      await trpcClient.logout.mutate();
    } catch (error) {
      console.log('Error during logout API call:', error);
      // Continue with local logout even if API call fails
    }

    // Clear access token from storage
    this.clearTokens();
  }
}

export { TokenManager };
export type { TokenPair };
