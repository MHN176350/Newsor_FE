import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Input,
  Textarea,
  Select,
  Option,
  Button,
  Stack,
  Alert,
  Chip,
  FormControl,
  FormLabel,
  CircularProgress,
} from '@mui/joy';
import { useAuth } from '../core/presentation/hooks/useAuth';
import RichTextEditor from '../components/RichTextEditor';
import { CREATE_NEWS } from '../graphql/mutations';
import { GET_CATEGORIES, GET_TAGS } from '../graphql/queries';

export default function CreateArticlePage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    categoryId: '',
    tagIds: [],
    featuredImage: '',
    metaDescription: '',
    metaKeywords: '',
  });
  const [errors, setErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // GraphQL hooks
  const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_CATEGORIES);
  const { data: tagsData, loading: tagsLoading } = useQuery(GET_TAGS);
  const [createNews] = useMutation(CREATE_NEWS);

  // Check authentication and permissions
  if (!isAuthenticated) {
    return (
      <Box textAlign="center" py={6}>
        <Typography level="h3" sx={{ mb: 2 }}>
          Authentication Required
        </Typography>
        <Typography level="body1" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
          Please sign in to create articles.
        </Typography>
        <Button onClick={() => navigate('/login')}>
          Sign In
        </Button>
      </Box>
    );
  }

  const userRole = user?.profile?.role?.toLowerCase();
  const canCreateArticles = ['writer', 'manager', 'admin'].includes(userRole);

  if (!canCreateArticles) {
    return (
      <Box textAlign="center" py={6}>
        <Typography level="h3" sx={{ mb: 2, color: 'danger.500' }}>
          Permission Denied
        </Typography>
        <Typography level="body1" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
          You need writer privileges to create articles.
        </Typography>
        <Typography level="body2" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
          Your current role: {user?.profile?.role || 'Reader'}
        </Typography>
        <Button onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    );
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setErrors([]);
  };

  const handleTagChange = (event, newValue) => {
    const tagIds = newValue?.map(tag => parseInt(tag)) || [];
    setFormData(prev => ({
      ...prev,
      tagIds
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.content.trim()) {
        throw new Error('Content is required');
      }
      if (!formData.excerpt.trim()) {
        throw new Error('Excerpt is required');
      }
      if (!formData.categoryId) {
        throw new Error('Category is required');
      }

      const { data } = await createNews({
        variables: {
          title: formData.title.trim(),
          content: formData.content,
          excerpt: formData.excerpt.trim(),
          categoryId: parseInt(formData.categoryId),
          tagIds: formData.tagIds.length > 0 ? formData.tagIds : null,
          featuredImage: formData.featuredImage || null,
          metaDescription: formData.metaDescription || null,
          metaKeywords: formData.metaKeywords || null,
        }
      });

      if (data?.createNews?.success) {
        navigate('/news', { 
          state: { 
            message: 'Article created successfully! It has been saved as a draft.' 
          }
        });
      } else {
        setErrors(data?.createNews?.errors || ['Failed to create article']);
      }
    } catch (error) {
      console.error('Error creating article:', error);
      setErrors([error.message || 'Failed to create article']);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography level="h1" sx={{ mb: 2 }}>
          ✍️ Create New Article
        </Typography>
        <Typography level="body1" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
          Share your story with the world
        </Typography>
      </Box>

      {/* Form */}
      <Card variant="outlined">
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {/* Error Display */}
              {errors.length > 0 && (
                <Alert color="danger">
                  <Stack spacing={1}>
                    {errors.map((error, index) => (
                      <Typography key={index} level="body2">
                        {error}
                      </Typography>
                    ))}
                  </Stack>
                </Alert>
              )}

              {/* Title */}
              <FormControl required>
                <FormLabel>Article Title</FormLabel>
                <Input
                  placeholder="Enter a compelling title for your article"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  size="lg"
                />
              </FormControl>

              {/* Excerpt */}
              <FormControl required>
                <FormLabel>Excerpt</FormLabel>
                <Textarea
                  placeholder="Write a brief summary of your article (max 300 characters)"
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  maxRows={3}
                  maxLength={300}
                />
                <Typography level="body-xs" sx={{ textAlign: 'right', mt: 1 }}>
                  {formData.excerpt.length}/300
                </Typography>
              </FormControl>

              {/* Category */}
              <FormControl required>
                <FormLabel>Category</FormLabel>
                {categoriesLoading ? (
                  <CircularProgress size="sm" />
                ) : (
                  <Select
                    placeholder="Select a category"
                    value={formData.categoryId}
                    onChange={(event, newValue) => handleInputChange('categoryId', newValue)}
                  >
                    {categoriesData?.categories?.map((category) => (
                      <Option key={category.id} value={category.id}>
                        {category.name}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormControl>

              {/* Tags */}
              <FormControl>
                <FormLabel>Tags (Optional)</FormLabel>
                {tagsLoading ? (
                  <CircularProgress size="sm" />
                ) : (
                  <Select
                    placeholder="Select tags"
                    multiple
                    value={formData.tagIds.map(String)}
                    onChange={handleTagChange}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', gap: '0.25rem' }}>
                        {selected.map((selectedValue) => {
                          const tag = tagsData?.tags?.find(t => t.id === parseInt(selectedValue));
                          return (
                            <Chip key={selectedValue} variant="soft" size="sm">
                              {tag?.name}
                            </Chip>
                          );
                        })}
                      </Box>
                    )}
                  >
                    {tagsData?.tags?.map((tag) => (
                      <Option key={tag.id} value={String(tag.id)}>
                        {tag.name}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormControl>

              {/* Content */}
              <FormControl required>
                <FormLabel>Article Content</FormLabel>
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) => handleInputChange('content', content)}
                  placeholder="Start writing your article here. You can format text, add images, and create rich content..."
                />
              </FormControl>

              {/* SEO Fields */}
              <Typography level="h4" sx={{ mt: 2 }}>
                SEO Settings (Optional)
              </Typography>

              <FormControl>
                <FormLabel>Meta Description</FormLabel>
                <Textarea
                  placeholder="Brief description for search engines (max 160 characters)"
                  value={formData.metaDescription}
                  onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                  maxRows={2}
                  maxLength={160}
                />
                <Typography level="body-xs" sx={{ textAlign: 'right', mt: 1 }}>
                  {formData.metaDescription.length}/160
                </Typography>
              </FormControl>

              <FormControl>
                <FormLabel>Meta Keywords</FormLabel>
                <Input
                  placeholder="Comma-separated keywords (e.g., tech, news, innovation)"
                  value={formData.metaKeywords}
                  onChange={(e) => handleInputChange('metaKeywords', e.target.value)}
                />
              </FormControl>

              {/* Submit Buttons */}
              <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', mt: 4 }}>
                <Button
                  variant="plain"
                  onClick={() => navigate('/news')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Article'}
                </Button>
              </Stack>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
