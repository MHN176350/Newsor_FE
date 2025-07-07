/**
 * Abstract repository interface for Analytics/Dashboard entities
 */
export class IAnalyticsRepository {
  async getDashboardStats() {
    throw new Error('Method not implemented');
  }

  async getRecentActivity(limit = 10) {
    throw new Error('Method not implemented');
  }

  async getUserReadingHistory(userId) {
    throw new Error('Method not implemented');
  }
}

/**
 * Abstract repository interface for Image/Upload entities
 */
export class IUploadRepository {
  async getCloudinarySignature() {
    throw new Error('Method not implemented');
  }

  async uploadImage(imageData) {
    throw new Error('Method not implemented');
  }

  async deleteImage(imageId) {
    throw new Error('Method not implemented');
  }
}
