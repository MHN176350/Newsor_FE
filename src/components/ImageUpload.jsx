import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Typography,
  Alert,
  Stack,
  Avatar
} from '@mui/joy';
import { PhotoCamera, Upload, Delete } from '@mui/icons-material';
import { container } from '../core/container.js';
import { processImageUrlForDisplay } from '../utils/cloudinaryUtils';

/**
 * Reusable image upload component
 */
export default function ImageUpload({
  currentImageUrl = null,
  onImageUploaded,
  onImageRemoved,
  variant = 'standard', // 'standard', 'avatar', 'banner'
  maxSizeInMB = 5,
  acceptedTypes = 'image/*',
  disabled = false,
  showPreview = true,
  uploadButtonText = 'Upload Image',
  removeButtonText = 'Remove Image'
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const fileInputRef = useRef(null);
  
  const imageService = container.imageService;

  // Determine what URL to show for preview
  const previewUrl = useMemo(() => {
    // If user uploaded a new image, show that
    if (uploadedImageUrl) {
      return processImageUrlForDisplay(uploadedImageUrl);
    }
    // Otherwise show the current image from props
    return processImageUrlForDisplay(currentImageUrl);
  }, [uploadedImageUrl, currentImageUrl]);

  // Configuration based on variant
  const getConfig = () => {
    switch (variant) {
      case 'avatar':
        return {
          maxWidth: 600,   // Increased from 400
          maxHeight: 600,  // Increased from 400
          quality: "95",   // Very high quality
          aspectRatio: '1/1',
          previewSize: 120
        };
      case 'banner':
        return {
          maxWidth: 1800,  // Increased from 1200
          maxHeight: 600,  // Increased from 400
          quality: "90",   // High quality
          aspectRatio: '3/1',
          previewSize: 300
        };
      case 'thumbnail':
        return {
          maxWidth: 1600,  // Increased from 1200
          maxHeight: 1200, // Increased from 900  
          quality: "95",   // Very high quality
          aspectRatio: '4/3',
          previewSize: 250
        };
      default:
        return {
          maxWidth: 1200,  // Increased from 800
          maxHeight: 900,  // Increased from 600
          quality: "90",   // High quality string
          aspectRatio: 'auto',
          previewSize: 200
        };
    }
  };

  const config = getConfig();

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size
    const maxSize = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`Image size must be less than ${maxSizeInMB}MB`);
      return;
    }

    uploadImage(file);
  };

  const uploadImage = async (file) => {
    setUploading(true);
    setError(null);

    try {
      let result;
      
      if (variant === 'avatar') {
        // Use specialized avatar upload
        result = await imageService.processAndUploadAvatar(file);
        
        // For avatar uploads, we get back the updated profile
        if (result.profile) {
          const originalAvatarUrl = result.profile.avatarUrl;
          
          setUploadedImageUrl(originalAvatarUrl);
          onImageUploaded?.(originalAvatarUrl, result.profile);
        }
      } else {
        // Use general image upload
        const options = {
          folder: variant === 'banner' ? 'newsor/banners' : 
                  variant === 'thumbnail' ? 'newsor/thumbnails' : 'newsor/uploads',
          maxWidth: config.maxWidth,
          maxHeight: config.maxHeight,
          quality: config.quality.toString(),
        };
        
        result = await imageService.processAndUploadImage(file, options);
        console.log('Image upload result:', result);
        
        // Store the uploaded image URL
        const originalUrl = result.url || result.secure_url || result.cloudinaryUrl;
        console.log('Original URL:', originalUrl);
        
        setUploadedImageUrl(originalUrl);
        onImageUploaded?.(originalUrl, result);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setUploadedImageUrl(null);
    setError(null);
    onImageRemoved?.();
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Stack spacing={2}>
      {/* Preview */}
      {showPreview && previewUrl && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          {variant === 'avatar' ? (
            <Avatar
              src={previewUrl}
              sx={{ 
                width: config.previewSize, 
                height: config.previewSize,
                border: '2px solid var(--joy-palette-divider)'
              }}
            />
          ) : (
            <Card
              variant="outlined"
              sx={{
                maxWidth: config.previewSize,
                aspectRatio: config.aspectRatio,
                overflow: 'hidden'
              }}
            >
              <Box
                component="img"
                src={previewUrl}
                alt="Preview"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </Card>
          )}
        </Box>
      )}

      {/* Error Alert */}
      {error && (
        <Alert color="danger" size="sm">
          {error}
        </Alert>
      )}

      {/* Controls */}
      <Stack direction="row" spacing={2} sx={{ justifyContent: 'center' }}>
        {/* Upload Button */}
        <Button
          variant="solid"
          color="primary"
          startDecorator={uploading ? <CircularProgress size="sm" /> : <PhotoCamera />}
          onClick={handleButtonClick}
          disabled={disabled || uploading}
          loading={uploading}
        >
          {uploading ? 'Uploading...' : uploadButtonText}
        </Button>

        {/* Remove Button */}
        {previewUrl && (
          <Button
            variant="outlined"
            color="danger"
            startDecorator={<Delete />}
            onClick={handleRemoveImage}
            disabled={disabled || uploading}
          >
            {removeButtonText}
          </Button>
        )}
      </Stack>

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Helper Text */}
      <Typography level="body-xs" sx={{ textAlign: 'center', color: 'text.secondary' }}>
        {variant === 'avatar' && 'Recommended: Square image, max 2MB'}
        {variant === 'banner' && 'Recommended: 3:1 aspect ratio, max 5MB'}
        {variant === 'thumbnail' && 'Recommended: 4:3 aspect ratio, high quality processing (max 1600x1200px)'}
        {variant === 'standard' && `Max size: ${maxSizeInMB}MB`}
      </Typography>
    </Stack>
  );
}
