import { Box, Typography, Card, CardContent, Chip, Button, Stack, Divider, Avatar, Textarea, FormControl, FormLabel, Alert, Select, Option } from '@mui/joy';
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_NEWS } from '../graphql/queries';
import { UPDATE_NEWS_STATUS } from '../graphql/mutations';
import { formatDate } from '../utils/constants';
import { useAuth } from '../core/presentation/hooks/useAuth';
import { processImageUrlForDisplay } from '../utils/cloudinaryUtils';
import { SEO } from '../components/index.js';
import { useTranslation } from 'react-i18next';

export default function ReviewNewsPage() {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [reviewComment, setReviewComment] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();
  const { data, loading, error, refetch } = useQuery(GET_NEWS, {
    variables: { slug: slug },
    skip: !slug,
  });

  const [updateNewsStatus] = useMutation(UPDATE_NEWS_STATUS, {
    onCompleted: (data) => {
      if (data.updateNewsStatus.success) {
        setMessage(t('review.statusUpdatedSuccess'));
        setReviewComment('');
        setNewStatus('');
        setIsSubmitting(false);
        // Navigate back to review list after 2 seconds
        setTimeout(() => {
          navigate('/review');
        }, 2000);
      } else {
        setMessage(`${t('common.error')}: ${data.updateNewsStatus.errors?.join(', ') || t('review.unknownError')}`);
        setIsSubmitting(false);
      }
    },
    onError: (error) => {
      console.error('Error updating news status:', error);
      setMessage(t('review.statusUpdateError'));
      setIsSubmitting(false);
    },
  });

  const news = data?.newsArticle;

  // Check if user has manager/admin permissions
  const userRole = user?.profile?.role?.toLowerCase();
  const canReview = isAuthenticated && ['manager', 'admin'].includes(userRole);

  const handleStatusUpdate = async (status) => {
    if (!news || !reviewComment.trim()) {
      setMessage(t('common.reviewCommentRequired'));
      return;
    }

    setIsSubmitting(true);
    setNewStatus(status);

    try {
      await updateNewsStatus({
        variables: {
          id: parseInt(news.id),
          status: status,
          reviewComment: reviewComment.trim(),
        },
      });
    } catch (error) {
      console.error('Error updating status:', error);
      setMessage(t('review.statusUpdateError'));
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'published': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
      case 'draft': return 'neutral';
      case 'archived': return 'neutral';
      default: return 'neutral';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'published': return '✅';
      case 'pending': return '⏳';
      case 'rejected': return '❌';
      case 'draft': return '📝';
      case 'archived': return '📦';
      default: return '📄';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <Typography>{t('review.loadingArticle')}</Typography>
      </Box>
    );
  }

  if (error || !news) {
    return (
      <Box textAlign="center" py={4}>
        <Typography level="h3" sx={{ mb: 2 }}>{t('review.articleNotFound')}</Typography>
        <Button component={Link} to="/review">
          {t('review.backToReviewQueue')}
        </Button>
      </Box>
    );
  }

  if (!canReview) {
    return (
      <Box textAlign="center" py={4}>
        <Typography level="h3" sx={{ mb: 2 }}>{t('review.accessDenied')}</Typography>
        <Typography level="body1" sx={{ mb: 3 }}>
          {t('review.noPermission')}
        </Typography>
        <Button component={Link} to="/news">
          {t('review.backToNews')}
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <SEO 
        title={`${t('review.title')}: ${news.title}`}
        description={t('review.title')}
        type="article"
      />

      {/* Header with Navigation */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Button
            component={Link}
            to="/review"
            variant="outlined"
            size="sm"
          >
            ← {t('review.backToReviewQueue')}
          </Button>
          
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
              {t('common.status')}:
            </Typography>
            <Chip
              size="sm"
              variant="soft"
              color={getStatusColor(news.status)}
              startDecorator={getStatusIcon(news.status)}
            >
              {news.status?.toUpperCase()}
            </Chip>
          </Stack>
        </Stack>
      </Box>

      {/* Review Status Message */}
      {message && (
        <Alert 
          color={message.includes(t('common.success')) || message.includes(t('review.statusUpdatedSuccess')) ? 'success' : 'danger'} 
          sx={{ mb: 3 }}
          onClose={() => setMessage('')}
        >
          {message}
        </Alert>
      )}

      {/* Article Information Card */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography level="h4" sx={{ mb: 2 }}>{t('review.articleInformation')}</Typography>
          <Stack spacing={2}>
            <Box>
              <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 0.5 }}>
                {t('common.author')}:
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar size="sm" />
                <Typography level="body1">
                  {news.author?.firstName} {news.author?.lastName}
                </Typography>
              </Stack>
            </Box>
            
            <Box>
              <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 0.5 }}>
                {t('common.submitted')}:
              </Typography>
              <Typography level="body1">
                {formatDate(news.createdAt)}
              </Typography>
            </Box>

            <Box>
              <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 0.5 }}>
                {t('common.lastUpdated')}:
              </Typography>
              <Typography level="body1">
                {formatDate(news.updatedAt)}
              </Typography>
            </Box>

            <Box>
              <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 0.5 }}>
                {t('common.category')}:
              </Typography>
              <Chip size="sm" variant="soft">
                {news.category?.name || t('common.uncategorized')}
              </Chip>
            </Box>

            {news.tags && news.tags.length > 0 && (
              <Box>
                <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 0.5 }}>
                  {t('common.tags')}:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {news.tags.map((tag) => (
                    <Chip key={tag.id} size="sm" variant="outlined">
                      #{tag.name}
                    </Chip>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Article Content */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography level="h2" sx={{ mb: 3 }}>
            {news.title}
          </Typography>

          {news.excerpt && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'background.level1', borderRadius: 'sm' }}>
              <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 1 }}>
                {t('common.excerpt')}:
              </Typography>
              <Typography level="body1" sx={{ fontStyle: 'italic' }}>
                {news.excerpt}
              </Typography>
            </Box>
          )}

          {/* Featured Image */}
          {news.featuredImageUrl && (
            <Box sx={{ mb: 3 }}>
              <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 1 }}>
                {t('common.featuredImage')}:
              </Typography>
              <Box
                component="img"
                src={processImageUrlForDisplay(news.featuredImageUrl)}
                alt={news.title}
                sx={{
                  width: '100%',
                  maxHeight: 400,
                  objectFit: 'cover',
                  borderRadius: 'md',
                }}
              />
            </Box>
          )}

          <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 2 }}>
            {t('common.articleContent')}:
          </Typography>
          
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'neutral.300',
              borderRadius: 'md',
              p: 3,
              lineHeight: 1.7,
              color: 'text.primary',
              '& p': { margin: '0 0 1em 0' },
              '& h1, & h2, & h3': { 
                margin: '1.5em 0 0.5em 0', 
                fontWeight: 'bold',
                color: 'text.primary'
              },
              '& h1': { fontSize: '2em' },
              '& h2': { fontSize: '1.5em' },
              '& h3': { fontSize: '1.2em' },
              '& ul, & ol': { paddingLeft: '2em', margin: '1em 0' },
              '& blockquote': {
                borderLeft: '4px solid var(--joy-palette-primary-500)',
                paddingLeft: '1em',
                margin: '1em 0',
                fontStyle: 'italic',
                color: 'text.secondary',
              },
              '& img': {
                maxWidth: '100%',
                height: 'auto',
                margin: '1em 0',
                borderRadius: '8px',
                display: 'block',
              },
              '& a': {
                color: 'primary.500',
                textDecoration: 'underline',
              },
            }}
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
        </CardContent>
      </Card>

      {/* Review Actions */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography level="h4" sx={{ mb: 3 }}>
            {t('review.reviewActions')}
          </Typography>

          <FormControl sx={{ mb: 3 }}>
            <FormLabel>{t('review.reviewCommentLabel')}</FormLabel>
            <Textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder={t('review.reviewCommentPlaceholder')}
              minRows={4}
              maxRows={8}
              disabled={isSubmitting}
            />
            <Typography level="body-xs" sx={{ mt: 1, color: 'text.secondary' }}>
              {t('review.reviewCommentHelper')}
            </Typography>
          </FormControl>

          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <Button
              variant="solid"
              color="success"
              onClick={() => handleStatusUpdate('published')}
              disabled={!reviewComment.trim() || isSubmitting}
              loading={isSubmitting && newStatus === 'published'}
              startDecorator={!isSubmitting || newStatus !== 'published' ? '✅' : undefined}
            >
              {t('review.approveAndPublish')}
            </Button>
            
            <Button
              variant="solid"
              color="danger"
              onClick={() => handleStatusUpdate('rejected')}
              disabled={!reviewComment.trim() || isSubmitting}
              loading={isSubmitting && newStatus === 'rejected'}
              startDecorator={!isSubmitting || newStatus !== 'rejected' ? '❌' : undefined}
            >
              {t('review.reject')}
            </Button>
            
            <Button
              variant="outlined"
              color="warning"
              onClick={() => handleStatusUpdate('pending')}
              disabled={!reviewComment.trim() || isSubmitting}
              loading={isSubmitting && newStatus === 'pending'}
              startDecorator={!isSubmitting || newStatus !== 'pending' ? '⏳' : undefined}
            >
              {t('review.requestChanges')}
            </Button>

            <Button
              variant="outlined"
              color="neutral"
              onClick={() => handleStatusUpdate('archived')}
              disabled={!reviewComment.trim() || isSubmitting}
              loading={isSubmitting && newStatus === 'archived'}
              startDecorator={!isSubmitting || newStatus !== 'archived' ? '📦' : undefined}
            >
              {t('review.archive')}
            </Button>
          </Stack>

          <Typography level="body-xs" sx={{ mt: 2, color: 'text.secondary' }}>
            <strong>{t('review.approveAndPublish')}:</strong> {t('review.approveDescription')}<br/>
            <strong>{t('review.reject')}:</strong> {t('review.rejectDescription')}<br/>
            <strong>{t('review.requestChanges')}:</strong> {t('review.requestChangesDescription')}<br/>
            <strong>{t('review.archive')}:</strong> {t('review.archiveDescription')}
          </Typography>
        </CardContent>
      </Card>

      {/* Previous Review History */}
      {news.reviewHistory && news.reviewHistory.length > 0 && (
        <Card variant="outlined">
          <CardContent>
            <Typography level="h4" sx={{ mb: 3 }}>
              {t('review.reviewHistory')}
            </Typography>
            <Stack spacing={3}>
              {news.reviewHistory.map((review, index) => (
                <Box key={index}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Avatar size="sm" />
                    <Box sx={{ flexGrow: 1 }}>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                        <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                          {review.reviewer?.firstName} {review.reviewer?.lastName}
                        </Typography>
                        <Chip
                          size="sm"
                          variant="soft"
                          color={getStatusColor(review.status)}
                        >
                          {review.status?.toUpperCase()}
                        </Chip>
                        <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                          {formatDate(review.createdAt)}
                        </Typography>
                      </Stack>
                      <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                        {review.comment}
                      </Typography>
                    </Box>
                  </Stack>
                  {index < news.reviewHistory.length - 1 && <Divider sx={{ mt: 2 }} />}
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
