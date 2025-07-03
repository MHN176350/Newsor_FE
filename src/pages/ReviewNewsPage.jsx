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

export default function ReviewNewsPage() {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [reviewComment, setReviewComment] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_NEWS, {
    variables: { slug: slug },
    skip: !slug,
  });

  const [updateNewsStatus] = useMutation(UPDATE_NEWS_STATUS, {
    onCompleted: (data) => {
      if (data.updateNewsStatus.success) {
        setMessage('Article status updated successfully!');
        setReviewComment('');
        setNewStatus('');
        setIsSubmitting(false);
        // Navigate back to review list after 2 seconds
        setTimeout(() => {
          navigate('/review-articles');
        }, 2000);
      } else {
        setMessage(`Error: ${data.updateNewsStatus.errors?.join(', ') || 'Unknown error'}`);
        setIsSubmitting(false);
      }
    },
    onError: (error) => {
      console.error('Error updating news status:', error);
      setMessage('An error occurred while updating the article status.');
      setIsSubmitting(false);
    },
  });

  const news = data?.newsArticle;

  // Check if user has manager/admin permissions
  const userRole = user?.profile?.role?.toLowerCase();
  const canReview = isAuthenticated && ['manager', 'admin'].includes(userRole);

  const handleStatusUpdate = async (status) => {
    if (!news || !reviewComment.trim()) {
      setMessage('Please provide a review comment.');
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
      setMessage('An error occurred while updating the article status.');
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
        <Typography>Loading article for review...</Typography>
      </Box>
    );
  }

  if (error || !news) {
    return (
      <Box textAlign="center" py={4}>
        <Typography level="h3" sx={{ mb: 2 }}>Article Not Found</Typography>
        <Button component={Link} to="/review-articles">
          Back to Review Queue
        </Button>
      </Box>
    );
  }

  if (!canReview) {
    return (
      <Box textAlign="center" py={4}>
        <Typography level="h3" sx={{ mb: 2 }}>Access Denied</Typography>
        <Typography level="body1" sx={{ mb: 3 }}>
          You don't have permission to review articles.
        </Typography>
        <Button component={Link} to="/news">
          Back to News
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <SEO 
        title={`Review: ${news.title}`}
        description="Review article for publication"
        type="article"
      />

      {/* Header with Navigation */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Button
            component={Link}
            to="/review-articles"
            variant="outlined"
            size="sm"
          >
            ← Back to Review Queue
          </Button>
          
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
              Status:
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
          color={message.includes('success') ? 'success' : 'danger'} 
          sx={{ mb: 3 }}
          onClose={() => setMessage('')}
        >
          {message}
        </Alert>
      )}

      {/* Article Information Card */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography level="h4" sx={{ mb: 2 }}>Article Information</Typography>
          <Stack spacing={2}>
            <Box>
              <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 0.5 }}>
                Author:
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
                Submitted:
              </Typography>
              <Typography level="body1">
                {formatDate(news.createdAt)}
              </Typography>
            </Box>

            <Box>
              <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 0.5 }}>
                Last Updated:
              </Typography>
              <Typography level="body1">
                {formatDate(news.updatedAt)}
              </Typography>
            </Box>

            <Box>
              <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 0.5 }}>
                Category:
              </Typography>
              <Chip size="sm" variant="soft">
                {news.category?.name || 'Uncategorized'}
              </Chip>
            </Box>

            {news.tags && news.tags.length > 0 && (
              <Box>
                <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 0.5 }}>
                  Tags:
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
                Excerpt:
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
                Featured Image:
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
            Article Content:
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
            Review Actions
          </Typography>

          <FormControl sx={{ mb: 3 }}>
            <FormLabel>Review Comment (Required)</FormLabel>
            <Textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Provide feedback for the author..."
              minRows={4}
              maxRows={8}
              disabled={isSubmitting}
            />
            <Typography level="body-xs" sx={{ mt: 1, color: 'text.secondary' }}>
              This comment will be visible to the author and will help them understand your decision.
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
              Approve & Publish
            </Button>
            
            <Button
              variant="solid"
              color="danger"
              onClick={() => handleStatusUpdate('rejected')}
              disabled={!reviewComment.trim() || isSubmitting}
              loading={isSubmitting && newStatus === 'rejected'}
              startDecorator={!isSubmitting || newStatus !== 'rejected' ? '❌' : undefined}
            >
              Reject
            </Button>
            
            <Button
              variant="outlined"
              color="warning"
              onClick={() => handleStatusUpdate('pending')}
              disabled={!reviewComment.trim() || isSubmitting}
              loading={isSubmitting && newStatus === 'pending'}
              startDecorator={!isSubmitting || newStatus !== 'pending' ? '⏳' : undefined}
            >
              Request Changes
            </Button>

            <Button
              variant="outlined"
              color="neutral"
              onClick={() => handleStatusUpdate('archived')}
              disabled={!reviewComment.trim() || isSubmitting}
              loading={isSubmitting && newStatus === 'archived'}
              startDecorator={!isSubmitting || newStatus !== 'archived' ? '📦' : undefined}
            >
              Archive
            </Button>
          </Stack>

          <Typography level="body-xs" sx={{ mt: 2, color: 'text.secondary' }}>
            <strong>Approve & Publish:</strong> Make the article publicly visible<br/>
            <strong>Reject:</strong> Send back to author with feedback<br/>
            <strong>Request Changes:</strong> Ask author to revise and resubmit<br/>
            <strong>Archive:</strong> Remove from public view without rejection
          </Typography>
        </CardContent>
      </Card>

      {/* Previous Review History */}
      {news.reviewHistory && news.reviewHistory.length > 0 && (
        <Card variant="outlined">
          <CardContent>
            <Typography level="h4" sx={{ mb: 3 }}>
              Review History
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
