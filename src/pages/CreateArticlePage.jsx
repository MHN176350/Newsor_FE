import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  FormControl,
  FormLabel,
  CircularProgress,
} from '@mui/joy';
import { useAuth } from '../core/presentation/hooks/useAuth';
import RichTextEditor from '../components/RichTextEditor';
import TagAutocomplete from '../components/TagAutocomplete';
import ImageUpload from '../components/ImageUpload';
import { CREATE_NEWS, UPDATE_NEWS } from '../graphql/mutations';
import { GET_CATEGORIES, GET_TAGS, GET_NEWS } from '../graphql/queries';

export default function CreateArticlePage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { mode, id } = useParams(); // mode can be 'new' or 'edit', id is article id for editing

  const isEditing = mode === 'edit' && id;

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    categoryId: '',
    tags: [], // Changed from tagIds to tags (array of tag objects)
    featuredImage: '',
    metaDescription: '',
    metaKeywords: '',
  });
  const [errors, setErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // GraphQL hooks
  const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_CATEGORIES);
  const { data: tagsData, loading: tagsLoading } = useQuery(GET_TAGS);
  const { data: articleData, loading: articleLoading } = useQuery(
    GET_NEWS,
    {
      variables: { id: parseInt(id) },
      skip: !isEditing
    }
  );
  const [createNews] = useMutation(CREATE_NEWS, {
    onCompleted: (data) => {
      if (data?.createNews?.success) {
        // Navigate after successful creation
        navigate('/my-articles', { 
          state: { 
            message: 'Article created successfully! It has been saved as a draft.' 
          }
        });
      }
    }
  });
  const [updateNews] = useMutation(UPDATE_NEWS, {
    onCompleted: (data) => {
      if (data?.updateNews?.success) {
        // Navigate after successful update
        navigate('/my-articles', { 
          state: { 
            message: 'Article updated successfully!' 
          }
        });
      }
    }
  });

  // Populate form data when editing
  useEffect(() => {
    if (isEditing && articleData?.newsArticle) {
      const article = articleData.newsArticle;
      setFormData({
        title: article.title || '',
        content: article.content || '',
        excerpt: article.excerpt || '',
        categoryId: article.category?.id || '',
        tags: article.tags || [],
        featuredImage: article.featuredImageUrl || '',
        metaDescription: article.metaDescription || '',
        metaKeywords: article.metaKeywords || '',
      });
    }
  }, [isEditing, articleData]);

  // Check authentication and permissions
  if (!isAuthenticated) {
    return (
      <Box textAlign="center" py={6}>
        <Typography level="h3" sx={{ mb: 2 }}>
          Authentication Required
        </Typography>
        <Typography level="body1" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
          Please sign in to {isEditing ? 'edit' : 'create'} articles.
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
          You need writer privileges to {isEditing ? 'edit' : 'create'} articles.
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

  // Show loading state when editing and article data is loading
  if (isEditing && articleLoading) {
    return (
      <Box textAlign="center" py={6}>
        <CircularProgress />
        <Typography level="body1" sx={{ mt: 2 }}>
          Loading article...
        </Typography>
      </Box>
    );
  }

  // Check if article exists and user owns it when editing
  if (isEditing && articleData && !articleLoading) {
    const article = articleData.newsArticle;
    if (!article) {
      return (
        <Box textAlign="center" py={6}>
          <Typography level="h3" sx={{ mb: 2, color: 'danger.500' }}>
            Article Not Found
          </Typography>
          <Typography level="body1" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
            The article you're trying to edit doesn't exist.
          </Typography>
          <Button onClick={() => navigate('/my-articles')}>
            Back to My Articles
          </Button>
        </Box>
      );
    }

    // Check if user owns the article (unless they're admin/manager)
    if (!['admin', 'manager'].includes(userRole) && article.author.id !== user.id) {
      return (
        <Box textAlign="center" py={6}>
          <Typography level="h3" sx={{ mb: 2, color: 'danger.500' }}>
            Permission Denied
          </Typography>
          <Typography level="body1" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
            You can only edit your own articles.
          </Typography>
          <Button onClick={() => navigate('/my-articles')}>
            Back to My Articles
          </Button>
        </Box>
      );
    }

    // Check if article can be edited (only drafts and rejected articles)
    if (!['draft', 'rejected'].includes(article.status?.toLowerCase())) {
      return (
        <Box textAlign="center" py={6}>
          <Typography level="h3" sx={{ mb: 2, color: 'warning.500' }}>
            Cannot Edit Article
          </Typography>
          <Typography level="body1" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
            You can only edit articles that are in draft or rejected status.
          </Typography>
          <Typography level="body2" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
            Current status: {article.status}
          </Typography>
          <Button onClick={() => navigate('/my-articles')}>
            Back to My Articles
          </Button>
        </Box>
      );
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setErrors([]);
  };

  const handleTagsChange = (newTags) => {
    setFormData(prev => ({
      ...prev,
      tags: newTags
    }));
    setErrors([]);
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

      const variables = {
        title: formData.title.trim(),
        content: formData.content,
        excerpt: formData.excerpt.trim(),
        categoryId: parseInt(formData.categoryId),
        tagIds: formData.tags.length > 0 ? formData.tags.map(tag => parseInt(tag.id)) : null,
        featuredImage: formData.featuredImage || null,
        metaDescription: formData.metaDescription || null,
        metaKeywords: formData.metaKeywords || null,
      };

      let data;
      if (isEditing) {
        // Update existing article
        const result = await updateNews({
          variables: { id: parseInt(id), ...variables }
        });
        data = result.data;
      } else {
        // Create new article
        const result = await createNews({ variables });
        data = result.data;
      }

      const operation = isEditing ? 'updateNews' : 'createNews';
      if (!data?.[operation]?.success) {
        setErrors(data?.[operation]?.errors || [`Failed to ${isEditing ? 'update' : 'create'} article`]);
      }
      // Success is handled by onCompleted callback
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} article:`, error);
      setErrors([error.message || `Failed to ${isEditing ? 'update' : 'create'} article`]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography level="h1" sx={{ mb: 2 }}>
          ✍️ {isEditing ? 'Edit Article' : 'Create New Article'}
        </Typography>
        <Typography level="body1" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
          {isEditing ? 'Make changes to your article' : 'Share your story with the world'}
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
              <TagAutocomplete
                tags={tagsData?.tags || []}
                selectedTags={formData.tags}
                onTagsChange={handleTagsChange}
                loading={tagsLoading}
                label="Tags (Optional)"
                placeholder="Type to search or add tags..."
              />

              {/* Featured Image/Thumbnail */}
              <FormControl>
                <FormLabel>Featured Image (Thumbnail)</FormLabel>
                <ImageUpload
                  variant="thumbnail"
                  currentImageUrl={formData.featuredImage}
                  onImageUploaded={(imageUrl) => handleInputChange('featuredImage', imageUrl)}
                  onImageRemoved={() => handleInputChange('featuredImage', '')}
                  maxSizeInMB={5}
                  uploadButtonText="Upload Thumbnail"
                  removeButtonText="Remove Thumbnail"
                />
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
                  onClick={() => navigate('/my-articles')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Article' : 'Create Article')}
                </Button>
              </Stack>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
