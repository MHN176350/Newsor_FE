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
import SearchAndFilter from '../components/SearchAndFilter';
import Pagination from '../components/Pagination';

export default function MyArticlesPage() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Archive tab state for search/filter/paging
  const [searchFilters, setSearchFilters] = useState({
    search: '',
    categoryId: '',
    tagId: '',
    sortBy: 'newest',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Filtering and sorting logic for published/archived news
  const filterAndSortNews = (newsList) => {
    let filtered = [...newsList];
    // Search by title
    if (searchFilters.search) {
      filtered = filtered.filter(n => n.title?.toLowerCase().includes(searchFilters.search.toLowerCase()));
    }
    // Filter by category
    if (searchFilters.categoryId) {
      filtered = filtered.filter(n => n.category?.id?.toString() === searchFilters.categoryId.toString());
    }
    // Filter by tag (if tags are available on news)
    if (searchFilters.tagId) {
      filtered = filtered.filter(n => n.tags?.some(tag => tag.id?.toString() === searchFilters.tagId.toString()));
    }
    // Sort
    switch (searchFilters.sortBy) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'title_asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title_desc':
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }
    return filtered;
  };

  // Article
  const filteredArticle = filterAndSortNews(articles);
  const articleTotal = filteredArticle.length;
  const articleTotalPages = Math.ceil(articleTotal / itemsPerPage);
  const articleStart = (currentPage - 1) * itemsPerPage;
  const articleEnd = articleStart + itemsPerPage;
  const archivedPageNews = filteredArticle.slice(articleStart, articleEnd);

  // Handlers
  const handleSearch = (searchTerm) => {
    setSearchFilters(prev => ({ ...prev, search: searchTerm }));
    setCurrentPage(1);
  };
  const handleFilter = (filters) => {
    setSearchFilters(filters);
    setCurrentPage(1);
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      {/* Search and Filter for Archive */}
      {/* <SearchAndFilter
        onSearch={handleSearch}
        onFilter={handleFilter}
        categories={categories}
        tags={tags}
        loading={articlesLoading}
        initialFilters={searchFilters}
      /> */}
      {/* Published Articles Table with Paging */}
      {/* Articles Table */}
      <Card variant="outlined">
        <CardContent>
          {articleTotal === 0 ? (
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
            <>
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
                  {archivedPageNews.map((article) => (
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
              {/* Pagination for Published */}
              {articleTotalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={articleTotalPages}
                    onPageChange={handlePageChange}
                    showFirstLast={true}
                    showPrevNext={true}
                    maxButtons={5}
                    size="md"
                    variant="outlined"
                  />
                </Box>
              )}
              {/* Results Info */}
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography level="body3" sx={{ color: 'var(--joy-palette-text-tertiary)' }}>
                  {t('news.showing')} {articleStart + 1}-{Math.min(articleEnd, articleTotal)} {t('news.of')} {articleTotal} {t('news.articles')}
                </Typography>
              </Box>
            </>
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
