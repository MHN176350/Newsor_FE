import { Box, Typography, Card, CardContent, Button, Grid, Chip, Input, CircularProgress, Alert, Stack } from '@mui/joy';
import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../core/presentation/hooks/useAuth';
import { GET_PUBLISHED_NEWS, GET_CATEGORIES, GET_TAGS } from '../graphql/queries';
import { formatDate, truncateText } from '../utils/constants';
import SearchAndFilter from '../components/SearchAndFilter';
import { processImageUrlForDisplay } from '../utils/cloudinaryUtils';

export default function NewsPage() {
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [searchFilters, setSearchFilters] = useState({
    search: null,
    categoryId: null,
    tagId: searchParams.get('tag') ? parseInt(searchParams.get('tag')) : null,
  });

  // Fetch categories to find ID by slug
  const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_CATEGORIES);
  const { data: tagsData, loading: tagsLoading } = useQuery(GET_TAGS);
  const categories = categoriesData?.categories || [];
  const tags = tagsData?.tags || [];

  // Update search filters when URL parameters change
  useEffect(() => {
    const categorySlug = searchParams.get('category');
    if (categorySlug && categories.length > 0) {
      const category = categories.find(cat => cat.slug === categorySlug);
      if (category) {
        setSearchFilters(prev => ({ ...prev, categoryId: parseInt(category.id) }));
      }
    } else {
      setSearchFilters(prev => ({ ...prev, categoryId: null }));
    }
  }, [searchParams, categories]);

  const { data: newsData, loading: newsLoading, error: newsError } = useQuery(GET_PUBLISHED_NEWS, {
    variables: searchFilters,
    onCompleted: (data) => {
      console.log('News data loaded:', data);
      if (data?.publishedNews) {
        data.publishedNews.forEach((news, index) => {
          if (news.featuredImageUrl) {
            console.log(`Article ${index} - Image URL:`, news.featuredImageUrl);
          }
        });
      }
    },
    onError: (error) => {
      console.error('News query error:', error);
    }
  });

  const publishedNews = newsData?.publishedNews || [];

  // Check if user can create articles
  const userRole = user?.profile?.role?.toLowerCase();
  const canCreateArticles = isAuthenticated && ['writer', 'manager', 'admin'].includes(userRole);

  const handleSearch = (searchTerm) => {
    setSearchFilters(prev => ({ ...prev, search: searchTerm || null }));
  };

  const handleFilter = (filters) => {
    setSearchFilters(filters);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box>
            <Typography level="h1" sx={{ mb: 2, color: 'var(--joy-palette-text-primary)' }}>
              Latest News
            </Typography>
            <Typography level="body1" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
              Stay updated with the latest stories and insights
            </Typography>
          </Box>
          {canCreateArticles && (
            <Button
              component={Link}
              to="/news/create"
              variant="solid"
              sx={{ mt: 1 }}
            >
              ✍️ Create Article
            </Button>
          )}
        </Stack>
      </Box>
{/* 
      Filter Indicator
      {searchFilters.tagId && (
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography level="body2" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
              Filtered by tag:
            </Typography>
            <Chip 
              size="sm" 
              variant="soft" 
              color="primary"
              endDecorator={
                <Button
                  size="sm"
                  variant="plain"
                  color="neutral"
                  component={Link}
                  to="/news"
                  sx={{ minHeight: 'auto', p: 0.5 }}
                >
                  ✕
                </Button>
              }
            >
              #{tags.find(tag => tag.id === searchFilters.tagId.toString())?.name || 'Unknown Tag'}
            </Chip>
          </Stack>
        </Box>
      )} */}

      {/* Search and Filter Component */}
      <SearchAndFilter
        onSearch={handleSearch}
        onFilter={handleFilter}
        categories={categories}
        tags={tags}
        loading={newsLoading}
        initialFilters={searchFilters}
      />

      {/* News Grid */}
      {newsError && (
        <Alert color="warning" sx={{ mb: 3 }}>
          Unable to load news. Please check your connection to the backend server.
        </Alert>
      )}

      {newsLoading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size="lg" />
        </Box>
      ) : publishedNews.length === 0 ? (
        <Card variant="outlined" sx={{ textAlign: 'center', py: 6 }}>
          <CardContent>
            <Typography level="h4" sx={{ mb: 2, color: 'var(--joy-palette-text-secondary)' }}>
              No News Found
            </Typography>
            <Typography level="body1" sx={{ color: 'var(--joy-palette-text-tertiary)' }}>
              Try different search terms or filters
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {publishedNews.map((news) => (
            <Grid key={news.id} xs={12} sm={6} lg={4}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: 'var(--joy-shadow-md)',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                {news.featuredImageUrl ? (
                  <Box
                    component="img"
                    src={processImageUrlForDisplay(news.featuredImageUrl)}
                    alt={news.title}
                    onError={(e) => {
                      console.error('Failed to load image:', news.featuredImageUrl, 'Processed:', processImageUrlForDisplay(news.featuredImageUrl));
                      // Try to load a default placeholder or hide the image
                      e.target.src = '/static/images/default-news.svg';
                      e.target.onerror = () => {
                        // If default also fails, hide the image completely
                        e.target.style.display = 'none';
                      };
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully:', processImageUrlForDisplay(news.featuredImageUrl));
                    }}
                    sx={{
                      width: '100%',
                      height: 200,
                      objectFit: 'cover',
                      borderRadius: 'var(--joy-radius-sm) var(--joy-radius-sm) 0 0',
                      backgroundColor: 'var(--joy-palette-background-level2)', // Fallback background
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: 200,
                      backgroundColor: 'var(--joy-palette-background-level2)',
                      borderRadius: 'var(--joy-radius-sm) var(--joy-radius-sm) 0 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--joy-palette-text-tertiary)',
                    }}
                  >
                    📰 {/* News icon placeholder */}
                  </Box>
                )}
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography level="title-md" sx={{ mb: 1, color: 'var(--joy-palette-text-primary)' }}>
                    {news.title}
                  </Typography>
                  <Typography 
                    level="body2" 
                    sx={{ 
                      mb: 2, 
                      flexGrow: 1, 
                      color: 'var(--joy-palette-text-secondary)',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {truncateText(news.excerpt || news.content, 150)}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography level="body3" sx={{ color: 'var(--joy-palette-text-tertiary)' }}>
                      By {news.author?.firstName} {news.author?.lastName}
                    </Typography>
                    <Typography level="body3" sx={{ color: 'var(--joy-palette-text-tertiary)' }}>
                      {formatDate(news.publishedAt)}
                    </Typography>
                  </Box>
                  {news.category && (
                    <Chip 
                      size="sm" 
                      variant="soft"
                      sx={{ 
                        alignSelf: 'flex-start', 
                        mb: 2,
                        backgroundColor: 'var(--joy-palette-background-level2)',
                        color: 'var(--joy-palette-text-secondary)',
                      }}
                    >
                      {news.category.name}
                    </Chip>
                  )}
                  <Button
                    component={Link}
                    to={`/news/${news.slug}`}
                    variant="outlined"
                    size="sm"
                    fullWidth
                    sx={{
                      mt: 'auto',
                      borderColor: 'var(--joy-palette-primary-300)',
                      color: 'var(--joy-palette-primary-700)',
                      '&:hover': {
                        backgroundColor: 'var(--joy-palette-primary-50)',
                        borderColor: 'var(--joy-palette-primary-500)',
                      }
                    }}
                  >
                    Read More
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Load More */}
      {publishedNews.length > 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography level="body2" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
            Showing {publishedNews.length} articles
          </Typography>
        </Box>
      )}
    </Box>
  );
}
