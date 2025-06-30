/**
 * Frontend utilities for URL optimization
 */

/**
 * Optimize Cloudinary URL for backend storage
 * This mirrors the backend CloudinaryUtils functionality
 */
export class FrontendCloudinaryUtils {
  // Common Cloudinary base URL patterns
  static CLOUDINARY_BASE_PATTERNS = [
    /^https?:\/\/res\.cloudinary\.com\/[^/]+\//
  ];

  /**
   * Strip the base Cloudinary URL and return only the resource path
   */
  static optimizeForStorage(fullUrl) {
    if (!fullUrl || typeof fullUrl !== 'string') {
      return fullUrl;
    }

    // If it's a base64 data URL, return as is (backend will handle it)
    if (fullUrl.startsWith('data:')) {
      return fullUrl;
    }

    // Check if it matches Cloudinary URL pattern
    for (const pattern of this.CLOUDINARY_BASE_PATTERNS) {
      const match = fullUrl.match(pattern);
      if (match) {
        // Return only the resource path after the base URL
        return fullUrl.substring(match[0].length);
      }
    }

    // If it's already optimized or not a Cloudinary URL, return as is
    return fullUrl;
  }

  /**
   * Restore full Cloudinary URL for display from stored resource path
   * This is the equivalent of backend's restore_for_display method
   */
  static restoreForDisplay(storedPath) {
    if (!storedPath || typeof storedPath !== 'string') {
      return storedPath;
    }

    // If it's already a full URL, return as is
    if (storedPath.startsWith('http://') || storedPath.startsWith('https://')) {
      return storedPath;
    }

    // If it's a base64 data URL, return as is
    if (storedPath.startsWith('data:')) {
      return storedPath;
    }

    // For now, we'll need to construct the base URL
    // In a real app, this should come from environment config
    const CLOUDINARY_CLOUD_NAME = 'your-cloud-name'; // This should be from config
    const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/`;
    
    return `${baseUrl}${storedPath}`;
  }

  /**
   * Alias for restoreForDisplay to match the expected method name
   */
  static optimizeUrl(storedPath) {
    return this.restoreForDisplay(storedPath);
  }

  /**
   * Process profile data to optimize image URLs
   */
  static optimizeProfileData(profileData) {
    const optimized = { ...profileData };

    // Optimize avatar URL if present
    if (optimized.avatar) {
      optimized.avatar = this.optimizeForStorage(optimized.avatar);
    }

    return optimized;
  }
}
