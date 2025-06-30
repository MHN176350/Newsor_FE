/**
 * Service for managing authentication tokens
 */
export class TokenService {
  constructor(storageService) {
    this.storageService = storageService;
    this.TOKEN_KEY = 'token';
    this.REFRESH_TOKEN_KEY = 'refreshToken';
  }

  /**
   * Set authentication token
   * @param {string} token 
   */
  setToken(token) {
    this.storageService.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Get authentication token
   * @returns {string|null}
   */
  getToken() {
    return this.storageService.getItem(this.TOKEN_KEY);
  }

  /**
   * Set refresh token
   * @param {string} refreshToken 
   */
  setRefreshToken(refreshToken) {
    this.storageService.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  /**
   * Get refresh token
   * @returns {string|null}
   */
  getRefreshToken() {
    return this.storageService.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Clear all tokens
   */
  clearTokens() {
    this.storageService.removeItem(this.TOKEN_KEY);
    this.storageService.removeItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  /**
   * Check if token is expired
   * @param {string} token 
   * @returns {boolean}
   */
  isTokenExpired(token) {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Get token payload
   * @param {string} token 
   * @returns {object|null}
   */
  getTokenPayload(token = null) {
    const authToken = token || this.getToken();
    if (!authToken) return null;
    
    try {
      return JSON.parse(atob(authToken.split('.')[1]));
    } catch (error) {
      return null;
    }
  }

  /**
   * Get user ID from token
   * @returns {string|null}
   */
  getUserId() {
    const payload = this.getTokenPayload();
    return payload?.user_id || payload?.sub || null;
  }

  /**
   * Get username from token
   * @returns {string|null}
   */
  getUsername() {
    const payload = this.getTokenPayload();
    return payload?.username || null;
  }
}
