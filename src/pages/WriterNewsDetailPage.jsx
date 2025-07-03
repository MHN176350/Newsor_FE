import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'react-hot-toast';
import {
  Box,
  Typography,
  Input,
  Textarea,
  Button,
  Card,
  Stack,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Select,
  Option,
  FormControl,
  FormLabel,
  AspectRatio
} from '@mui/joy';
import RichTextEditor from '../components/RichTextEditor';
import { GET_NEWS_ARTICLE, GET_CATEGORIES, GET_TAGS } from '../graphql/queries';
import { UPDATE_NEWS, GET_CLOUDINARY_SIGNATURE } from '../graphql/mutations';

const WriterNewsDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');
  const [validationErrors, setValidationErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    categoryId: '',
    tagIds: [],
    featuredImage: '',
    metaDescription: '',
    metaKeywords: ''
  });

  const { data: articleData, loading: articleLoading, error: articleError, refetch } = useQuery(GET_NEWS_ARTICLE, {
    variables: { id: parseInt(id) },
    skip: !id
  });
  const { data: categoriesData } = useQuery(GET_CATEGORIES);
  const { data: tagsData } = useQuery(GET_TAGS);
  const [updateNews] = useMutation(UPDATE_NEWS, {
    onCompleted: (data) => {
      if (data.updateNews.success) {
        toast.success('Article updated successfully and submitted for review!');
        setIsEditing(false);
        setIsDirty(false);
        refetch();
      } else {
        toast.error(data.updateNews.errors.join(', '));
      }
    },
    onError: (error) => {
      toast.error(`Update failed: ${error.message}`);
    }
  });
  const [getCloudinarySignature] = useMutation(GET_CLOUDINARY_SIGNATURE);

  useEffect(() => {
    if (articleData?.newsArticle) {
      const article = articleData.newsArticle;
      setFormData({
        title: article.title || '',
        content: article.content || '',
        excerpt: article.excerpt || '',
        categoryId: article.category?.id || '',
        tagIds: article.tags?.map(tag => tag.id) || [],
        featuredImage: article.featuredImageUrl || '',
        metaDescription: article.metaDescription || '',
        metaKeywords: article.metaKeywords || ''
      });
      if (article.content) {
        const count = getWordCount(article.content);
        setWordCount(count);
      }
    }
  }, [articleData]);

  const getWordCount = (text) => {
    const strippedContent = text?.replace(/<[^>]*>/g, '') || '';
    const words = strippedContent.split(/\s+/).filter(Boolean);
    return words.length;
  };
  const getReadingTime = (wordCount) => {
    const wordsPerMinute = 225;
    const minutes = Math.max(1, Math.round(wordCount / wordsPerMinute));
    return minutes;
  };
  useEffect(() => {
    if (formData.content) {
      const count = getWordCount(formData.content);
      setWordCount(count);
    }
  }, [formData.content]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.trim().length < 5) {
      errors.title = 'Title should be at least 5 characters long';
    }
    if (!formData.content || formData.content.trim() === '') {
      errors.content = 'Content is required';
    } else if (wordCount < 20) {
      errors.content = 'Content should have at least 20 words';
    }
    if (!formData.excerpt.trim()) {
      errors.excerpt = 'Excerpt is required';
    } else if (formData.excerpt.trim().length < 10) {
      errors.excerpt = 'Excerpt should be at least 10 characters long';
    }
    if (!formData.categoryId) {
      errors.categoryId = 'Category is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      const firstError = Object.values(validationErrors)[0];
      toast.error(firstError || 'Please fix the errors before saving');
      return;
    }
    if (window.confirm('This will submit your article for review by editors. Continue?')) {
      try {
        await updateNews({
          variables: {
            id: parseInt(id),
            title: formData.title,
            content: formData.content,
            excerpt: formData.excerpt,
            categoryId: parseInt(formData.categoryId),
            tagIds: formData.tagIds.map(id => parseInt(id)),
            featuredImage: formData.featuredImage,
            metaDescription: formData.metaDescription,
            metaKeywords: formData.metaKeywords
          }
        });
      } catch (error) {
        console.error('Save error:', error);
      }
    }
  };

  const handleCancel = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
      return;
    }
    if (articleData?.newsArticle) {
      const article = articleData.newsArticle;
      setFormData({
        title: article.title || '',
        content: article.content || '',
        excerpt: article.excerpt || '',
        categoryId: article.category?.id || '',
        tagIds: article.tags?.map(tag => tag.id) || [],
        featuredImage: article.featuredImageUrl || '',
        metaDescription: article.metaDescription || '',
        metaKeywords: article.metaKeywords || ''
      });
    }
    setIsEditing(false);
    setIsDirty(false);
    setValidationErrors({});
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'published':
        return 'success';
      case 'pending':
        return 'warning';
      case 'draft':
        return 'info';
      case 'rejected':
        return 'error';
      default:
        return 'neutral';
    }
  };

  if (articleLoading) {
    return (
      <Box sx={{ maxWidth: '1200px', mx: 'auto', py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (articleError || !articleData?.newsArticle) {
    return (
      <Box sx={{ maxWidth: '1200px', mx: 'auto', py: 4 }}>
        <Alert color="danger">
          Article not found or you don't have permission to view it.
        </Alert>
      </Box>
    );
  }

  const article = articleData.newsArticle;
  const categories = categoriesData?.categories || [];
  const tags = tagsData?.tags || [];

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', py: 4, px: 2 }}>
      <Card variant="outlined" sx={{ p: 4 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box>
            <Typography level="h4">
              {isEditing ? 'Edit Article' : article.title}
            </Typography>
            <Box display="flex" gap={1} alignItems="center">
              <Chip 
                variant="soft"
                color={getStatusColor(article.status)}
                size="sm"
              >
                {article.status}
              </Chip>
              <Typography level="body-sm" color="neutral">
                Created: {new Date(article.createdAt).toLocaleDateString()}
              </Typography>
              {article.updatedAt && (
                <Typography level="body-sm" color="neutral">
                  • Updated: {new Date(article.updatedAt).toLocaleDateString()}
                </Typography>
              )}
            </Box>
          </Box>
          <Box display="flex" gap={1}>
            {!isEditing ? (
              <>
                <Button
                  variant="solid"
                  onClick={() => setIsEditing(true)}
                  disabled={!['draft', 'rejected'].includes(article.status?.toLowerCase())}
                >
                  ✏️ Edit
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/news/${article.slug}`)}
                >
                  👁️ Preview
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="solid"
                  onClick={handleSave}
                  color="success"
                >
                  💾 Save & Submit for Review
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                >
                  ❌ Cancel
                </Button>
              </>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Tabs when editing */}
        {isEditing && (
          <Box mb={3}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}>
              <Stack direction="row" spacing={2}>
                <Button
                  variant={activeTab === 'edit' ? 'solid' : 'plain'}
                  size="sm"
                  onClick={() => setActiveTab('edit')}
                >
                  Edit Content
                </Button>
                <Button
                  variant={activeTab === 'preview' ? 'solid' : 'plain'}
                  size="sm"
                  onClick={() => setActiveTab('preview')}
                >
                  Preview
                </Button>
              </Stack>
            </Box>
          </Box>
        )}

        {/* Unsaved changes warning */}
        {isEditing && isDirty && (
          <Box mb={2}>
            <Alert color="warning" size="sm">
              You have unsaved changes
            </Alert>
          </Box>
        )}

        {/* Main Content Area */}
        {(!isEditing || activeTab === 'edit') && (
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            {/* Main Content */}
            <Box sx={{ flex: 2 }}>
              {/* Title */}
              <Box mb={3}>
                {isEditing ? (
                  <FormControl>
                    <FormLabel>Title *</FormLabel>
                    {validationErrors.title && (
                      <Typography level="body-sm" color="danger" sx={{ mb: 1 }}>
                        {validationErrors.title}
                      </Typography>
                    )}
                    <Input
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      required
                      error={!!validationErrors.title}
                      placeholder="Enter a compelling article title"
                    />
                    <Typography level="body-xs" sx={{ mt: 0.5, textAlign: 'right' }}>
                      {formData.title.length}/100 characters
                    </Typography>
                  </FormControl>
                ) : (
                  <Typography level="h4" gutterBottom>
                    {article.title}
                  </Typography>
                )}
              </Box>

              {/* Excerpt */}
              <Box mb={3}>
                {isEditing ? (
                  <FormControl>
                    <FormLabel>Excerpt *</FormLabel>
                    {validationErrors.excerpt && (
                      <Typography level="body-sm" color="danger" sx={{ mb: 1 }}>
                        {validationErrors.excerpt}
                      </Typography>
                    )}
                    <Textarea
                      value={formData.excerpt}
                      onChange={(e) => handleInputChange('excerpt', e.target.value)}
                      minRows={3}
                      required
                      error={!!validationErrors.excerpt}
                      placeholder="Brief summary of the article"
                      maxRows={5}
                    />
                    <Typography level="body-xs" sx={{ mt: 0.5, textAlign: 'right' }}>
                      {formData.excerpt.length}/200 characters
                    </Typography>
                  </FormControl>
                ) : (
                  <>
                    <Typography level="h6" gutterBottom>
                      Excerpt
                    </Typography>
                    <Typography level="body-md" color="neutral">
                      {article.excerpt}
                    </Typography>
                  </>
                )}
              </Box>

              {/* Content */}
              <Box mb={3}>
                {isEditing ? (
                  <FormControl sx={{ width: '100%' }}>
                    <FormLabel>Content *</FormLabel>
                    {validationErrors.content && (
                      <Typography level="body-sm" color="danger" sx={{ mb: 1 }}>
                        {validationErrors.content}
                      </Typography>
                    )}
                    <Box 
                      sx={{ 
                        border: validationErrors.content ? '1px solid red' : '1px solid var(--joy-palette-neutral-outlinedBorder)',
                        borderRadius: 'sm',
                        mb: 2
                      }}
                    >
                      <RichTextEditor
                        content={formData.content}
                        onChange={(content) => handleInputChange('content', content)}
                        placeholder="Start writing your article content here..."
                      />
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography level="body-xs">
                        {wordCount > 0 && (
                          <>Word count: <strong>{wordCount}</strong></>
                        )}
                      </Typography>
                      <Typography level="body-xs">
                        {wordCount > 0 && (
                          <>Estimated reading time: <strong>{getReadingTime(wordCount)} min</strong></>
                        )}
                      </Typography>
                    </Box>
                  </FormControl>
                ) : (
                  <>
                    <Typography level="h6" gutterBottom>
                      Content
                    </Typography>
                    <Box 
                      sx={{ 
                        border: 1, 
                        borderColor: 'divider', 
                        borderRadius: 1, 
                        p: 2,
                        maxHeight: 500,
                        overflow: 'auto'
                      }}
                      dangerouslySetInnerHTML={{ __html: article.content }}
                    />
                  </>
                )}
              </Box>
            </Box>

            {/* Sidebar */}
            <Box sx={{ flex: 1 }}>
              {/* Category */}
              <Box mb={3}>
                {isEditing ? (
                  <FormControl>
                    <FormLabel>Category *</FormLabel>
                    {validationErrors.categoryId && (
                      <Typography level="body-sm" color="danger" sx={{ mb: 1 }}>
                        {validationErrors.categoryId}
                      </Typography>
                    )}
                    <Select
                      value={formData.categoryId}
                      onChange={(event, newValue) => handleInputChange('categoryId', newValue)}
                      required
                      error={!!validationErrors.categoryId}
                      placeholder="Select a category"
                    >
                      {categories.map((category) => (
                        <Option key={category.id} value={category.id}>
                          {category.name}
                        </Option>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <>
                    <Typography level="h6" sx={{ mb: 1 }}>
                      Category
                    </Typography>
                    <Chip variant="soft" color="primary">{article.category?.name}</Chip>
                  </>
                )}
              </Box>

              {/* Tags */}
              <Box mb={3}>
                {isEditing ? (
                  <FormControl>
                    <FormLabel>Tags</FormLabel>
                    <Select
                      multiple
                      value={formData.tagIds}
                      onChange={(event, newValue) => handleInputChange('tagIds', newValue)}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((tagId) => {
                            const tag = tags.find(t => t.id === tagId);
                            return (
                              <Chip key={tagId} variant="soft" size="sm">
                                {tag?.name || tagId}
                              </Chip>
                            );
                          })}
                        </Box>
                      )}
                    >
                      {tags.map((tag) => (
                        <Option key={tag.id} value={tag.id}>
                          {tag.name}
                        </Option>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <>
                    <Typography level="h6" sx={{ mb: 1 }}>
                      Tags
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {article.tags?.map((tag) => (
                        <Chip key={tag.id} variant="soft" size="sm">{tag.name}</Chip>
                      ))}
                    </Box>
                  </>
                )}
              </Box>

              {/* Article Stats */}
              {!isEditing && (
                <Box mb={3}>
                  <Typography level="h6" sx={{ mb: 1 }}>
                    Statistics
                  </Typography>
                  <Typography level="body-sm" color="neutral">
                    Views: {article.readCount || 0}
                  </Typography>
                  <Typography level="body-sm" color="neutral">
                    Likes: {article.likesCount || 0}
                  </Typography>
                  <Typography level="body-sm" color="neutral">
                    Comments: {article.commentsCount || 0}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* Preview Tab */}
        {isEditing && activeTab === 'preview' && (
          <Box>
            <Typography level="h4" gutterBottom>
              {formData.title || 'Untitled Article'}
            </Typography>
            {formData.featuredImage && (
              <Box mb={3}>
                <Card>
                  <AspectRatio ratio="2">
                    <img
                      src={formData.featuredImage}
                      alt="Featured image"
                      style={{ objectFit: 'cover' }}
                    />
                  </AspectRatio>
                </Card>
              </Box>
            )}
            <Typography level="body-md" color="neutral" sx={{ fontStyle: 'italic', mb: 3 }}>
              {formData.excerpt || 'No excerpt provided'}
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box 
              sx={{ 
                border: 1, 
                borderColor: 'divider', 
                borderRadius: 1, 
                p: 2,
                maxHeight: 600,
                overflow: 'auto',
                backgroundColor: 'background.surface'
              }}
              dangerouslySetInnerHTML={{ __html: formData.content || '<p>No content provided</p>' }}
            />
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default WriterNewsDetailPage;
