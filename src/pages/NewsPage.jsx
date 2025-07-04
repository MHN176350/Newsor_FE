import { Box, Typography, Card, CardContent, Button, Grid, Chip, Input, CircularProgress, Alert } from '@mui/joy';
import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Link, useSearchParams } from 'react-router-dom';
import { GET_PUBLISHED_NEWS, GET_CATEGORIES, GET_TAGS } from '../graphql/queries';
import { formatDate, truncateText } from '../utils/constants';
import SearchAndFilter from '../components/SearchAndFilter';

export default function NewsPage() {
  const [searchParams] = useSearchParams();
  const [searchFilters, setSearchFilters] = useState({
    search: null,
    categoryId: searchParams.get('category') ? parseInt(searchParams.get('category')) : null,
    tagId: searchParams.get('tag') ? parseInt(searchParams.get('tag')) : null,
  });

  const { data: newsData, loading: newsLoading, error: newsError } = useQuery(GET_PUBLISHED_NEWS, {
    variables: searchFilters,
  });

  const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_CATEGORIES);
  const { data: tagsData, loading: tagsLoading } = useQuery(GET_TAGS);

  const publishedNews = newsData?.publishedNews || [];
  const categories = categoriesData?.categories || [];
  const tags = tagsData?.tags || [];

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
        <Typography level="h1" sx={{ mb: 2, color: 'var(--joy-palette-text-primary)' }}>
          Latest News
        </Typography>
        <Typography level="body1" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
          Stay updated with the latest stories and insights
        </Typography>
      </Box>

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
                {news.featuredImage && (
                  <Box
                    component="img"
                    src={news.featuredImage}
                    alt={news.title}
                    sx={{
                      width: '100%',
                      height: 200,
                      objectFit: 'cover',
                      borderRadius: 'var(--joy-radius-sm) var(--joy-radius-sm) 0 0',
                    }}
                  />
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
