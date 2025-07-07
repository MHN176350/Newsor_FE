import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Chip, 
  Button, 
  Stack, 
  Table,
  Avatar,
  Link,
  Alert
} from '@mui/joy';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_NEWS_FOR_REVIEW } from '../graphql/queries';
import { formatDate } from '../utils/constants';
import { useAuth } from '../core/presentation/hooks/useAuth';
import { processImageUrlForDisplay } from '../utils/cloudinaryUtils';

export default function ReviewArticlesPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { data, loading, error, refetch } = useQuery(GET_NEWS_FOR_REVIEW, {
    skip: !isAuthenticated,
  });

  const articles = data?.newsForReview || [];

  // Check authentication
  if (!isAuthenticated) {
    return (
      <Box textAlign="center" py={6}>
        <Typography level="h3" sx={{ mb: 2 }}>
          Authentication Required
        </Typography>
        <Typography level="body1" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
          Please sign in to access the review dashboard.
        </Typography>
        <Button onClick={() => navigate('/login')}>
          Sign In
        </Button>
      </Box>
    );
  }

  // Check if user has permission to review
  const userRole = user?.profile?.role?.toLowerCase();
  const canReview = ['manager', 'admin'].includes(userRole);

  if (!canReview) {
    return (
      <Box textAlign="center" py={6}>
        <Typography level="h3" sx={{ mb: 2 }}>
          Access Denied
        </Typography>
        <Typography level="body1" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
          You don't have permission to review articles.
        </Typography>
        <Button onClick={() => navigate('/')}>
          Go to Homepage
        </Button>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box textAlign="center" py={6}>
        <Typography level="body1">Loading articles for review...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={6}>
        <Typography level="h3" sx={{ mb: 2 }}>Error Loading Articles</Typography>
        <Typography level="body1" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
          {error.message}
        </Typography>
        <Button onClick={() => refetch()}>
          Try Again
        </Button>
      </Box>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'published':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'draft':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography level="h1" sx={{ mb: 2 }}>
          🔖 Review Articles
        </Typography>
        <Typography level="body1" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
          Review and moderate articles submitted by writers
        </Typography>
      </Box>

      {/* Articles List */}
      <Card variant="outlined">
        <CardContent>
          {articles.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography level="h4" sx={{ mb: 2 }}>
                No Articles to Review
              </Typography>
              <Typography level="body1" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
                All articles have been reviewed. Check back later for new submissions.
              </Typography>
            </Box>
          ) : (
            <Table sx={{ '& thead th:nth-child(1)': { width: '40%' } }}>
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id}>
                    <td>
                      <Box display="flex" gap={2} alignItems="flex-start">
                        {article.featuredImageUrl && (
                          <img
                            src={processImageUrlForDisplay(article.featuredImageUrl)}
                            alt={article.title}
                            style={{
                              width: 80,
                              height: 60,
                              objectFit: 'cover',
                              borderRadius: 8,
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <Box>
                          <Typography level="title-sm" sx={{ mb: 1 }}>
                            {article.title}
                          </Typography>
                          <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                            {article.excerpt}
                          </Typography>
                        </Box>
                      </Box>
                    </td>
                    <td>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar size="sm">
                          {article.author.firstName?.charAt(0) || article.author.username?.charAt(0) || 'U'}
                        </Avatar>
                        <Box>
                          <Typography level="body-sm">
                            {`${article.author.firstName || ''} ${article.author.lastName || ''}`.trim() || 
                             article.author.username}
                          </Typography>
                        </Box>
                      </Box>
                    </td>
                    <td>
                      <Chip
                        variant="soft"
                        color={getStatusColor(article.status)}
                        size="sm"
                      >
                        {article.status}
                      </Chip>
                    </td>
                    <td>
                      <Typography level="body-sm">
                        {formatDate(article.createdAt)}
                      </Typography>
                    </td>
                    <td>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="sm"
                          variant="outlined"
                          onClick={() => navigate(`/review/article/${article.slug}`)}
                        >
                          Review
                        </Button>
                        <Button
                          size="sm"
                          variant="plain"
                          color="neutral"
                          onClick={() => navigate(`/news/${article.slug}`)}
                        >
                          Preview
                        </Button>
                      </Stack>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {articles.length > 0 && (
        <Card variant="outlined" sx={{ mt: 3 }}>
          <CardContent>
            <Typography level="h4" sx={{ mb: 2 }}>
              Review Summary
            </Typography>
            <Stack direction="row" spacing={3}>
              <Box>
                <Typography level="h3" color="warning">
                  {articles.filter(a => a.status?.toLowerCase() === 'pending').length}
                </Typography>
                <Typography level="body-sm">Pending Review</Typography>
              </Box>
              <Box>
                <Typography level="h3" color="success">
                  {articles.filter(a => a.status?.toLowerCase() === 'published').length}
                </Typography>
                <Typography level="body-sm">Published</Typography>
              </Box>
              <Box>
                <Typography level="h3" color="danger">
                  {articles.filter(a => a.status?.toLowerCase() === 'rejected').length}
                </Typography>
                <Typography level="body-sm">Rejected</Typography>
              </Box>
              <Box>
                <Typography level="h3" color="neutral">
                  {articles.length}
                </Typography>
                <Typography level="body-sm">Total Articles</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
