import { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { User, UserProfile } from '../../domain/entities/User.js';
import {
  LOGIN_USER,
  REFRESH_TOKEN,
  GET_CURRENT_USER,
  GET_ALL_USERS,
  GET_USER_BY_ID,
  GET_USER_PROFILE,
  CREATE_USER,
  UPDATE_USER_PROFILE,
  CHANGE_USER_ROLE,
  UPLOAD_BASE64_IMAGE,
  UPLOAD_AVATAR_IMAGE,
  UPLOAD_REGISTRATION_AVATAR_IMAGE
} from '../api/userQueries.js';

/**
 * GraphQL implementation of IUserRepository
 */
export class GraphQLUserRepository extends IUserRepository {
  constructor(apolloClient) {
    super();
    this.client = apolloClient;
  }

  async getCurrentUser() {
    try {
      const { data } = await this.client.query({
        query: GET_CURRENT_USER,
        fetchPolicy: 'network-only'
      });

      if (!data.me) {
        return null;
      }

      return this._mapUserFromGraphQL(data.me);
    } catch (error) {
      console.error('Error getting current user:', error);
      
      // Check for authentication-related errors
      if (error.graphQLErrors) {
        for (const gqlError of error.graphQLErrors) {
          if (gqlError.message?.includes('Authentication') || 
              gqlError.message?.includes('permission') ||
              gqlError.message?.includes('token') ||
              gqlError.message?.includes('Unauthenticated')) {
            console.warn('Authentication error in getCurrentUser:', gqlError.message);
            return null; // Return null for auth errors instead of throwing
          }
        }
      }
      
      // For network errors or other non-auth errors, still return null
      // but log more details
      if (error.networkError) {
        console.error('Network error in getCurrentUser:', error.networkError);
      }
      
      return null;
    }
  }

  async getUserById(id) {
    try {
      const { data } = await this.client.query({
        query: GET_USER_BY_ID,
        variables: { id },
        fetchPolicy: 'cache-first'
      });

      if (!data.user) {
        return null;
      }

      return this._mapUserFromGraphQL(data.user);
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw new Error(error.message || 'Failed to get user');
    }
  }

  async getAllUsers() {
    try {
      const { data } = await this.client.query({
        query: GET_ALL_USERS,
        fetchPolicy: 'cache-first'
      });

      return data.users.map(user => this._mapUserFromGraphQL(user));
    } catch (error) {
      console.error('Error getting all users:', error);
      throw new Error(error.message || 'Failed to get users');
    }
  }

  async createUser(userData) {
    try {
      const { data } = await this.client.mutate({
        mutation: CREATE_USER,
        variables: userData
      });

      if (!data.createUser.success) {
        throw new Error(data.createUser.errors?.join(', ') || 'Failed to create user');
      }

      return this._mapUserFromGraphQL(data.createUser.user);
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error(error.message || 'Failed to create user');
    }
  }

  async updateUserProfile(profileData) {
    try {
      const { data } = await this.client.mutate({
        mutation: UPDATE_USER_PROFILE,
        variables: profileData
      });

      if (!data.updateUserProfile.success) {
        throw new Error(data.updateUserProfile.errors?.join(', ') || 'Failed to update profile');
      }

      return this._mapUserProfileFromGraphQL(data.updateUserProfile.profile);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  }

  async changeUserRole(userId, newRole) {
    try {
      const { data } = await this.client.mutate({
        mutation: CHANGE_USER_ROLE,
        variables: { userId, newRole }
      });

      if (!data.changeUserRole.success) {
        throw new Error(data.changeUserRole.errors?.join(', ') || 'Failed to change user role');
      }

      return this._mapUserFromGraphQL(data.changeUserRole.user);
    } catch (error) {
      console.error('Error changing user role:', error);
      throw new Error(error.message || 'Failed to change user role');
    }
  }

  async getUserProfile(userId) {
    try {
      const { data } = await this.client.query({
        query: GET_USER_PROFILE,
        variables: { userId },
        fetchPolicy: 'cache-first'
      });

      if (!data.userProfile) {
        return null;
      }

      return this._mapUserProfileFromGraphQL(data.userProfile);
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw new Error(error.message || 'Failed to get user profile');
    }
  }

  async login(credentials) {
    try {
      const { data } = await this.client.mutate({
        mutation: LOGIN_USER,
        variables: {
          username: credentials.username,
          password: credentials.password
        }
      });

      if (data.tokenAuth && data.tokenAuth.token) {
        return {
          success: true,
          token: data.tokenAuth.token,
          refreshToken: data.tokenAuth.refreshToken,
          user: this._mapUserFromGraphQL(data.tokenAuth.user)
        };
      } else {
        return {
          success: false,
          errors: ['Invalid credentials']
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        errors: [error.message || 'Login failed']
      };
    }
  }

  async uploadBase64Image(options) {
    try {
      const { data } = await this.client.mutate({
        mutation: UPLOAD_BASE64_IMAGE,
        variables: options
      });

      return {
        url: data.uploadBase64Image.url,
        publicId: data.uploadBase64Image.publicId,
        success: data.uploadBase64Image.success,
        errors: data.uploadBase64Image.errors
      };
    } catch (error) {
      console.error('Error uploading base64 image:', error);
      throw new Error(error.message || 'Failed to upload image');
    }
  }

  async uploadAvatar(base64Data) {
    try {
      const { data } = await this.client.mutate({
        mutation: UPLOAD_AVATAR_IMAGE,
        variables: { base64Data }
      });

      return {
        profile: data.uploadAvatarImage.profile ? 
          this._mapUserProfileFromGraphQL(data.uploadAvatarImage.profile) : null,
        success: data.uploadAvatarImage.success,
        errors: data.uploadAvatarImage.errors
      };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw new Error(error.message || 'Failed to upload avatar');
    }
  }

  async uploadRegistrationAvatar(base64Data) {
    try {
      const { data } = await this.client.mutate({
        mutation: UPLOAD_REGISTRATION_AVATAR_IMAGE,
        variables: { base64Data }
      });

      return {
        url: data.uploadRegistrationAvatarImage.url,
        success: data.uploadRegistrationAvatarImage.success,
        errors: data.uploadRegistrationAvatarImage.errors
      };
    } catch (error) {
      console.error('Error uploading registration avatar:', error);
      throw new Error(error.message || 'Failed to upload registration avatar');
    }
  }

  // Private helper methods
  _mapUserFromGraphQL(userData) {
    return new User({
      id: userData.id,
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      isActive: userData.isActive,
      dateJoined: userData.dateJoined,
      lastLogin: userData.lastLogin,
      profile: userData.profile ? this._mapUserProfileFromGraphQL(userData.profile) : null
    });
  }

  _mapUserProfileFromGraphQL(profileData) {
    return new UserProfile({
      id: profileData.id,
      userId: profileData.userId,
      role: profileData.role,
      bio: profileData.bio,
      phone: profileData.phone,
      dateOfBirth: profileData.dateOfBirth,
      avatarUrl: profileData.avatarUrl,
      isVerified: profileData.isVerified,
      createdAt: profileData.createdAt,
      updatedAt: profileData.updatedAt,
      hasWritePermission: profileData.hasWritePermission,
      hasAdminPermission: profileData.hasAdminPermission,
      hasManagerPermission: profileData.hasManagerPermission
    });
  }
}
