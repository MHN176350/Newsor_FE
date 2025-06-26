// Image upload utilities
export const uploadImageToBackend = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    const response = await fetch('http://localhost:8000/api/upload-image/', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    if (result.success) {
      return {
        success: true,
        url: result.url,
        publicId: result.public_id,
      };
    } else {
      throw new Error(result.error || 'Upload failed');
    }
  } catch (error) {
    console.error('Image upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const registerUserWithAvatar = async (userData) => {
  try {
    const response = await fetch('http://localhost:8000/api/register-with-avatar/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Image validation utilities
export const validateImageFile = (file) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }

  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 5MB' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Only JPEG, PNG, WebP and GIF files are allowed' };
  }

  return { isValid: true };
};

// Create preview URL for selected image
export const createImagePreview = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
};
