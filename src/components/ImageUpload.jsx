import React, { useState, useRef } from 'react';
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
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  
  const imageService = container.imageService;

  // Configuration based on variant
  const getConfig = () => {
    switch (variant) {
      case 'avatar':
        return {
          maxWidth: 400,
          maxHeight: 400,
          quality: 0.9,
          aspectRatio: '1/1',
          previewSize: 120
        };
      case 'banner':
        return {
          maxWidth: 1200,
          maxHeight: 400,
          quality: 0.85,
          aspectRatio: '3/1',
          previewSize: 300
        };
      default:
        return {
          maxWidth: 800,
          maxHeight: 600,
          quality: 0.85,
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
          const imageUrl = result.profile.avatarUrl;
          setPreviewUrl(imageUrl);
          onImageUploaded?.(imageUrl, result.profile);
        }
      } else {
        // Use general image upload
        const options = {
          folder: variant === 'banner' ? 'newsor/banners' : 'newsor/uploads',
          maxWidth: config.maxWidth,
          maxHeight: config.maxHeight,
          quality: config.quality
        };
        
        result = await imageService.processAndUploadImage(file, options);
        setPreviewUrl(result.url);
        onImageUploaded?.(result.url, result);
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
    setPreviewUrl(null);
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
        {variant === 'standard' && `Max size: ${maxSizeInMB}MB`}
      </Typography>
    </Stack>
  );
}
