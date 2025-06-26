import { Box, Typography, Card, CardContent, Button, Grid, Chip, Input, CircularProgress, Alert } from '@mui/joy';
import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Link, useSearchParams } from 'react-router-dom';
import { GET_PUBLISHED_NEWS, GET_CATEGORIES } from '../graphql/queries';
import { formatDate, truncateText } from '../utils/constants';

export default function NewsPage() {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  
  const categoryId = searchParams.get('category');
  const tagId = searchParams.get('tag');

  const { data: newsData, loading: newsLoading, error: newsError } = useQuery(GET_PUBLISHED_NEWS, {
    variables: {
      categoryId: categoryId ? parseInt(categoryId) : null,
      tagId: tagId ? parseInt(tagId) : null,
    },
  });

  const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_CATEGORIES);

  const publishedNews = newsData?.publishedNews || [];
  const categories = categoriesData?.categories || [];

  const filteredNews = publishedNews.filter(news =>
    news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    news.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    news.author?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    news.author?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {/* Search and Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={6}>
            <Input
              placeholder="Search news..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: '100%' }}
            />
          </Grid>
          <Grid xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                component={Link}
                to="/news"
                variant={!categoryId && !tagId ? 'solid' : 'outlined'}
                size="sm"
              >
                All
              </Button>
              {categoriesLoading ? (
                <CircularProgress size="sm" />
              ) : (
                categories.slice(0, 5).map((category) => (
                  <Button
                    key={category.id}
                    component={Link}
                    to={`/news?category=${category.id}`}
                    variant={categoryId === category.id.toString() ? 'solid' : 'outlined'}
                    size="sm"
                  >
                    {category.name}
                  </Button>
                ))
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>

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
      ) : filteredNews.length === 0 ? (
        <Card variant="outlined" sx={{ textAlign: 'center', py: 6 }}>
          <CardContent>
            <Typography level="h4" sx={{ mb: 2, color: 'var(--joy-palette-text-secondary)' }}>
              No News Found
            </Typography>
            <Typography level="body1" sx={{ color: 'var(--joy-palette-text-tertiary)' }}>
              {searchTerm ? 'Try different search terms' : 'Check back later for updates'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredNews.map((news) => (
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
                    to={`/news/${news.id}`}
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
      {filteredNews.length > 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography level="body2" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
            Showing {filteredNews.length} articles
          </Typography>
        </Box>
      )}
    </Box>
  );
}
