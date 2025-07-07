import { IAnalyticsRepository } from '../../domain/repositories/IAnalyticsRepository.js';
import { DashboardStats, RecentActivity } from '../../domain/entities/Analytics.js';
import {
  GET_DASHBOARD_STATS,
  GET_RECENT_ACTIVITY,
  GET_USER_READING_HISTORY,
  GET_CLOUDINARY_SIGNATURE
} from '../api/analyticsQueries.js';

/**
 * GraphQL implementation of IAnalyticsRepository
 */
export class GraphQLAnalyticsRepository extends IAnalyticsRepository {
  constructor(apolloClient) {
    super();
    this.client = apolloClient;
  }

  async getDashboardStats() {
    try {
      const { data } = await this.client.query({
        query: GET_DASHBOARD_STATS,
        fetchPolicy: 'network-only' // Always fetch fresh data for dashboard
      });

      if (!data.dashboardStats) {
        return null;
      }

      return new DashboardStats(data.dashboardStats);
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw new Error(error.message || 'Failed to get dashboard statistics');
    }
  }

  async getRecentActivity(limit = 10) {
    try {
      const { data } = await this.client.query({
        query: GET_RECENT_ACTIVITY,
        variables: { limit },
        fetchPolicy: 'network-only'
      });

      return data.recentActivity.map(activity => new RecentActivity({
        id: activity.id,
        action: activity.action,
        description: activity.description,
        timestamp: activity.timestamp,
        user: activity.user
      }));
    } catch (error) {
      console.error('Error getting recent activity:', error);
      throw new Error(error.message || 'Failed to get recent activity');
    }
  }

  async getUserReadingHistory(userId) {
    try {
      const { data } = await this.client.query({
        query: GET_USER_READING_HISTORY,
        variables: { userId },
        fetchPolicy: 'cache-first'
      });

      return data.userReadingHistory || [];
    } catch (error) {
      console.error('Error getting user reading history:', error);
      throw new Error(error.message || 'Failed to get reading history');
    }
  }
}

/**
 * GraphQL implementation of IUploadRepository
 */
export class GraphQLUploadRepository {
  constructor(apolloClient) {
    this.client = apolloClient;
  }

  async getCloudinarySignature() {
    try {
      const { data } = await this.client.mutate({
        mutation: GET_CLOUDINARY_SIGNATURE
      });

      if (!data.getCloudinarySignature.success) {
        throw new Error(data.getCloudinarySignature.errors?.join(', ') || 'Failed to get upload signature');
      }

      return {
        signature: data.getCloudinarySignature.signature,
        timestamp: data.getCloudinarySignature.timestamp,
        apiKey: data.getCloudinarySignature.apiKey,
        cloudName: data.getCloudinarySignature.cloudName,
        folder: data.getCloudinarySignature.folder
      };
    } catch (error) {
      console.error('Error getting Cloudinary signature:', error);
      throw new Error(error.message || 'Failed to get upload signature');
    }
  }

  async uploadImage(imageData, options = {}) {
    try {
      // Get upload signature first
      const signatureData = await this.getCloudinarySignature();
      
      // Prepare form data for Cloudinary upload
      const formData = new FormData();
      formData.append('file', imageData);
      formData.append('api_key', signatureData.apiKey);
      formData.append('timestamp', signatureData.timestamp);
      formData.append('signature', signatureData.signature);
      formData.append('folder', signatureData.folder);
      
      // Add optional parameters
      if (options.resourceType) {
        formData.append('resource_type', options.resourceType);
      }
      if (options.transformation) {
        formData.append('transformation', options.transformation);
      }
      
      // Upload to Cloudinary
      const uploadUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`;
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      
      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes
      };
      
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      throw new Error(error.message || 'Failed to upload image');
    }
  }

  async deleteImage(imageId) {
    // TODO: Implement image deletion
    throw new Error('Image deletion not implemented yet');
  }
}
