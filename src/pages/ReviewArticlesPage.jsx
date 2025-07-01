import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Alert,
  Chip,
  Table,
  Select,
  Option,
  Input,
  CircularProgress,
  Modal,
  ModalDialog,
  ModalClose,
  Textarea,
} from '@mui/joy';
import { useAuth } from '../core/presentation/hooks/useAuth';
import { GET_NEWS_FOR_REVIEW } from '../graphql/queries';
import { UPDATE_NEWS_STATUS } from '../graphql/mutations';

export default function ReviewArticlesPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [newStatus, setNewStatus] = useState('');

  // GraphQL hooks
  const { data: articlesData, loading: articlesLoading, refetch } = useQuery(GET_NEWS_FOR_REVIEW);
  const [updateNewsStatus] = useMutation(UPDATE_NEWS_STATUS);

  // Check authentication and permissions
  if (!isAuthenticated) {
    return (
      <Box textAlign="center" py={6}>
        <Typography level="h3" sx={{ mb: 2 }}>
          Authentication Required
        </Typography>
        <Typography level="body1" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
          Please sign in to review articles.
        </Typography>
        <Button onClick={() => navigate('/login')}>
          Sign In
        </Button>
      </Box>
    );
  }

  const userRole = user?.profile?.role?.toLowerCase();
  if (userRole !== 'manager') {
    return (
      <Box textAlign="center" py={6}>
        <Typography level="h3" sx={{ mb: 2, color: 'danger.500' }}>
          Access Denied
        </Typography>
        <Typography level="body1" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
          Only managers can review articles.
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

  const handleReviewArticle = (article) => {
    setSelectedArticle(article);
    setNewStatus(article.status);
    setReviewComment('');
    setShowReviewModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedArticle || !newStatus) return;

    try {
      const { data } = await updateNewsStatus({
        variables: {
          id: parseInt(selectedArticle.id),
          status: newStatus,
          reviewComment: reviewComment || null
        }
      });

      if (data?.updateNewsStatus?.success) {
        setShowReviewModal(false);
        setSelectedArticle(null);
        refetch(); // Refresh the articles list
      } else {
        console.error('Failed to update status:', data?.updateNewsStatus?.errors);
      }
    } catch (error) {
      console.error('Error updating article status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'published': return 'success';
      case 'draft': return 'neutral';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
      default: return 'neutral';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (articlesLoading) {
    return (
      <Box textAlign="center" py={6}>
        <CircularProgress />
        <Typography level="body1" sx={{ mt: 2 }}>
          Loading articles for review...
        </Typography>
      </Box>
    );
  }

  const articles = articlesData?.newsForReview || [];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography level="h1" sx={{ mb: 2 }}>
          📋 Review Articles
        </Typography>
        <Typography level="body1" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
          Review and manage article submissions
        </Typography>
      </Box>

      {/* Articles Table */}
      <Card variant="outlined">
        <CardContent>
          {articles.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography level="body1" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
                No articles pending review
              </Typography>
            </Box>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id}>
                    <td>
                      <Typography level="body-sm" sx={{ fontWeight: 'md' }}>
                        {article.title}
                      </Typography>
                      <Typography level="body-xs" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        {article.excerpt?.substring(0, 100)}...
                      </Typography>
                    </td>
                    <td>
                      <Typography level="body-sm">
                        {article.author?.firstName} {article.author?.lastName}
                      </Typography>
                      <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                        @{article.author?.username}
                      </Typography>
                    </td>
                    <td>
                      <Chip
                        size="sm"
                        variant="soft"
                        color={getStatusColor(article.status)}
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
                      <Typography level="body-sm">
                        {article.category?.name}
                      </Typography>
                    </td>
                    <td>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="sm"
                          variant="outlined"
                          onClick={() => navigate(`/news/${article.id}`)}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="solid"
                          onClick={() => handleReviewArticle(article)}
                        >
                          Review
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

      {/* Review Modal */}
      <Modal open={showReviewModal} onClose={() => setShowReviewModal(false)}>
        <ModalDialog sx={{ width: 500 }}>
          <ModalClose />
          <Typography level="h4" sx={{ mb: 2 }}>
            Review Article: {selectedArticle?.title}
          </Typography>
          
          <Stack spacing={3}>
            <Box>
              <Typography level="body-sm" sx={{ mb: 1, fontWeight: 'md' }}>
                Current Status
              </Typography>
              <Chip
                size="sm"
                variant="soft"
                color={getStatusColor(selectedArticle?.status)}
              >
                {selectedArticle?.status}
              </Chip>
            </Box>

            <Box>
              <Typography level="body-sm" sx={{ mb: 1, fontWeight: 'md' }}>
                New Status
              </Typography>
              <Select
                value={newStatus}
                onChange={(event, value) => setNewStatus(value)}
                sx={{ width: '100%' }}
              >
                <Option value="draft">Draft</Option>
                <Option value="pending">Pending Review</Option>
                <Option value="published">Published</Option>
                <Option value="rejected">Rejected</Option>
              </Select>
            </Box>

            <Box>
              <Typography level="body-sm" sx={{ mb: 1, fontWeight: 'md' }}>
                Review Comments (Optional)
              </Typography>
              <Textarea
                placeholder="Add comments about this review..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                minRows={3}
              />
            </Box>

            <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
              <Button
                variant="plain"
                onClick={() => setShowReviewModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="solid"
                onClick={handleStatusUpdate}
                disabled={!newStatus}
              >
                Update Status
              </Button>
            </Stack>
          </Stack>
        </ModalDialog>
      </Modal>
    </Box>
  );
}
