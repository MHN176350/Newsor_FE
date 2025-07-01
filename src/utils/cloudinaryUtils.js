/**
 * Cloudinary utilities for handling image URLs
 */

// Default cloud name - this should match your Cloudinary configuration
const DEFAULT_CLOUD_NAME = 'dbx4ilvha'; // Updated to match actual Cloudinary cloud name

/**
 * Convert a Cloudinary resource path to a full URL
 * @param {string} resourcePath - The Cloudinary resource path
 * @param {string} cloudName - Optional cloud name (defaults to DEFAULT_CLOUD_NAME)
 * @returns {string} Full Cloudinary URL
 */
export function buildCloudinaryUrl(resourcePath, cloudName = DEFAULT_CLOUD_NAME) {
  if (!resourcePath) {
    console.log('buildCloudinaryUrl: No resource path provided');
    return null;
  }
  
  // If it's already a full URL, return as is
  if (resourcePath.startsWith('http://') || resourcePath.startsWith('https://')) {
    console.log('buildCloudinaryUrl: Already full URL:', resourcePath);
    return resourcePath;
  }
  
  // If it's a default/static image (like default-avatar.svg), don't process it
  if (resourcePath.includes('default-') || resourcePath.includes('/static/') || resourcePath.includes('/media/')) {
    console.log('buildCloudinaryUrl: Static/default image, returning as is:', resourcePath);
    // If it's a static path but we're in development, try to serve from public directory
    if (resourcePath.startsWith('/static/images/') && import.meta.env.DEV) {
      const filename = resourcePath.split('/').pop();
      const publicPath = `/${filename}`;
      console.log('buildCloudinaryUrl: Development mode, serving from public:', publicPath);
      return publicPath;
    }
    return resourcePath;
  }
  
  // If it's already a Cloudinary URL (might happen with double processing), return as is
  if (resourcePath.includes('res.cloudinary.com')) {
    console.log('buildCloudinaryUrl: Already Cloudinary URL:', resourcePath);
    return resourcePath;
  }
  
  // If it starts with a slash, remove it
  const cleanPath = resourcePath.startsWith('/') ? resourcePath.substring(1) : resourcePath;
  
  // Build the full Cloudinary URL
  const fullUrl = `https://res.cloudinary.com/${cloudName}/${cleanPath}`;
  console.log('buildCloudinaryUrl: Built URL:', resourcePath, '->', fullUrl);
  return fullUrl;
}

/**
 * Process an image URL for display, handling both full URLs and resource paths
 * @param {string} imageUrl - The image URL or resource path
 * @returns {string} Full URL ready for display
 */
export function processImageUrlForDisplay(imageUrl) {
  return buildCloudinaryUrl(imageUrl);
}

/**
 * Check if a URL is a Cloudinary URL
 * @param {string} url - The URL to check
 * @returns {boolean} True if it's a Cloudinary URL
 */
export function isCloudinaryUrl(url) {
  return url && url.includes('res.cloudinary.com');
}
