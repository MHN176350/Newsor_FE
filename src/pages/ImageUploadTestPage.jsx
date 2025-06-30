import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/joy';
import ImageUpload from '../components/ImageUpload';

/**
 * Test page for image upload functionality
 */
export default function ImageUploadTestPage() {
  const handleImageUploaded = (imageUrl, result) => {
    console.log('Image uploaded successfully:', { imageUrl, result });
    alert(`Image uploaded successfully!\nURL: ${imageUrl}`);
  };

  const handleImageRemoved = () => {
    console.log('Image removed');
    alert('Image removed');
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
      <Typography level="h1" sx={{ mb: 4, textAlign: 'center' }}>
        Image Upload Test
      </Typography>

      {/* Standard Image Upload */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography level="h3" sx={{ mb: 2 }}>
            Standard Image Upload
          </Typography>
          <ImageUpload
            variant="standard"
            onImageUploaded={handleImageUploaded}
            onImageRemoved={handleImageRemoved}
            uploadButtonText="Upload Standard Image"
            maxSizeInMB={5}
          />
        </CardContent>
      </Card>

      {/* Avatar Image Upload */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography level="h3" sx={{ mb: 2 }}>
            Avatar Image Upload
          </Typography>
          <ImageUpload
            variant="avatar"
            onImageUploaded={handleImageUploaded}
            onImageRemoved={handleImageRemoved}
            uploadButtonText="Upload Avatar"
            maxSizeInMB={2}
          />
        </CardContent>
      </Card>

      {/* Banner Image Upload */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography level="h3" sx={{ mb: 2 }}>
            Banner Image Upload
          </Typography>
          <ImageUpload
            variant="banner"
            onImageUploaded={handleImageUploaded}
            onImageRemoved={handleImageRemoved}
            uploadButtonText="Upload Banner"
            maxSizeInMB={5}
          />
        </CardContent>
      </Card>
    </Box>
  );
}
