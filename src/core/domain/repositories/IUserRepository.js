/**
 * Abstract repository interface for User entities
 */
export class IUserRepository {
  async login(credentials) {
    throw new Error('Method not implemented');
  }

  async getCurrentUser() {
    throw new Error('Method not implemented');
  }

  async getUserById(id) {
    throw new Error('Method not implemented');
  }

  async getAllUsers() {
    throw new Error('Method not implemented');
  }

  async createUser(userData) {
    throw new Error('Method not implemented');
  }

  async updateUserProfile(profileData) {
    throw new Error('Method not implemented');
  }

  async changeUserRole(userId, newRole) {
    throw new Error('Method not implemented');
  }

  async getUserProfile(userId) {
    throw new Error('Method not implemented');
  }
}
