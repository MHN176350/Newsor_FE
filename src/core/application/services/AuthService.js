/**
 * Authentication service for managing user authentication state
 */
export class AuthService {
  constructor(userRepository, tokenService, storageService) {
    this.userRepository = userRepository;
    this.tokenService = tokenService;
    this.storageService = storageService;
    this.currentUser = null;
    this.listeners = new Set();
  }

  // Event system for notifying components of auth state changes
  addAuthListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyAuthChange() {
    this.listeners.forEach(callback => callback());
  }

  async login(credentials) {
    try {
      // This would typically call a login mutation
      const response = await this.userRepository.login(credentials);
      
      if (response.success) {
        // Store authentication tokens
        this.tokenService.setToken(response.token);
        if (response.refreshToken) {
          this.tokenService.setRefreshToken(response.refreshToken);
        }
        
        // Store user data directly from login response
        this.currentUser = response.user;
        
        // Also save user to storage for persistence
        this.storageService.setItem('currentUser', response.user);
        
        // Notify listeners of auth state change
        this.notifyAuthChange();
        
        return {
          success: true,
          user: this.currentUser
        };
      } else {
        throw new Error(response.errors?.join(', ') || 'Login failed');
      }
    } catch (error) {
      throw new Error(error.message || 'Authentication failed');
    }
  }

  async logout() {
    this.tokenService.clearTokens();
    this.storageService.removeItem('currentUser');
    this.currentUser = null;
    
    // Notify listeners of auth state change
    this.notifyAuthChange();
    
    return {
      success: true
    };
  }

  async getCurrentUser() {
    if (this.currentUser) {
      return this.currentUser;
    }

    // Try to get user from storage first
    const storedUser = this.storageService.getItem('currentUser');
    if (storedUser) {
      this.currentUser = storedUser;
      return this.currentUser;
    }

    // Check if token exists
    const token = this.tokenService.getToken();
    if (!token) {
      return null;
    }

    try {
      // Fetch user from API
      this.currentUser = await this.userRepository.getCurrentUser();
      if (this.currentUser) {
        // Save to storage for next time
        this.storageService.setItem('currentUser', this.currentUser);
      }
      return this.currentUser;
    } catch (error) {
      // Token might be invalid, clear all auth data
      this.tokenService.clearTokens();
      this.storageService.removeItem('currentUser');
      return null;
    }
  }

  async refreshToken() {
    try {
      const newToken = await this.tokenService.refreshToken();
      this.tokenService.setToken(newToken);
      return true;
    } catch (error) {
      this.logout();
      return false;
    }
  }

  isAuthenticated() {
    return !!this.tokenService.getToken();
  }
}
