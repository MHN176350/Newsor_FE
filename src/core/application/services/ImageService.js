/**
 * Service for handling image operations
 */
export class ImageService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Convert file to base64
   * @param {File} file - The file to convert
   * @returns {Promise<string>} Base64 string
   */
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Resize image to maximum dimensions with high quality preservation
   * @param {File} file - The image file
   * @param {number} maxWidth - Maximum width
   * @param {number} maxHeight - Maximum height
   * @param {number|string} quality - JPEG quality (0-1 or string like "95")
   * @returns {Promise<string>} Base64 string of resized image
   */
  async resizeImage(file, maxWidth = 1200, maxHeight = 900, quality = "95") {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions - be more conservative about resizing
        let { width, height } = img;
        
        // Only resize if significantly larger to preserve quality
        const needsResize = width > maxWidth * 1.2 || height > maxHeight * 1.2;
        
        if (needsResize) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Use high-quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with high quality
        const qualityValue = typeof quality === 'string' ? 
          parseInt(quality) / 100 : 
          quality;
        
        const base64 = canvas.toDataURL('image/jpeg', Math.max(qualityValue, 0.9));
        resolve(base64);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Upload base64 image to server
   * @param {string} base64Data - Base64 encoded image
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  async uploadBase64Image(base64Data, options = {}) {
    const {
      folder = 'newsor/uploads',
      maxWidth = 1200,
      maxHeight = 900,
      quality = '90',  // Use string format
      format = 'auto'
    } = options;

    try {
      const result = await this.userRepository.uploadBase64Image({
        base64Data,
        folder,
        maxWidth,
        maxHeight,
        quality,
        format
      });

      if (!result.success) {
        throw new Error(result.errors?.join(', ') || 'Upload failed');
      }

      return {
        url: result.url,
        publicId: result.publicId,
        success: true
      };
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  }

  /**
   * Upload avatar image
   * @param {string} base64Data - Base64 encoded avatar image
   * @returns {Promise<Object>} Upload result with updated profile
   */
  async uploadAvatar(base64Data) {
    try {
      const result = await this.userRepository.uploadAvatar(base64Data);

      if (!result.success) {
        throw new Error(result.errors?.join(', ') || 'Avatar upload failed');
      }

      return {
        profile: result.profile,
        success: true
      };
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw error;
    }
  }

  /**
   * Upload avatar image for registration (no authentication required)
   * @param {string} base64Data - Base64 encoded avatar image
   * @returns {Promise<Object>} Upload result with avatar URL
   */
  async uploadRegistrationAvatar(base64Data) {
    try {
      const result = await this.userRepository.uploadRegistrationAvatar(base64Data);

      if (!result.success) {
        throw new Error(result.errors?.join(', ') || 'Registration avatar upload failed');
      }

      return {
        url: result.url,
        success: true
      };
    } catch (error) {
      console.error('Registration avatar upload error:', error);
      throw error;
    }
  }

  /**
   * Process and upload image file
   * @param {File} file - Image file
   * @param {Object} options - Processing and upload options
   * @returns {Promise<Object>} Upload result
   */
  async processAndUploadImage(file, options = {}) {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }

      // Validate file size (5MB limit)
      const maxSize = options.maxSize || 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('Image size must be less than 5MB');
      }

      // Resize image if needed
      const base64Data = await this.resizeImage(
        file,
        options.maxWidth,
        options.maxHeight,
        options.quality
      );

      // Upload to server
      return await this.uploadBase64Image(base64Data, options);
    } catch (error) {
      console.error('Image processing error:', error);
      throw error;
    }
  }

  /**
   * Process and upload avatar
   * @param {File} file - Avatar image file
   * @returns {Promise<Object>} Upload result with updated profile
   */
  /**
   * Process and upload avatar image
   * @param {File} file - Avatar image file
   * @param {boolean} isRegistration - Whether this is for registration (no auth required)
   * @returns {Promise<Object>} Upload result
   */
  async processAndUploadAvatar(file, isRegistration = false) {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }

      // Validate file size (2MB limit for avatars)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Avatar image size must be less than 2MB');
      }

      // Resize for avatar (square, 400x400)
      const base64Data = await this.resizeImage(file, 400, 400, 0.9);

      // Upload avatar - use registration upload if specified
      if (isRegistration) {
        return await this.uploadRegistrationAvatar(base64Data);
      } else {
        return await this.uploadAvatar(base64Data);
      }
    } catch (error) {
      console.error('Avatar processing error:', error);
      throw error;
    }
  }
}

// Note: Don't create singleton here - let the container handle it
