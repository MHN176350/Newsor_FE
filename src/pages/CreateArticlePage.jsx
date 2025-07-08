import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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
import { useTranslation } from 'react-i18next';

export default function CreateArticlePage() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams(); // id is article id for editing/duplicating
  const location = useLocation();
  
  // Determine mode based on current path
  const isEditing = location.pathname.includes('/edit/');
  const isDuplicating = location.pathname.includes('/duplicate/');
  const isCreating = !isEditing && !isDuplicating;

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
      skip: !isEditing && !isDuplicating
    }
  );
  const [createNews] = useMutation(CREATE_NEWS, {
    onCompleted: (data) => {
      if (data?.createNews?.success) {
        // Navigate after successful creation
        navigate('/my-articles', { 
          state: { 
            message: t('createArticle.successCreate') 
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
            message: t('createArticle.successUpdate') 
          }
        });
      }
    }
  });

  // Populate form data when editing
  useEffect(() => {
    if ((isEditing || isDuplicating) && articleData?.newsArticle) {
      const article = articleData.newsArticle;
      setFormData({
        title: isDuplicating ? `${article.title} (Copy)` : (article.title || ''),
        content: article.content || '',
        excerpt: article.excerpt || '',
        categoryId: article.category?.id || '',
        tags: article.tags || [],
        featuredImage: article.featuredImageUrl || '',
        metaDescription: article.metaDescription || '',
        metaKeywords: article.metaKeywords || '',
      });
    }
  }, [isEditing, isDuplicating, articleData]);

  // Check authentication and permissions
  if (!isAuthenticated) {
    return (
      <Box textAlign="center" py={6}>
        <Typography level="h3" sx={{ mb: 2 }}>
          {t('createArticle.authRequired')}
        </Typography>
        <Typography level="body1" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
          {t('createArticle.signInMessage', { action: isEditing ? t('common.edit') : isDuplicating ? t('createArticle.duplicate') : t('common.create') })}
        </Typography>
        <Button onClick={() => navigate('/login')}>
          {t('auth.login.signIn')}
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
          {t('createArticle.permissionDenied')}
        </Typography>
        <Typography level="body1" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
          {t('createArticle.writerPrivileges', { action: isEditing ? t('common.edit') : t('common.create') })}
        </Typography>
        <Typography level="body2" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
          {t('createArticle.currentRole')}: {user?.profile?.role || t('common.reader')}
        </Typography>
        <Button onClick={() => navigate(-1)}>
          {t('common.back')}
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
          {t('createArticle.loadingArticle')}
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
            {t('createArticle.articleNotFound')}
          </Typography>
          <Typography level="body1" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
            {t('createArticle.articleNotFoundMessage')}
          </Typography>
          <Button onClick={() => navigate('/my-articles')}>
            {t('createArticle.backToMyArticles')}
          </Button>
        </Box>
      );
    }

    // Check if user owns the article (unless they're admin/manager)
    if (!['admin', 'manager'].includes(userRole) && article.author.id !== user.id) {
      return (
        <Box textAlign="center" py={6}>
          <Typography level="h3" sx={{ mb: 2, color: 'danger.500' }}>
            {t('createArticle.permissionDenied')}
          </Typography>
          <Typography level="body1" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
            {t('createArticle.canOnlyEditOwn')}
          </Typography>
          <Button onClick={() => navigate('/my-articles')}>
            {t('createArticle.backToMyArticles')}
          </Button>
        </Box>
      );
    }

    // Check if article can be edited (only drafts and rejected articles)
    if (!['draft', 'rejected'].includes(article.status?.toLowerCase())) {
      return (
        <Box textAlign="center" py={6}>
          <Typography level="h3" sx={{ mb: 2, color: 'warning.500' }}>
            {t('createArticle.cannotEdit')}
          </Typography>
          <Typography level="body1" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
            {t('createArticle.cannotEditMessage')}
          </Typography>
          <Typography level="body2" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
            {t('createArticle.currentStatus')}: {article.status}
          </Typography>
          <Button onClick={() => navigate('/my-articles')}>
            {t('createArticle.backToMyArticles')}
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
        throw new Error(t('validation.required'));
      }
      if (!formData.content.trim()) {
        throw new Error(t('createArticle.contentRequired'));
      }
      if (!formData.excerpt.trim()) {
        throw new Error(t('createArticle.excerptRequired'));
      }
      if (!formData.categoryId) {
        throw new Error(t('createArticle.categoryRequired'));
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
        // Create new article (includes duplication)
        const result = await createNews({ variables });
        data = result.data;
      }

      const operation = isEditing ? 'updateNews' : 'createNews';
      if (!data?.[operation]?.success) {
        setErrors(data?.[operation]?.errors || [t('createArticle.failedMessage', { action: isEditing ? t('common.update') : isDuplicating ? t('createArticle.duplicate') : t('common.create') })]);
      }
      // Success is handled by onCompleted callback
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : isDuplicating ? 'duplicating' : 'creating'} article:`, error);
      setErrors([error.message || t('createArticle.failedMessage', { action: isEditing ? t('common.update') : isDuplicating ? t('createArticle.duplicate') : t('common.create') })]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography level="h1" sx={{ mb: 2 }}>
          ✍️ {isEditing ? t('createArticle.editTitle') : isDuplicating ? t('createArticle.duplicateTitle') : t('createArticle.createTitle')}
        </Typography>
        <Typography level="body1" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
          {isEditing ? t('createArticle.editSubtitle') : isDuplicating ? t('createArticle.duplicateSubtitle') : t('createArticle.createSubtitle')}
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
                <FormLabel>{t('createArticle.titleLabel')}</FormLabel>
                <Input
                  placeholder={t('createArticle.titlePlaceholder')}
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  size="lg"
                />
              </FormControl>

              {/* Excerpt */}
              <FormControl required>
                <FormLabel>{t('createArticle.excerptLabel')}</FormLabel>
                <Textarea
                  placeholder={t('createArticle.excerptPlaceholder')}
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
                <FormLabel>{t('createArticle.categoryLabel')}</FormLabel>
                {categoriesLoading ? (
                  <CircularProgress size="sm" />
                ) : (
                  <Select
                    placeholder={t('createArticle.categoryPlaceholder')}
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
                label={t('createArticle.tagsLabel')}
                placeholder={t('createArticle.tagsPlaceholder')}
              />

              {/* Featured Image/Thumbnail */}
              <FormControl>
                <FormLabel>{t('createArticle.featuredImageLabel')}</FormLabel>
                <ImageUpload
                  variant="thumbnail"
                  currentImageUrl={formData.featuredImage}
                  onImageUploaded={(imageUrl) => handleInputChange('featuredImage', imageUrl)}
                  onImageRemoved={() => handleInputChange('featuredImage', '')}
                  maxSizeInMB={5}
                  uploadButtonText={t('createArticle.uploadThumbnail')}
                  removeButtonText={t('createArticle.removeThumbnail')}
                />
              </FormControl>

              {/* Content */}
              <FormControl required>
                <FormLabel>{t('createArticle.contentLabel')}</FormLabel>
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) => handleInputChange('content', content)}
                  placeholder={t('createArticle.contentPlaceholder')}
                />
              </FormControl>

              {/* SEO Fields */}
              <Typography level="h4" sx={{ mt: 2 }}>
                {t('createArticle.seoTitle')}
              </Typography>

              <FormControl>
                <FormLabel>{t('createArticle.metaDescriptionLabel')}</FormLabel>
                <Textarea
                  placeholder={t('createArticle.metaDescriptionPlaceholder')}
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
                <FormLabel>{t('createArticle.metaKeywordsLabel')}</FormLabel>
                <Input
                  placeholder={t('createArticle.metaKeywordsPlaceholder')}
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
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (isEditing ? t('createArticle.updating') : t('createArticle.creating')) : (isEditing ? t('createArticle.updateButton') : t('createArticle.createButton'))}
                </Button>
              </Stack>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
