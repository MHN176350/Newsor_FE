import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'react-hot-toast';
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
  Chip,
  Divider,
} from '@mui/joy';
import { useAuth } from '../core/presentation/hooks/useAuth';
import RichTextEditor from '../components/RichTextEditor';
import TagAutocomplete from '../components/TagAutocomplete';
import ImageUpload from '../components/ImageUpload';
import { UPDATE_NEWS } from '../graphql/mutations';
import { GET_CATEGORIES, GET_TAGS, GET_NEWS_ARTICLE } from '../graphql/queries';
import { useTranslation } from 'react-i18next';

export default function WriterNewsDetailPage() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    categoryId: '',
    tags: [],
    featuredImage: '',
    metaDescription: '',
    metaKeywords: '',
  });
  const [errors, setErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // GraphQL hooks
  const { data: articleData, loading: articleLoading, error: articleError } = useQuery(GET_NEWS_ARTICLE, {
    variables: { id: parseInt(id) },
    skip: !id
  });
  const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_CATEGORIES);
  const { data: tagsData, loading: tagsLoading } = useQuery(GET_TAGS);
  const [updateNews] = useMutation(UPDATE_NEWS);

  // Memoized values - must be before any conditional returns
  const categories = useMemo(() => categoriesData?.categories || [], [categoriesData?.categories]);
  const allTags = useMemo(() => tagsData?.tags || [], [tagsData?.tags]);
  
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
    
    // Clear errors for this field
    setErrors(prev => prev.filter(error => !error.includes(field)));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = [];
    
    if (!formData.title.trim()) {
      newErrors.push(t('validation.required', { field: t('writerDetail.titleLabel') }));
    } else if (formData.title.trim().length < 5) {
      newErrors.push(t('writerDetail.validation.titleMinLength'));
    }
    
    if (!formData.content || formData.content.trim() === '' || formData.content === '<p></p>') {
      newErrors.push(t('writerDetail.validation.contentRequired'));
    }
    
    if (!formData.excerpt.trim()) {
      newErrors.push(t('validation.required', { field: t('writerDetail.excerptLabel') }));
    } else if (formData.excerpt.trim().length < 10) {
      newErrors.push(t('writerDetail.validation.excerptMinLength'));
    }
    
    if (!formData.categoryId) {
      newErrors.push(t('validation.required', { field: t('common.category') }));
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  }, [formData.title, formData.content, formData.excerpt, formData.categoryId, t]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      toast.error(t('writerDetail.validation.fixErrors'));
      return;
    }

    if (!window.confirm(t('writerDetail.confirmSubmit'))) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data } = await updateNews({
        variables: {
          id: parseInt(id),
          title: formData.title.trim(),
          content: formData.content,
          excerpt: formData.excerpt.trim(),
          categoryId: parseInt(formData.categoryId),
          tagIds: formData.tags.map(tag => parseInt(tag.id)),
          featuredImage: formData.featuredImage,
          metaDescription: formData.metaDescription,
          metaKeywords: formData.metaKeywords,
        }
      });

      if (data?.updateNews?.success) {
        toast.success(t('writerDetail.success'));
        navigate('/my-articles', { 
          state: { message: t('writerDetail.successState') }
        });
      } else {
        const errorMessage = data?.updateNews?.errors?.join(', ') || t('writerDetail.updateFailed');
        toast.error(errorMessage);
        setErrors([errorMessage]);
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error(t('writerDetail.updateError'));
      setErrors([t('writerDetail.updateError')]);
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, updateNews, id, formData, navigate, t]);

  const handleCancel = useCallback(() => {
    if (hasChanges && !window.confirm(t('writerDetail.confirmLeave'))) {
      return;
    }
    navigate('/my-articles');
  }, [hasChanges, navigate, t]);

  const getWordCount = useCallback((content) => {
    const text = content?.replace(/<[^>]*>/g, '') || '';
    return text.split(/\s+/).filter(Boolean).length;
  }, []);

  const wordCount = useMemo(() => getWordCount(formData.content), [getWordCount, formData.content]);
  const readingTime = useMemo(() => Math.max(1, Math.round(wordCount / 225)), [wordCount]);

  const getStatusColor = useCallback((status) => {
    switch (status?.toLowerCase()) {
      case 'published': return 'success';
      case 'draft': return 'neutral';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
      default: return 'neutral';
    }
  }, []);

  // Load article data when it's available
  useEffect(() => {
    if (articleData?.newsArticle) {
      const article = articleData.newsArticle;
      setFormData({
        title: article.title || '',
        content: article.content || '',
        excerpt: article.excerpt || '',
        categoryId: article.category?.id?.toString() || '',
        tags: article.tags || [],
        featuredImage: article.featuredImageUrl || '',
        metaDescription: article.metaDescription || '',
        metaKeywords: article.metaKeywords || '',
      });
    }
  }, [articleData]);

  // Derived state - calculated after hooks
  const userRole = user?.profile?.role?.toLowerCase();
  const canEditArticles = ['writer', 'manager', 'admin'].includes(userRole);
  const article = articleData?.newsArticle;
  const canEdit = article ? ['draft', 'rejected'].includes(article.status?.toLowerCase()) : false;

  // Check authentication and permissions - render conditionally
  if (!isAuthenticated) {
    return (
      <Box textAlign="center" py={6}>
        <Typography level="h3" sx={{ mb: 2 }}>
          {t('writerDetail.authRequired')}
        </Typography>
        <Typography level="body1" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
          {t('writerDetail.signInMessage')}
        </Typography>
        <Button onClick={() => navigate('/login')}>
          {t('auth.login.signIn')}
        </Button>
      </Box>
    );
  }

  if (!canEditArticles) {
    return (
      <Box textAlign="center" py={6}>
        <Typography level="h3" sx={{ mb: 2, color: 'danger.500' }}>
          {t('writerDetail.permissionDenied')}
        </Typography>
        <Typography level="body1" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
          {t('writerDetail.writerPrivileges')}
        </Typography>
        <Button onClick={() => navigate('/my-articles')}>
          {t('writerDetail.backToMyArticles')}
        </Button>
      </Box>
    );
  }

  if (articleLoading || categoriesLoading || tagsLoading) {
    return (
      <Box textAlign="center" py={6}>
        <CircularProgress />
        <Typography level="body1" sx={{ mt: 2 }}>
          {t('writerDetail.loadingArticle')}
        </Typography>
      </Box>
    );
  }

  if (articleError || !article) {
    return (
      <Box textAlign="center" py={6}>
        <Typography level="h3" sx={{ mb: 2, color: 'danger.500' }}>
          {t('writerDetail.articleNotFound')}
        </Typography>
        <Typography level="body1" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
          {t('writerDetail.articleNotFoundMessage')}
        </Typography>
        <Button onClick={() => navigate('/my-articles')}>
          {t('writerDetail.backToMyArticles')}
        </Button>
      </Box>
    );
  }

  if (!canEdit) {
    return (
      <Box textAlign="center" py={6}>
        <Typography level="h3" sx={{ mb: 2, color: 'warning.500' }}>
          {t('writerDetail.cannotEdit')}
        </Typography>
        <Typography level="body1" sx={{ mb: 2, color: 'var(--joy-palette-text-secondary)' }}>
          {t('writerDetail.cannotEditMessage')}
        </Typography>
        <Typography level="body2" sx={{ mb: 3 }}>
          {t('writerDetail.currentStatus')}: <Chip size="sm" color={getStatusColor(article.status)}>{article.status}</Chip>
        </Typography>
        <Button onClick={() => navigate('/my-articles')}>
          {t('writerDetail.backToMyArticles')}
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography level="h1" sx={{ mb: 1 }}>
            ✏️ {t('writerDetail.title')}
          </Typography>
          <Typography level="body1" sx={{ color: 'var(--joy-palette-text-secondary)', mb: 2 }}>
            {t('writerDetail.subtitle')}
          </Typography>
          <Box display="flex" gap={2} alignItems="center">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography level="body-sm">{t('common.status')}:</Typography>
              <Chip size="sm" color={getStatusColor(article.status)}>{article.status}</Chip>
            </Box>
            <Typography level="body-sm" color="neutral">
              {t('writerDetail.created')}: {new Date(article.createdAt).toLocaleDateString()}
            </Typography>
            {wordCount > 0 && (
              <Typography level="body-sm" color="neutral">
                {wordCount} {t('writerDetail.words')} • {readingTime} {t('writerDetail.minRead')}
              </Typography>
            )}
          </Box>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="solid"
            onClick={handleSubmit}
            loading={isSubmitting}
            color="success"
          >
            {isSubmitting ? t('writerDetail.submitting') : t('writerDetail.saveAndSubmit')}
          </Button>
        </Box>
      </Box>

      {/* Errors */}
      {errors.length > 0 && (
        <Alert color="danger" sx={{ mb: 3 }}>
          <Box>
            <Typography level="title-sm">{t('writerDetail.fixErrors')}:</Typography>
            <ul style={{ margin: '8px 0 0 16px', padding: 0 }}>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Box>
        </Alert>
      )}

      {/* Unsaved changes warning */}
      {hasChanges && (
        <Alert color="warning" sx={{ mb: 3 }}>
          {t('writerDetail.unsavedChanges')}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
        {/* Main Content */}
        <Box sx={{ flex: 2 }}>
          <Card variant="outlined">
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                {/* Title */}
                <FormControl required>
                  <FormLabel>{t('writerDetail.titleLabel')}</FormLabel>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder={t('writerDetail.titlePlaceholder')}
                    error={Boolean(errors?.some(err => err.includes('Title')))}
                  />
                  <Typography level="body-xs" sx={{ textAlign: 'right', mt: 0.5 }}>
                    {formData.title.length}/100 {t('writerDetail.characters')}
                  </Typography>
                </FormControl>

                {/* Excerpt */}
                <FormControl required>
                  <FormLabel>{t('writerDetail.excerptLabel')}</FormLabel>
                  <Textarea
                    value={formData.excerpt}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
                    placeholder={t('writerDetail.excerptPlaceholder')}
                    minRows={3}
                    maxRows={5}
                    error={Boolean(errors?.some(err => err.includes('Excerpt')))}
                  />
                  <Typography level="body-xs" sx={{ textAlign: 'right', mt: 0.5 }}>
                    {formData.excerpt.length}/300 {t('writerDetail.characters')}
                  </Typography>
                </FormControl>

                {/* Content */}
                <FormControl required>
                  <FormLabel>{t('writerDetail.contentLabel')}</FormLabel>
                  <RichTextEditor
                    content={formData.content}
                    onChange={(content) => handleInputChange('content', content)}
                    placeholder={t('writerDetail.contentPlaceholder')}
                  />
                  {wordCount > 0 && (
                    <Typography level="body-xs" sx={{ mt: 1 }}>
                      {wordCount} {t('writerDetail.words')} • {t('writerDetail.estimatedReading')}: {readingTime} {t('writerDetail.minutes')}
                    </Typography>
                  )}
                </FormControl>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Sidebar */}
        <Box sx={{ flex: 1 }}>
          <Stack spacing={3}>
            {/* Publishing Options */}
            <Card variant="outlined">
              <CardContent>
                <Typography level="title-md" sx={{ mb: 2 }}>
                  📋 Publishing Details
                </Typography>
                
                <Stack spacing={2}>
                  {/* Category */}
                  <FormControl required>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={formData.categoryId}
                      onChange={(event, newValue) => handleInputChange('categoryId', newValue)}
                      placeholder="Select a category"
                      error={Boolean(errors?.some(err => err.includes('Category')))}
                    >
                      {categories.map((category) => (
                        <Option key={category.id} value={category.id.toString()}>
                          {category.name}
                        </Option>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Tags */}
                  <FormControl>
                    <FormLabel>Tags (Optional)</FormLabel>
                    <TagAutocomplete
                      tags={allTags}
                      selectedTags={formData.tags}
                      onTagsChange={(tags) => handleInputChange('tags', tags)}
                      loading={tagsLoading}
                      placeholder="Add tags to help categorize your article"
                    />
                  </FormControl>
                </Stack>
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card variant="outlined">
              <CardContent>
                <Typography level="title-md" sx={{ mb: 2 }}>
                  🖼️ Featured Image
                </Typography>
                <ImageUpload
                  currentImageUrl={formData.featuredImage}
                  onImageUploaded={(imageUrl) => handleInputChange('featuredImage', imageUrl)}
                  onImageRemoved={() => handleInputChange('featuredImage', '')}
                  placeholder="Upload a featured image for your article"
                  showPreview={true}
                  uploadButtonText="Upload Featured Image"
                  removeButtonText="Remove Image"
                />
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card variant="outlined">
              <CardContent>
                <Typography level="title-md" sx={{ mb: 2 }}>
                  🔍 SEO Settings (Optional)
                </Typography>
                
                <Stack spacing={2}>
                  <FormControl>
                    <FormLabel>Meta Description</FormLabel>
                    <Textarea
                      value={formData.metaDescription}
                      onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                      placeholder="Brief description for search engines (max 160 characters)"
                      minRows={2}
                      maxRows={3}
                    />
                    <Typography level="body-xs" sx={{ textAlign: 'right', mt: 0.5 }}>
                      {formData.metaDescription.length}/160 characters
                    </Typography>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Meta Keywords</FormLabel>
                    <Input
                      value={formData.metaKeywords}
                      onChange={(e) => handleInputChange('metaKeywords', e.target.value)}
                      placeholder="Comma-separated keywords"
                    />
                  </FormControl>
                </Stack>
              </CardContent>
            </Card>

            {/* Article Info */}
            <Card variant="outlined">
              <CardContent>
                <Typography level="title-md" sx={{ mb: 2 }}>
                  📊 Article Info
                </Typography>
                
                <Stack spacing={1}>
                  <Typography level="body-sm">
                    <strong>Created:</strong> {new Date(article.createdAt).toLocaleDateString()}
                  </Typography>
                  {article.updatedAt && (
                    <Typography level="body-sm">
                      <strong>Last Updated:</strong> {new Date(article.updatedAt).toLocaleDateString()}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography level="body-sm">
                      <strong>Status:</strong>
                    </Typography>
                    <Chip size="sm" color={getStatusColor(article.status)}>{article.status}</Chip>
                  </Box>
                  {article.status?.toLowerCase() === 'rejected' && article.rejectionReason && (
                    <Box sx={{ mt: 1, p: 2, bgcolor: 'danger.50', borderRadius: 'sm' }}>
                      <Typography level="body-sm" color="danger">
                        <strong>Rejection Reason:</strong> {article.rejectionReason}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
