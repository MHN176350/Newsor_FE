import { Box, Typography, Button, Card, CardContent, Chip, Grid, Stack, CircularProgress, Alert } from '@mui/joy';
import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { GET_PUBLISHED_NEWS, GET_CATEGORIES, GET_TAGS } from '../graphql/queries';
import { formatDate, truncateText, API_ENDPOINTS } from '../utils/constants';
import { useTranslation } from 'react-i18next';
import SearchAndFilter from '../components/SearchAndFilter';

export default function HomePage() {
  const [searchFilters, setSearchFilters] = useState({
    search: null,
    categoryId: null,
    tagId: null,
    sortBy: 'newest',
  });
  const { t } = useTranslation();

  const { data: newsData, loading: newsLoading, error: newsError, refetch: refetchNews } = useQuery(GET_PUBLISHED_NEWS, {
    variables: searchFilters,
  });
  const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_CATEGORIES);
  const { data: tagsData, loading: tagsLoading } = useQuery(GET_TAGS);

  const publishedNews = newsData?.publishedNews || [];
  const categories = categoriesData?.categories || [];
  const tags = tagsData?.tags || [];

  // Client-side sorting function
  const sortNews = (news, sortBy) => {
    const sortedNews = [...news];
    
    switch (sortBy) {
      case 'oldest':
        return sortedNews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'title_asc':
        return sortedNews.sort((a, b) => a.title.localeCompare(b.title));
      case 'title_desc':
        return sortedNews.sort((a, b) => b.title.localeCompare(a.title));
      case 'author_asc':
        return sortedNews.sort((a, b) => {
          const aName = `${a.author?.firstName || ''} ${a.author?.lastName || ''}`.trim();
          const bName = `${b.author?.firstName || ''} ${b.author?.lastName || ''}`.trim();
          return aName.localeCompare(bName);
        });
      case 'author_desc':
        return sortedNews.sort((a, b) => {
          const aName = `${a.author?.firstName || ''} ${a.author?.lastName || ''}`.trim();
          const bName = `${b.author?.firstName || ''} ${b.author?.lastName || ''}`.trim();
          return bName.localeCompare(aName);
        });
      case 'newest':
      default:
        return sortedNews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  };

  // Apply sorting to published news
  const sortedNews = sortNews(publishedNews, searchFilters.sortBy);

  const handleSearch = (searchTerm) => {
    setSearchFilters(prev => ({ ...prev, search: searchTerm || null }));
  };

  const handleFilter = (filters) => {
    setSearchFilters(filters);
  };

  if (newsError) {
    console.error('GraphQL Error:', newsError);
  }

  return (
    <Box sx={{ bgcolor: 'background.body', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          textAlign: 'center',
          py: 6,
          px: 4,
          bgcolor: 'background.surface',
          borderRadius: '12px',
          border: '1px solid',
          borderColor: 'neutral.200',
          mb: 4,
        }}
      >
        <Typography 
          level="h1" 
          sx={{ 
            mb: 2, 
            color: 'text.primary',
            fontSize: { xs: '2rem', md: '3rem' }
          }}
        >
          {t('app.welcome')}
        </Typography>
        <Typography 
          level="body-lg" 
          sx={{ 
            mb: 3, 
            color: 'text.secondary',
            maxWidth: '600px',
            mx: 'auto'
          }}
        >
          {t('app.subtitle')}
        </Typography>
        
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          sx={{ justifyContent: 'center', mt: 4 }}
        >
          <Button
            component={Link}
            to="/news"
            size="lg"
            variant="solid"
            sx={{
              bgcolor: 'primary.600',
              color: 'white',
              '&:hover': { bgcolor: 'primary.700' }
            }}
          >
            {t('app.readLatestNews')}
          </Button>
          <Button
            component={Link}
            to="/register"
            size="lg"
            variant="outlined"
            sx={{
              borderColor: 'neutral.300',
              color: 'text.primary',
              '&:hover': { borderColor: 'primary.400', bgcolor: 'neutral.50' }
            }}
          >
            {t('app.joinCommunity')}
          </Button>
        </Stack>
      </Box>

      {/* Categories Section */}
      {!categoriesLoading && categories.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography 
            level="h3" 
            sx={{ 
              mb: 3, 
              color: 'text.primary',
              fontWeight: 600
            }}
          >
            {t('app.browseByCategory')}
          </Typography>
          <Stack 
            direction="row" 
            spacing={1} 
            sx={{ 
              flexWrap: 'wrap', 
              gap: 1,
              '& > *': { mb: 1 }
            }}
          >
            {categories.map((category) => (
              <Chip
                key={category.id}
                variant="outlined"
                component={Link}
                to={`/news?category=${category.slug}`}
                sx={{
                  textDecoration: 'none',
                  borderColor: 'neutral.300',
                  color: 'text.secondary',
                  bgcolor: 'background.body',
                  '&:hover': {
                    bgcolor: 'neutral.100',
                    borderColor: 'primary.400',
                    color: 'text.primary'
                  },
                }}
              >
                {category.name}
              </Chip>
            ))}
          </Stack>
        </Box>
      )}

      {/* Latest News Section */}
      <Box>
        <Typography 
          level="h3" 
          sx={{ 
            mb: 3, 
            color: 'text.primary',
            fontWeight: 600
          }}
        >
          {t('app.latestNews')}
        </Typography>

        {/* Search and Filter Component */}
        <SearchAndFilter
          onSearch={handleSearch}
          onFilter={handleFilter}
          categories={categories}
          tags={tags}
          loading={newsLoading}
          initialFilters={searchFilters}
        />

        {newsLoading && (
          <Card variant="outlined" sx={{ bgcolor: 'background.surface' }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography level="body-md" sx={{ color: 'text.secondary' }}>
                {t('news.loading')}
              </Typography>
            </CardContent>
          </Card>
        )}

        {newsError && (
          <Card 
            variant="outlined" 
            sx={{ 
              mb: 3,
              bgcolor: '#fef3c7',
              borderColor: '#f59e0b'
            }}
          >
            <CardContent>
              <Typography level="body-md" sx={{ color: '#92400e' }}>
                {t('news.error')} {API_ENDPOINTS.GRAPHQL}
              </Typography>
              <Typography level="body-sm" sx={{ mt: 1, color: '#b45309' }}>
                {t('common.error')}: {newsError.message}
              </Typography>
            </CardContent>
          </Card>
        )}

        {!newsLoading && !newsError && publishedNews.length === 0 && (
          <Card 
            variant="outlined" 
            sx={{ 
              bgcolor: 'background.surface',
              borderColor: 'neutral.200'
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Typography 
                level="h4" 
                sx={{ 
                  mb: 2, 
                  color: 'text.primary' 
                }}
              >
                {t('news.noNews')}
              </Typography>
              <Typography level="body-md" sx={{ color: 'text.secondary' }}>
                {t('app.checkBackLater')}
              </Typography>
            </CardContent>
          </Card>
        )}

        {sortedNews.length > 0 && (
          <Grid container spacing={3}>
            {sortedNews.slice(0, 6).map((article) => (
              <Grid key={article.id} xs={12} sm={6} md={4}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'background.surface',
                    borderColor: 'neutral.200',
                    '&:hover': {
                      boxShadow: '0 4px 12px 0 rgb(0 0 0 / 0.1)',
                      transform: 'translateY(-2px)',
                      borderColor: 'primary.300',
                      transition: 'all 0.2s ease-in-out',
                    },
                  }}
                >
                  {article.featuredImage && (
                    <Box
                      sx={{
                        width: '100%',
                        height: 200,
                        backgroundImage: `url(${article.featuredImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: '8px 8px 0 0',
                      }}
                    />
                  )}
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                    <Box sx={{ mb: 2 }}>
                      <Chip 
                        size="sm" 
                        variant="soft"
                        sx={{
                          bgcolor: 'primary.100',
                          color: 'primary.700',
                          fontSize: '0.75rem'
                        }}
                      >
                        {article.category.name}
                      </Chip>
                    </Box>
                    
                    <Typography
                      level="title-md"
                      component={Link}
                      to={`/news/${article.slug}`}
                      sx={{
                        textDecoration: 'none',
                        color: 'text.primary',
                        mb: 2,
                        fontWeight: 600,
                        '&:hover': { color: 'primary.600' },
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {article.title}
                    </Typography>
                    
                    <Typography
                      level="body-sm"
                      sx={{ 
                        color: 'text.secondary', 
                        mb: 3, 
                        flex: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {article.excerpt}
                    </Typography>
                    
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 'auto',
                        pt: 2,
                        borderTop: '1px solid',
                        borderColor: 'neutral.200',
                      }}
                    >
                      <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                        {t('news.by')} {article.author.firstName} {article.author.lastName}
                      </Typography>
                      <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                        {new Date(article.publishedAt || article.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {sortedNews.length > 6 && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              component={Link}
              to="/news"
              variant="outlined"
              size="lg"
              sx={{
                borderColor: 'neutral.300',
                color: 'text.primary',
                '&:hover': { borderColor: 'primary.400', bgcolor: 'neutral.50' }
              }}
            >
              {t('app.viewAllNews')}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
