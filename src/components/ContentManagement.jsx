import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Stack,
  Chip,
  Table,
  Input,
  FormControl,
  FormLabel,
  Modal,
  ModalDialog,
  ModalClose,
  Textarea,
  Alert,
  CircularProgress,
  IconButton,
  Select,
  Option,
  Divider,
  Switch
} from '@mui/joy';
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CATEGORIES, GET_ADMIN_TAGS, GET_NEWS_LIST } from '../graphql/queries';
import {
  CREATE_CATEGORY,
  UPDATE_CATEGORY,
  DELETE_CATEGORY,
  CREATE_TAG,
  UPDATE_TAG,
  DELETE_TAG,
  TOGGLE_TAG,
  UPDATE_NEWS_STATUS
} from '../graphql/mutations';
import { useTranslation } from 'react-i18next';
import SearchAndFilter from './SearchAndFilter';
import Pagination from './Pagination';

export default function ContentManagement() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('categories');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'create', 'edit', 'delete'
  const [modalEntity, setModalEntity] = useState(''); // 'category', 'tag', 'news'
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState(null);

  // Archive tab state for search/filter/paging
  const [archiveFilters, setArchiveFilters] = useState({
    search: '',
    categoryId: '',
    tagId: '',
    sortBy: 'newest',
  });
  const [archivePage, setArchivePage] = useState(1);
  const archivePerPage = 10;

  // GraphQL hooks
  const { data: categoriesData, loading: categoriesLoading, refetch: refetchCategories } = useQuery(GET_CATEGORIES);
  const { data: tagsData, loading: tagsLoading, refetch: refetchTags } = useQuery(GET_ADMIN_TAGS);
  const { data: newsData, loading: newsLoading, refetch: refetchNews } = useQuery(GET_NEWS_LIST);

  // Mutations
  const [createCategory] = useMutation(CREATE_CATEGORY);
  const [updateCategory] = useMutation(UPDATE_CATEGORY);
  const [deleteCategory] = useMutation(DELETE_CATEGORY);
  const [createTag] = useMutation(CREATE_TAG);
  const [updateTag] = useMutation(UPDATE_TAG);
  const [deleteTag] = useMutation(DELETE_TAG);
  const [toggleTag] = useMutation(TOGGLE_TAG);
  const [updateNewsStatus] = useMutation(UPDATE_NEWS_STATUS);

  const categories = categoriesData?.categories || [];
  const tags = tagsData?.adminTags || [];
  const allNews = newsData?.newsList || [];

  // Debug logging


  // Filter published news for archiving and archived news for display
  const publishedNews = allNews.filter(news => news.status?.toLowerCase() === 'published');
  const archivedNews = allNews.filter(news => news.status?.toLowerCase() === 'archived');
  const handleOpenModal = (type, entity, item = null) => {
    setModalType(type);
    setModalEntity(entity);
    setSelectedItem(item);
    setMessage(null);

    if (type === 'edit' && item) {
      if (entity === 'category') {
        setFormData({ name: item.name, description: item.description || '' });
      } else if (entity === 'tag') {
        setFormData({ name: item.name });
      }
    } else {
      setFormData({});
    }

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalType('');
    setModalEntity('');
    setSelectedItem(null);
    setFormData({});
    setMessage(null);
  };

  const handleToggleTag = async (tag) => {
    try {
      const result = await toggleTag({
        variables: { id: parseInt(tag.id) }
      });

      if (result.data?.toggleTag?.success) {
        await refetchTags();
        const newStatus = result.data.toggleTag.tag.isActive ? 'activated' : 'deactivated';
        setMessage( {type: 'success', text: `Tag "${tag.name}" ${newStatus} successfully!`});
        // Clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage({type: 'error', text:`Failed to toggle tag: ${result.data?.toggleTag?.errors?.join(', ') || 'Unknown error'}`});
      }
    } catch (error) {
      console.error('Toggle tag error:', error);
      setMessage({type: 'error', text: 'An error occurred while toggling the tag.'});
    }
  };

  const handleSubmit = async () => {
    try {
      let result;

      if (modalEntity === 'category') {
        if (modalType === 'create') {
          result = await createCategory({
            variables: { name: formData.name, description: formData.description }
          });
          if (result.data?.createCategory?.success) {
            await refetchCategories();
            setMessage({type: 'success', text:'Category created successfully!'});
          }
        } else if (modalType === 'edit') {
          result = await updateCategory({
            variables: {
              id: parseInt(selectedItem.id),
              name: formData.name,
              description: formData.description
            }
          });
          if (result.data?.updateCategory?.success) {
            await refetchCategories();
            setMessage({type: 'success', text:'Category updated successfully!'});
          }
        } else if (modalType === 'delete') {
          result = await deleteCategory({
            variables: { id: parseInt(selectedItem.id) }
          });
          if (result.data?.deleteCategory?.success) {
            await refetchCategories();
            setMessage({type: 'success', text:'Category deleted successfully!'});
          }
        }
      } else if (modalEntity === 'tag') {
        if (modalType === 'create') {
          const slug = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          result = await createTag({
            variables: { name: formData.name, slug: slug }
          });
          if (result.data?.createTag?.success) {
            await refetchTags();
            setMessage({type: 'success', text:'Tag created successfully!'});
          }
        } else if (modalType === 'edit') {
          result = await updateTag({
            variables: {
              id: parseInt(selectedItem.id),
              name: formData.name
            }
          });
          if (result.data?.updateTag?.success) {
            await refetchTags();
            setMessage({type: 'success', text:'Tag updated successfully!'});
          }
        } else if (modalType === 'toggle') {
          result = await toggleTag({
            variables: { id: parseInt(selectedItem.id) }
          });
          if (result.data?.toggleTag?.success) {
            await refetchTags();
            const newStatus = result.data.toggleTag.tag.isActive ? 'activated' : 'deactivated';
            setMessage({type: 'success', text:`Tag ${newStatus} successfully!`});
          }
        }
      } else if (modalEntity === 'news') {
        if (modalType === 'archive') {
          result = await updateNewsStatus({
            variables: {
              id: parseInt(selectedItem.id),
              status: 'archived',
              reviewComment: 'Archived by admin'
            }
          });
          if (result.data?.updateNewsStatus?.success) {
            await refetchNews();
            setMessage({type: 'success', text:'Article archived successfully!'});
          }
        } else if (modalType === 'unarchive') {
          result = await updateNewsStatus({
            variables: {
              id: parseInt(selectedItem.id),
              status: 'published',
              reviewComment: 'Restored from archive by admin'
            }
          });
          if (result.data?.updateNewsStatus?.success) {
            await refetchNews();
            setMessage({type: 'success', text:'Article restored successfully!'});
          }
        // } else if (modalType === 'delete') {
        //   // For now, we'll set status to 'deleted' instead of actually deleting
        //   result = await updateNewsStatus({
        //     variables: {
        //       id: parseInt(selectedItem.id),
        //       status: 'deleted',
        //       reviewComment: 'Permanently deleted by admin'
        //     }
        //   });
        //   if (result.data?.updateNewsStatus?.success) {
        //     await refetchNews();
        //     setMessage({type: 'success', text:'Article deleted successfully!'});
        //   }
        }
      }

      if (result?.data) {
        const errorField = Object.values(result.data)[0];
        if (errorField?.errors?.length > 0) {
          setMessage({type: 'error', text:errorField.errors.join(', ')});
        } else {
          setTimeout(() => handleCloseModal(), 1500);
        }
      }
    } catch (error) {
      console.error('Operation error:', error);
      setMessage({type: 'error', text:'An error occurred. Please try again.'});
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error, dateString);
      return 'Invalid Date';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'published': return 'success';
      case 'archived': return 'neutral';
      case 'draft': return 'warning';
      case 'pending': return 'primary';
      case 'rejected': return 'danger';
      default: return 'neutral';
    }
  };

  // Filtering and sorting logic for published/archived news
  const filterAndSortNews = (newsList) => {
    let filtered = [...newsList];
    // Search by title
    if (archiveFilters.search) {
      filtered = filtered.filter(n => n.title?.toLowerCase().includes(archiveFilters.search.toLowerCase()));
    }
    // Filter by category
    if (archiveFilters.categoryId) {
      filtered = filtered.filter(n => n.category?.id?.toString() === archiveFilters.categoryId.toString());
    }
    // Filter by tag (if tags are available on news)
    if (archiveFilters.tagId) {
      filtered = filtered.filter(n => n.tags?.some(tag => tag.id?.toString() === archiveFilters.tagId.toString()));
    }
    // Sort
    switch (archiveFilters.sortBy) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'title_asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title_desc':
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'author_asc':
        filtered.sort((a, b) => {
          const aName = `${a.author?.firstName || ''} ${a.author?.lastName || ''}`.trim();
          const bName = `${b.author?.firstName || ''} ${b.author?.lastName || ''}`.trim();
          return aName.localeCompare(bName);
        });
        break;
      case 'author_desc':
        filtered.sort((a, b) => {
          const aName = `${a.author?.firstName || ''} ${a.author?.lastName || ''}`.trim();
          const bName = `${b.author?.firstName || ''} ${b.author?.lastName || ''}`.trim();
          return bName.localeCompare(aName);
        });
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }
    return filtered;
  };

  // Published
  const filteredPublished = filterAndSortNews(publishedNews);
  const publishedTotal = filteredPublished.length;
  const publishedTotalPages = Math.ceil(publishedTotal / archivePerPage);
  const publishedStart = (archivePage - 1) * archivePerPage;
  const publishedEnd = publishedStart + archivePerPage;
  const publishedPageNews = filteredPublished.slice(publishedStart, publishedEnd);

  // Archived
  const filteredArchived = filterAndSortNews(archivedNews);
  const archivedTotal = filteredArchived.length;
  const archivedTotalPages = Math.ceil(archivedTotal / archivePerPage);
  const archivedStart = (archivePage - 1) * archivePerPage;
  const archivedEnd = archivedStart + archivePerPage;
  const archivedPageNews = filteredArchived.slice(archivedStart, archivedEnd);

  // Handlers
  const handleArchiveSearch = (searchTerm) => {
    setArchiveFilters(prev => ({ ...prev, search: searchTerm }));
    setArchivePage(1);
  };
  const handleArchiveFilter = (filters) => {
    setArchiveFilters(filters);
    setArchivePage(1);
  };
  const handleArchivePageChange = (page) => {
    setArchivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box>
      <Typography level="h3" sx={{ mb: 3, color: 'var(--joy-palette-text-primary)' }}>
        {t('contentManagement.title')}
      </Typography>

      {/* Tab Navigation */}
      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        <Button
          variant={activeTab === 'categories' ? 'solid' : 'outlined'}
          size="sm"
          onClick={() => setActiveTab('categories')}
        >
          {t('contentManagement.categoriesTab')}
        </Button>
        <Button
          variant={activeTab === 'tags' ? 'solid' : 'outlined'}
          size="sm"
          onClick={() => setActiveTab('tags')}
        >
          {t('contentManagement.tagsTab')}
        </Button>
        <Button
          variant={activeTab === 'archive' ? 'solid' : 'outlined'}
          size="sm"
          onClick={() => setActiveTab('archive')}
        >
          {t('contentManagement.archiveTab')}
        </Button>
      </Stack>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography level="h4">{t('contentManagement.categories')} ({categories.length})</Typography>
              <Button
                variant="solid"
                size="sm"
                onClick={() => handleOpenModal('create', 'category')}
              >
                {t('contentManagement.addCategory')}
              </Button>
            </Box>

            {categoriesLoading ? (
              <Box textAlign="center" py={4}>
                <CircularProgress />
              </Box>
            ) : categories.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography level="body1" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
                  {t('contentManagement.noCategories')}
                </Typography>
              </Box>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <th>{t('contentManagement.tableTitle')}</th>
                    <th>{t('contentManagement.categoryDescription')}</th>
                    <th>{t('contentManagement.categoryArticles')}</th>
                    <th>{t('contentManagement.categoryCreated')}</th>
                    <th>{t('contentManagement.categoryActions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td>
                        <Typography level="body-sm" sx={{ fontWeight: 'md' }}>
                          {category.name}
                        </Typography>
                        <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                          /{category.slug}
                        </Typography>
                      </td>
                      <td>
                        <Typography level="body-sm">
                          {category.description || t('contentManagement.noDescription')}
                        </Typography>
                      </td>
                      <td>
                        <Chip size="sm" variant="soft">
                          {category.articleCount ?? 0}
                        </Chip>
                      </td>
                      <td>
                        <Typography level="body-sm">
                          {formatDate(category.createdAt)}
                        </Typography>
                      </td>
                      <td>
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="sm"
                            variant="outlined"
                            onClick={() => handleOpenModal('edit', 'category', category)}
                          >
                            {t('contentManagement.edit')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outlined"
                            color="danger"
                            onClick={() => handleOpenModal('delete', 'category', category)}
                          >
                            {t('contentManagement.delete')}
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
      )}

      {/* Tags Tab */}
      {activeTab === 'tags' && (
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography level="h4">{t('contentManagement.tags')} ({tags.length})</Typography>
              <Button
                variant="solid"
                size="sm"
                onClick={() => handleOpenModal('create', 'tag')}
              >
                {t('contentManagement.addTag')}
              </Button>
            </Box>

            {/* Success/Error Message Display */}
            {message && (
              <Alert
                color={message.type==='success' ? 'success' : 'danger'}
                sx={{ mb: 3 }}
                onClose={() => setMessage(null)}
              >
                {message.text}
              </Alert>
            )}

            {tagsLoading ? (
              <Box textAlign="center" py={4}>
                <CircularProgress />
              </Box>
            ) : tags.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography level="body1" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
                  {t('contentManagement.noTags')}
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {tags.map((tag) => (
                  <Grid key={tag.id} xs={12} sm={6} md={4}>
                    <Card
                      variant="soft"
                      size="sm"
                      sx={{
                        opacity: tag.isActive ? 1 : 0.6,
                        border: tag.isActive ? '1px solid var(--joy-palette-success-300)' : '1px solid var(--joy-palette-neutral-300)'
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography level="body-md" sx={{ fontWeight: 'md' }}>
                              #{tag.name}
                            </Typography>
                            <Chip
                              size="sm"
                              variant="soft"
                              color={tag.isActive ? 'success' : 'neutral'}
                              sx={{ mt: 0.5 }}
                            >
                              {tag.isActive ? t('contentManagement.tagActive') : t('contentManagement.tagInactive')}
                            </Chip>
                          </Box>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <IconButton
                              size="sm"
                              variant="plain"
                              onClick={() => handleOpenModal('edit', 'tag', tag)}
                            >
                              ✏️
                            </IconButton>
                            <Switch
                              checked={tag.isActive}
                              onChange={() => handleToggleTag(tag)}
                              size="sm"
                              color={tag.isActive ? 'success' : 'neutral'}
                            />
                          </Stack>
                        </Box>
                        <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                          /{tag.slug}
                        </Typography>
                        <Typography level="body-xs" sx={{ color: 'text.secondary', mt: 1 }}>
                          {t('contentManagement.tagCreated')}: {formatDate(tag.createdAt)}
                        </Typography>
                        {!tag.isActive && (
                          <Typography level="body-xs" sx={{ color: 'warning.500', mt: 1, fontStyle: 'italic' }}>
                            {/* {t('contentManagement.tagToggleWarning')} */}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      )}

      {/* Archive Tab */}
      {activeTab === 'archive' && (
        <Box>
          {/* Search and Filter for Archive */}
          <SearchAndFilter
            onSearch={handleArchiveSearch}
            onFilter={handleArchiveFilter}
            categories={categories}
            tags={tags}
            loading={newsLoading}
            initialFilters={archiveFilters}
          />
          {/* Published Articles Table with Paging */}
          <Card variant="outlined" sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <Typography level="h4" sx={{ mb: 1 }}>
                  {t('contentManagement.publishedArticles')} ({publishedTotal})
                </Typography>
                <Typography level="body-sm" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
                  {t('contentManagement.publishedArticlesDesc')}
                </Typography>
              </Box>
              {newsLoading ? (
                <Box textAlign="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : publishedTotal === 0 ? (
                <Box textAlign="center" py={4}>
                  <Typography level="body1" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
                    {t('contentManagement.noPublishedArticles')}
                  </Typography>
                </Box>
              ) : (
                <>
                  <Table>
                    <thead>
                      <tr>
                        <th>{t('contentManagement.tableTitle')}</th>
                        <th>{t('contentManagement.tableAuthor')}</th>
                        <th>{t('contentManagement.tableCategory')}</th>
                        <th>{t('contentManagement.tablePublished')}</th>
                        <th>{t('contentManagement.tableActions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {publishedPageNews.map((article) => (
                        <tr key={article.id}>
                          <td>
                            <Typography level="body-sm" sx={{ fontWeight: 'md' }}>
                              {article.title}
                            </Typography>
                            <Typography level="body-xs" sx={{ color: 'text.secondary', mt: 0.5 }}>
                              {article.excerpt?.substring(0, 80)}...
                            </Typography>
                          </td>
                          <td>
                            <Typography level="body-sm">
                              {article.author?.firstName} {article.author?.lastName}
                            </Typography>
                          </td>
                          <td>
                            <Chip size="sm" variant="soft">
                              {article.category?.name || t('contentManagement.noDescription')}
                            </Chip>
                          </td>
                          <td>
                            <Typography level="body-sm">
                              {formatDate(article.publishedAt || article.createdAt)}
                            </Typography>
                          </td>
                          <td>
                            <Button
                              size="sm"
                              variant="outlined"
                              color="warning"
                              onClick={() => handleOpenModal('archive', 'news', article)}
                            >
                              {t('contentManagement.archive')}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  {/* Pagination for Published */}
                  {publishedTotalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                      <Pagination
                        currentPage={archivePage}
                        totalPages={publishedTotalPages}
                        onPageChange={handleArchivePageChange}
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
                      {t('news.showing')} {publishedStart + 1}-{Math.min(publishedEnd, publishedTotal)} {t('news.of')} {publishedTotal} {t('news.articles')}
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
          {/* Archived Articles Table with Paging */}
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <Typography level="h4" sx={{ mb: 1 }}>
                  {t('contentManagement.archivedArticles')} ({archivedTotal})
                </Typography>
                <Typography level="body-sm" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
                  {t('contentManagement.archivedArticlesDesc')}
                </Typography>
              </Box>
              {newsLoading ? (
                <Box textAlign="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : archivedTotal === 0 ? (
                <Box textAlign="center" py={4}>
                  <Typography level="body1" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
                    {t('contentManagement.noArchivedArticles')}
                  </Typography>
                  <Typography level="body-sm" sx={{ color: 'var(--joy-palette-text-tertiary)', mt: 1 }}>
                    {t('contentManagement.archivedArticlesHint')}
                  </Typography>
                </Box>
              ) : (
                <>
                  <Table>
                    <thead>
                      <tr>
                        <th>{t('contentManagement.tableTitle')}</th>
                        <th>{t('contentManagement.tableAuthor')}</th>
                        <th>{t('contentManagement.tableCategory')}</th>
                        <th>{t('contentManagement.archivedDate')}</th>
                        <th>{t('contentManagement.status')}</th>
                        <th>{t('contentManagement.tableActions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {archivedPageNews.map((article) => (
                        <tr key={article.id}>
                          <td>
                            <Typography level="body-sm" sx={{ fontWeight: 'md', opacity: 0.7 }}>
                              {article.title}
                            </Typography>
                            <Typography level="body-xs" sx={{ color: 'text.secondary', mt: 0.5 }}>
                              {article.excerpt?.substring(0, 80)}...
                            </Typography>
                          </td>
                          <td>
                            <Typography level="body-sm">
                              {article.author?.firstName} {article.author?.lastName}
                            </Typography>
                          </td>
                          <td>
                            <Chip size="sm" variant="soft" color="neutral">
                              {article.category?.name || t('contentManagement.noDescription')}
                            </Chip>
                          </td>
                          <td>
                            <Typography level="body-sm">
                              {formatDate(article.updatedAt || article.createdAt)}
                            </Typography>
                          </td>
                          <td>
                            <Chip size="sm" variant="soft" color="neutral">
                              {t('contentManagement.archived')}
                            </Chip>
                          </td>
                          <td>
                            <Stack direction="row" spacing={1}>
                              <Button
                                size="sm"
                                variant="outlined"
                                color="success"
                                onClick={() => handleOpenModal('unarchive', 'news', article)}
                              >
                                {t('contentManagement.restore')}
                              </Button>
                              <Button
                                size="sm"
                                variant="outlined"
                                color="danger"
                                onClick={() => handleOpenModal('delete', 'news', article)}
                              >
                                {t('contentManagement.deleteArticle')}
                              </Button>
                            </Stack>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  {/* Pagination for Archived */}
                  {archivedTotalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                      <Pagination
                        currentPage={archivePage}
                        totalPages={archivedTotalPages}
                        onPageChange={handleArchivePageChange}
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
                      {t('news.showing')} {archivedStart + 1}-{Math.min(archivedEnd, archivedTotal)} {t('news.of')} {archivedTotal} {t('news.articles')}
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Modal */}
      <Modal open={showModal} onClose={handleCloseModal}>
        <ModalDialog sx={{ width: 500 }}>
          <ModalClose />
          <Typography level="h4" sx={{ mb: 2 }}>
            {modalType === 'create' && `${t('contentManagement.create')} ${modalEntity}`}
            {modalType === 'edit' && `${t('contentManagement.update')} ${modalEntity}`}
            {modalType === 'delete' && modalEntity === 'news' && t('contentManagement.deleteArticle')}
            {modalType === 'delete' && modalEntity !== 'news' && `${t('contentManagement.delete')} ${modalEntity}`}
            {modalType === 'archive' && t('contentManagement.archive') + ' Article'}
            {modalType === 'unarchive' && t('contentManagement.restore') + ' Article'}
          </Typography>

          {message && (
            <Alert
              color={message.type==='success' ? 'success' : 'danger'}
              sx={{ mb: 2 }}
            >
              {message.text}
            </Alert>
          )}

          <Stack spacing={3}>
            {/* Category Form */}
            {(modalType === 'create' || modalType === 'edit') && modalEntity === 'category' && (
              <>
                <FormControl>
                  <FormLabel>{t('contentManagement.categoryName')}</FormLabel>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('contentManagement.categoryName')}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>{t('contentManagement.categoryDescription')}</FormLabel>
                  <Textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t('contentManagement.categoryDescriptionPlaceholder')}
                    minRows={3}
                  />
                </FormControl>
              </>
            )}

            {/* Tag Form */}
            {(modalType === 'create' || modalType === 'edit') && modalEntity === 'tag' && (
              <FormControl>
                <FormLabel>{t('contentManagement.tagName')}</FormLabel>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('contentManagement.tagName')}
                />
              </FormControl>
            )}

            {/* Delete Category/Tag Confirm */}
            {modalType === 'delete' && modalEntity !== 'news' && (
              <Alert color="warning">
                <Typography level="body-sm">
                  {t('contentManagement.deleteCategoryConfirm', { name: selectedItem?.name })}
                </Typography>
              </Alert>
            )}

            {/* Delete News Confirm */}
            {/* {modalType === 'delete' && modalEntity === 'news' && (
              <Alert color="danger">
                <Typography level="body-sm">
                  {t('contentManagement.deleteArticleConfirm', { title: selectedItem?.title })}
                </Typography>
                <Typography level="body-xs" sx={{ mt: 1, color: 'text.secondary' }}>
                  {t('contentManagement.deleteArticleDesc')}
                </Typography>
              </Alert>
            )} */}

            {/* Archive News Confirm */}
            {modalType === 'archive' && modalEntity === 'news' && (
              <Alert color="warning">
                <Typography level="body-sm">
                  {t('contentManagement.archiveArticleConfirm', { title: selectedItem?.title })}
                </Typography>
                <Typography level="body-xs" sx={{ mt: 1, color: 'text.secondary' }}>
                  {t('contentManagement.archiveArticleDesc')}
                </Typography>
              </Alert>
            )}

            {/* Unarchive News Confirm */}
            {modalType === 'unarchive' && modalEntity === 'news' && (
              <Alert color="success">
                <Typography level="body-sm">
                  {t('contentManagement.restoreArticleConfirm', { title: selectedItem?.title })}
                </Typography>
                <Typography level="body-xs" sx={{ mt: 1, color: 'text.secondary' }}>
                  {t('contentManagement.restoreArticleDesc')}
                </Typography>
              </Alert>
            )}

            <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
              <Button
                variant="plain"
                onClick={handleCloseModal}
              >
                {t('contentManagement.cancel')}
              </Button>
              <Button
                variant="solid"
                color={
                  modalType === 'delete' ? 'danger' :
                    modalType === 'archive' ? 'warning' :
                      modalType === 'unarchive' ? 'success' :
                        'primary'
                }
                onClick={handleSubmit}
                disabled={
                  (modalType === 'create' || modalType === 'edit') &&
                  modalEntity === 'category' && !formData.name ||
                  (modalType === 'create' || modalType === 'edit') &&
                  modalEntity === 'tag' && !formData.name
                }
              >
                {modalType === 'create' && t('contentManagement.create')}
                {modalType === 'edit' && t('contentManagement.update')}
                {modalType === 'delete' && t('contentManagement.delete')}
                {modalType === 'archive' && t('contentManagement.archive')}
                {modalType === 'unarchive' && t('contentManagement.restore')}
              </Button>
            </Stack>
          </Stack>
        </ModalDialog>
      </Modal>
    </Box>
  );
}
