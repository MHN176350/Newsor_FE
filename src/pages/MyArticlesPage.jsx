import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  CircularProgress,
  Modal,
  ModalDialog,
  ModalClose,
  Input,
  Select,
  Option,
} from '@mui/joy';
import { useAuth } from '../core/presentation/hooks/useAuth';
import { GET_MY_NEWS } from '../graphql/queries';
import { UPDATE_NEWS_STATUS, SUBMIT_NEWS_FOR_REVIEW } from '../graphql/mutations';
import { useTranslation } from 'react-i18next';

export default function MyArticlesPage() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // GraphQL hooks
  const { data: articlesData, loading: articlesLoading, refetch } = useQuery(GET_MY_NEWS);
  const [updateNewsStatus] = useMutation(UPDATE_NEWS_STATUS);
  const [submitForReview] = useMutation(SUBMIT_NEWS_FOR_REVIEW);

  // Refetch data when coming from create/edit article
  useEffect(() => {
    if (location.state?.message) {
      refetch();
    }
  }, [location.state, refetch]);

  // Check authentication and permissions
  if (!isAuthenticated) {
    return (
      <Box textAlign="center" py={6}>
        <Typography level="h3" sx={{ mb: 2 }}>
          {t('myArticles.authRequired')}
        </Typography>
        <Typography level="body1" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
          {t('myArticles.signInMessage')}
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
          {t('myArticles.permissionDenied')}
        </Typography>
        <Typography level="body1" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
          {t('myArticles.writerPrivileges')}
        </Typography>
        <Typography level="body2" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
          {t('myArticles.currentRole')}: {user?.profile?.role || t('common.reader')}
        </Typography>
        <Button onClick={() => navigate(-1)}>
          {t('common.back')}
        </Button>
      </Box>
    );
  }

  const handleSubmitForReview = async (article) => {
    try {
      const { data } = await submitForReview({
        variables: {
          id: parseInt(article.id)
        }
      });

      if (data?.submitNewsForReview?.success) {
        refetch(); // Refresh the articles list
        // Show success message
        console.log('Article submitted for review successfully!');
      } else {
        console.error('Failed to submit for review:', data?.submitNewsForReview?.errors);
      }
    } catch (error) {
      console.error('Error submitting article for review:', error);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedArticle) return;

    try {
      const { data } = await updateNewsStatus({
        variables: {
          id: parseInt(selectedArticle.id),
          status: newStatus
        }
      });

      if (data?.updateNewsStatus?.success) {
        setShowSubmitModal(false);
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
      case 'draft': return 'primary';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
      default: return 'primary';
    }
  };

  const getStatusAction = (status) => {
    switch (status?.toLowerCase()) {
      case 'draft': return t('myArticles.submitForReview');
      case 'rejected': return t('myArticles.resubmit');
      case 'published': return null; // No action needed
      case 'pending': return null; // No action needed
      default: return null;
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
          {t('myArticles.loading')}
        </Typography>
      </Box>
    );
  }

  const articles = articlesData?.myNews || [];

  return (
    <Box>
      {/* Success Message */}
      {location.state?.message && (
        <Alert color="success" sx={{ mb: 3 }}>
          {location.state.message}
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography level="h1" sx={{ mb: 1 }}>
            📝 {t('myArticles.title')}
          </Typography>
          <Typography level="body1" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
            {t('myArticles.subtitle')}
          </Typography>
        </Box>
        <Button
          variant="solid"
          size="lg"
          onClick={() => navigate('/articles/create')}
          sx={{
            bgcolor: 'primary.600',
            '&:hover': { bgcolor: 'primary.700' }
          }}
        >
          ✍️ {t('myArticles.createNew')}
        </Button>
      </Box>

      {/* Articles Table */}
      <Card variant="outlined">
        <CardContent>
          {articles.length === 0 ? (
            <Box textAlign="center" py={6}>
              <Typography level="h4" sx={{ mb: 2 }}>
                {t('myArticles.noArticles')}
              </Typography>
              <Typography level="body1" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
                {t('myArticles.firstArticleMessage')}
              </Typography>
              <Button
                variant="solid"
                onClick={() => navigate('/articles/create')}
              >
                {t('myArticles.createFirst')}
              </Button>
            </Box>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>{t('myArticles.table.title')}</th>
                  <th style={{ width: 80 }}>{t('myArticles.table.status')}</th>
                  <th style={{ width: 100 }}>{t('myArticles.table.category')}</th>
                  <th style={{ width: 150 }}>{t('myArticles.table.created')}</th>
                  <th style={{ width: 150 }}>{t('myArticles.table.updated')}</th>
                  <th style={{ minWidth: 260 }}>{t('myArticles.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id}>
                    <td>
                      <Typography level="body-sm" sx={{ color: 'text.secondary', fontWeight: 'md' }}>
                        {article.title}
                      </Typography>
                      <Typography level="body-xs" sx={{ mt: 0.5 }}>
                        {article.excerpt?.substring(0, 100)}...
                      </Typography>
                    </td>
                    <td>
                      <Chip
                        size="sm"
                        variant="soft"
                        color={getStatusColor(article.status)}
                        sx={{ minWidth: 60, justifyContent: 'center' }}
                      >
                        {article.status}
                      </Chip>
                    </td>
                    <td>
                      <Typography level="body-sm" sx={{ minWidth: 60, maxWidth: 100, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {article.category?.name}
                      </Typography>
                    </td>
                    <td>
                      <Typography level="body-sm" sx={{ minWidth: 130, whiteSpace: 'nowrap' }}>
                        {formatDate(article.createdAt)}
                      </Typography>
                    </td>
                    <td>
                      <Typography level="body-sm" sx={{ minWidth: 130, whiteSpace: 'nowrap' }}>
                        {formatDate(article.updatedAt)}
                      </Typography>
                    </td>
                    <td>
                      <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', minWidth: 280, gap: 0.5 }}>
                        {/* Details Button - always visible */}
                        <Button
                          size="sm"
                          variant="outlined"
                          color="neutral"
                          onClick={() => navigate(`/writer/articles/${article.id}`)}
                          sx={{ minWidth: 'auto', px: 1 }}
                        >
                          {t('myArticles.actions.details')}
                        </Button>

                        {/* View Public Button - only for published articles */}
                        {article.status?.toLowerCase() === 'published' && (
                          <Button
                            size="sm"
                            variant="outlined"
                            color="primary"
                            onClick={() => navigate(`/news/${article.slug}`)}
                            sx={{ minWidth: 'auto', px: 1 }}
                          >
                            {t('myArticles.actions.viewPublic')}
                          </Button>
                        )}

                        {/* Edit Button - only for draft and rejected articles */}
                        {['draft', 'rejected'].includes(article.status?.toLowerCase()) && (
                          <Button
                            size="sm"
                            variant="outlined"
                            color="neutral"
                            onClick={() => navigate(`/articles/edit/${article.id}`)}
                            sx={{ minWidth: 'auto', px: 1 }}
                          >
                            ✏️ {t('common.edit')}
                          </Button>
                        )}

                        {/* Duplicate Button - always visible */}
                        <Button
                          size="sm"
                          variant="outlined"
                          color="neutral"
                          onClick={() => navigate(`/articles/duplicate/${article.id}`)}
                          sx={{ minWidth: 'auto', px: 1 }}
                        >
                          📋 {t('myArticles.actions.duplicate')}
                        </Button>

                        {/* Submit/Resubmit Button - for draft and rejected articles */}
                        {['draft', 'rejected'].includes(article.status?.toLowerCase()) && (
                          <Button
                            size="sm"
                            variant="solid"
                            color="success"
                            onClick={() => handleSubmitForReview(article)}
                            sx={{
                              minWidth: 'auto',
                              px: 1.5,
                              fontSize: '0.8rem',
                              whiteSpace: 'nowrap',
                              fontWeight: 'md'
                            }}
                          >
                            {article.status?.toLowerCase() === 'rejected' ? t('myArticles.resubmit') : t('myArticles.submitForReview')}
                          </Button>
                        )}
                      </Stack>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Submit Modal */}
      <Modal open={showSubmitModal} onClose={() => setShowSubmitModal(false)}>
        <ModalDialog sx={{ width: 400 }}>
          <ModalClose />
          <Typography level="h4" sx={{ mb: 2 }}>
            {t('myArticles.modal.title')}
          </Typography>

          <Typography level="body-sm" sx={{ mb: 3 }}>
            {t('myArticles.modal.message', { title: selectedArticle?.title })}
          </Typography>

          <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
            <Button
              variant="plain"
              onClick={() => setShowSubmitModal(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="solid"
              color="success"
              onClick={() => handleStatusUpdate('draft')}
            >
              {t('myArticles.submitForReview')}
            </Button>
          </Stack>
        </ModalDialog>
      </Modal>
    </Box>
  );
}
