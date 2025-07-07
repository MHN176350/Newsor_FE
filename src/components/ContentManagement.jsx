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

export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState('categories');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'create', 'edit', 'delete'
  const [modalEntity, setModalEntity] = useState(''); // 'category', 'tag', 'news'
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');

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
  console.log('Categories data:', categories);
  console.log('Tags data:', tags);

  // Filter published news for archiving and archived news for display
  const publishedNews = allNews.filter(news => news.status === 'published');
  const archivedNews = allNews.filter(news => news.status === 'archived');

  const handleOpenModal = (type, entity, item = null) => {
    setModalType(type);
    setModalEntity(entity);
    setSelectedItem(item);
    setMessage('');
    
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
    setMessage('');
  };

  const handleToggleTag = async (tag) => {
    try {
      const result = await toggleTag({
        variables: { id: parseInt(tag.id) }
      });
      
      if (result.data?.toggleTag?.success) {
        await refetchTags();
        const newStatus = result.data.toggleTag.tag.isActive ? 'activated' : 'deactivated';
        setMessage(`Tag "${tag.name}" ${newStatus} successfully!`);
        // Clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`Failed to toggle tag: ${result.data?.toggleTag?.errors?.join(', ') || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Toggle tag error:', error);
      setMessage('An error occurred while toggling the tag.');
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
            setMessage('Category created successfully!');
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
            setMessage('Category updated successfully!');
          }
        } else if (modalType === 'delete') {
          result = await deleteCategory({
            variables: { id: parseInt(selectedItem.id) }
          });
          if (result.data?.deleteCategory?.success) {
            await refetchCategories();
            setMessage('Category deleted successfully!');
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
            setMessage('Tag created successfully!');
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
            setMessage('Tag updated successfully!');
          }
        } else if (modalType === 'toggle') {
          result = await toggleTag({
            variables: { id: parseInt(selectedItem.id) }
          });
          if (result.data?.toggleTag?.success) {
            await refetchTags();
            const newStatus = result.data.toggleTag.tag.isActive ? 'activated' : 'deactivated';
            setMessage(`Tag ${newStatus} successfully!`);
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
            setMessage('Article archived successfully!');
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
            setMessage('Article restored successfully!');
          }
        } else if (modalType === 'delete') {
          // For now, we'll set status to 'deleted' instead of actually deleting
          result = await updateNewsStatus({
            variables: { 
              id: parseInt(selectedItem.id), 
              status: 'deleted',
              reviewComment: 'Permanently deleted by admin'
            }
          });
          if (result.data?.updateNewsStatus?.success) {
            await refetchNews();
            setMessage('Article deleted successfully!');
          }
        }
      }

      if (result?.data) {
        const errorField = Object.values(result.data)[0];
        if (errorField?.errors?.length > 0) {
          setMessage(errorField.errors.join(', '));
        } else {
          setTimeout(() => handleCloseModal(), 1500);
        }
      }
    } catch (error) {
      console.error('Operation error:', error);
      setMessage('An error occurred. Please try again.');
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

  return (
    <Box>
      <Typography level="h3" sx={{ mb: 3, color: 'var(--joy-palette-text-primary)' }}>
        Content Management
      </Typography>

      {/* Tab Navigation */}
      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        <Button
          variant={activeTab === 'categories' ? 'solid' : 'outlined'}
          size="sm"
          onClick={() => setActiveTab('categories')}
        >
          📁 Categories
        </Button>
        <Button
          variant={activeTab === 'tags' ? 'solid' : 'outlined'}
          size="sm"
          onClick={() => setActiveTab('tags')}
        >
          🏷️ Tags
        </Button>
        <Button
          variant={activeTab === 'archive' ? 'solid' : 'outlined'}
          size="sm"
          onClick={() => setActiveTab('archive')}
        >
          📦 Archive News
        </Button>
      </Stack>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography level="h4">Categories ({categories.length})</Typography>
              <Button
                variant="solid"
                size="sm"
                onClick={() => handleOpenModal('create', 'category')}
              >
                 Add Category
              </Button>
            </Box>

            {categoriesLoading ? (
              <Box textAlign="center" py={4}>
                <CircularProgress />
              </Box>
            ) : categories.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography level="body1" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
                  No categories found
                </Typography>
              </Box>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Articles</th>
                    <th>Created</th>
                    <th>Actions</th>
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
                          {category.description || 'No description'}
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
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outlined"
                            color="danger"
                            onClick={() => handleOpenModal('delete', 'category', category)}
                          >
                            Delete
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
              <Typography level="h4">Tags ({tags.length})</Typography>
              <Button
                variant="solid"
                size="sm"
                onClick={() => handleOpenModal('create', 'tag')}
              >
                ➕ Add Tag
              </Button>
            </Box>

            {/* Success/Error Message Display */}
            {message && (
              <Alert 
                color={message.includes('successfully') ? 'success' : 'danger'} 
                sx={{ mb: 3 }}
                onClose={() => setMessage('')}
              >
                {message}
              </Alert>
            )}

            {tagsLoading ? (
              <Box textAlign="center" py={4}>
                <CircularProgress />
              </Box>
            ) : tags.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography level="body1" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
                  No tags found
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
                              {tag.isActive ? 'Active' : 'Inactive'}
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
                          Created: {formatDate(tag.createdAt)}
                        </Typography>
                        {!tag.isActive && (
                          <Typography level="body-xs" sx={{ color: 'warning.500', mt: 1, fontStyle: 'italic' }}>
                            ⚠️ Articles with this tag are archived
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

      {/* Archive News Tab */}
      {activeTab === 'archive' && (
        <Box>
          {/* Published Articles Section */}
          <Card variant="outlined" sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <Typography level="h4" sx={{ mb: 1 }}>
                  📰 Published Articles ({publishedNews.length})
                </Typography>
                <Typography level="body-sm" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
                  Articles that can be archived to remove from public view
                </Typography>
              </Box>

              {newsLoading ? (
                <Box textAlign="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : publishedNews.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Typography level="body1" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
                    No published articles to archive
                  </Typography>
                </Box>
              ) : (
                <Table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Category</th>
                      <th>Published</th>
                      <th>Views</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {publishedNews.map((article) => (
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
                            {article.category?.name || 'Uncategorized'}
                          </Chip>
                        </td>
                        <td>
                          <Typography level="body-sm">
                            {formatDate(article.publishedAt || article.createdAt)}
                          </Typography>
                        </td>
                        <td>
                          <Typography level="body-sm">
                            {article.viewCount || 0}
                          </Typography>
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="outlined"
                            color="warning"
                            onClick={() => handleOpenModal('archive', 'news', article)}
                          >
                            📦 Archive
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Archived Articles Section */}
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <Typography level="h4" sx={{ mb: 1 }}>
                  📦 Archived Articles ({archivedNews.length})
                </Typography>
                <Typography level="body-sm" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
                  Articles that have been archived and are hidden from public view
                </Typography>
              </Box>

              {newsLoading ? (
                <Box textAlign="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : archivedNews.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Typography level="body1" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
                    No archived articles
                  </Typography>
                  <Typography level="body-sm" sx={{ color: 'var(--joy-palette-text-tertiary)', mt: 1 }}>
                    Articles will appear here when they are archived
                  </Typography>
                </Box>
              ) : (
                <Table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Category</th>
                      <th>Archived Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {archivedNews.map((article) => (
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
                            {article.category?.name || 'Uncategorized'}
                          </Chip>
                        </td>
                        <td>
                          <Typography level="body-sm">
                            {formatDate(article.updatedAt || article.createdAt)}
                          </Typography>
                        </td>
                        <td>
                          <Chip size="sm" variant="soft" color="neutral">
                            Archived
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
                              📤 Restore
                            </Button>
                            <Button
                              size="sm"
                              variant="outlined"
                              color="danger"
                              onClick={() => handleOpenModal('delete', 'news', article)}
                            >
                              🗑️ Delete
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
        </Box>
      )}

      {/* Action Modal */}
      <Modal open={showModal} onClose={handleCloseModal}>
        <ModalDialog sx={{ width: 500 }}>
          <ModalClose />
          <Typography level="h4" sx={{ mb: 2 }}>
            {modalType === 'create' && `Create ${modalEntity}`}
            {modalType === 'edit' && `Edit ${modalEntity}`}
            {modalType === 'delete' && modalEntity === 'news' && 'Delete Article'}
            {modalType === 'delete' && modalEntity !== 'news' && `Delete ${modalEntity}`}
            {modalType === 'archive' && 'Archive Article'}
            {modalType === 'unarchive' && 'Restore Article'}
          </Typography>

          {message && (
            <Alert 
              color={message.includes('success') ? 'success' : 'danger'} 
              sx={{ mb: 2 }}
            >
              {message}
            </Alert>
          )}

          <Stack spacing={3}>
            {/* Create/Edit Forms */}
            {(modalType === 'create' || modalType === 'edit') && modalEntity === 'category' && (
              <>
                <FormControl>
                  <FormLabel>Category Name</FormLabel>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter category name"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Description (Optional)</FormLabel>
                  <Textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter category description"
                    minRows={3}
                  />
                </FormControl>
              </>
            )}

            {(modalType === 'create' || modalType === 'edit') && modalEntity === 'tag' && (
              <FormControl>
                <FormLabel>Tag Name</FormLabel>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter tag name"
                />
              </FormControl>
            )}

            {/* Delete Confirmation */}
            {modalType === 'delete' && modalEntity !== 'news' && (
              <Alert color="warning">
                <Typography level="body-sm">
                  Are you sure you want to delete "{selectedItem?.name}"? This action cannot be undone.
                </Typography>
              </Alert>
            )}

            {/* Delete News Confirmation */}
            {modalType === 'delete' && modalEntity === 'news' && (
              <Alert color="danger">
                <Typography level="body-sm">
                  Are you sure you want to permanently delete "{selectedItem?.title}"? This action cannot be undone.
                </Typography>
                <Typography level="body-xs" sx={{ mt: 1, color: 'text.secondary' }}>
                  This will permanently remove the article from the system.
                </Typography>
              </Alert>
            )}

            {/* Archive Confirmation */}
            {modalType === 'archive' && modalEntity === 'news' && (
              <Alert color="warning">
                <Typography level="body-sm">
                  Are you sure you want to archive "{selectedItem?.title}"? This will remove it from public view.
                </Typography>
                <Typography level="body-xs" sx={{ mt: 1, color: 'text.secondary' }}>
                  You can restore it later if needed.
                </Typography>
              </Alert>
            )}

            {/* Unarchive Confirmation */}
            {modalType === 'unarchive' && modalEntity === 'news' && (
              <Alert color="success">
                <Typography level="body-sm">
                  Restore "{selectedItem?.title}" and make it publicly visible again?
                </Typography>
                <Typography level="body-xs" sx={{ mt: 1, color: 'text.secondary' }}>
                  This will publish the article and make it visible to readers.
                </Typography>
              </Alert>
            )}

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
              <Button
                variant="plain"
                onClick={handleCloseModal}
              >
                Cancel
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
                {modalType === 'create' && 'Create'}
                {modalType === 'edit' && 'Update'}
                {modalType === 'delete' && 'Delete'}
                {modalType === 'archive' && 'Archive'}
                {modalType === 'unarchive' && 'Restore'}
              </Button>
            </Stack>
          </Stack>
        </ModalDialog>
      </Modal>
    </Box>
  );
}
