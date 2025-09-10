import { TokenManager } from './auth';

class TokenDebugService {
  static getTokenStatus() {
    const accessToken = TokenManager.getAccessToken();
    return {
      hasAccessToken: !!accessToken,
      isExpired: false,
      tokenLength: accessToken?.length || 0,
    };
  }
}

export { TokenDebugService };
